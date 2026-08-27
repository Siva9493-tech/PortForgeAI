import type {
	CreatePortfolioInput,
	PortfolioRecord,
	PortfolioStatus,
	PortfolioVersion,
	UpdatePortfolioInput,
} from './portfolio-manager-types';
import {
	clonePortfolioData,
	duplicateTitle,
	generatePortfolioId,
	isPortfolioStatus,
	isoNow,
	portfolioOutputEquals,
} from './portfolio-manager-utils';
import {
	create as createPortfolioRow,
	listForUser,
	remove as removePortfolioRow,
	update as updatePortfolioRow,
	type PortfolioUpdatePatch,
} from './portfolio-repository';
import { getCurrentSession, onAuthStateChange } from '../auth';

export type PortfolioManagerListener = (records: ReadonlyArray<PortfolioRecord>) => void;

export interface PortfolioManagerStoreOptions {
	persistKey?: string;
}

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

/** Default storage key, consistent with the project's `portforge:*:v1` convention. */
const STORAGE_KEY = 'portforge:portfolios:v1';

/**
 * Tracks the most recently authenticated user id so the cache can be scoped to a
 * single account. This is what lets a fresh page load restore synchronously for
 * the right user before Supabase has answered, without ever reading another
 * account's cache.
 */
const USER_INDEX_STORAGE_KEY = 'portforge:portfolios:v1:last-user';

/** User-scoped cache key so one account's portfolios never surface for another. */
function userScopedStorageKey(userId: string): string {
	return `${STORAGE_KEY}:${userId}`;
}

interface PersistedState {
	records: PortfolioRecord[];
}

/** Validates an unknown persisted entry into a usable record. Returns null when invalid. */
function normalizePersistedRecord(value: unknown): PortfolioRecord | null {
	if (typeof value !== 'object' || value === null) {
		return null;
	}

	const entry = value as Record<string, unknown>;

	if (typeof entry.id !== 'string' || typeof entry.title !== 'string') {
		return null;
	}
	if (!isPortfolioStatus(entry.status)) {
		return null;
	}
	if (typeof entry.createdAt !== 'string' || typeof entry.updatedAt !== 'string') {
		return null;
	}
	if (entry.publishedAt !== null && typeof entry.publishedAt !== 'string') {
		return null;
	}
	if (typeof entry.currentVersion !== 'number' || entry.currentVersion < 1) {
		return null;
	}
	if (!Array.isArray(entry.versions) || entry.versions.length === 0) {
		return null;
	}

	const versions: PortfolioVersion[] = [];
	for (const raw of entry.versions) {
		if (typeof raw !== 'object' || raw === null) {
			continue;
		}
		const version = raw as Record<string, unknown>;
		if (
			typeof version.version !== 'number' ||
			typeof version.title !== 'string' ||
			typeof version.createdAt !== 'string' ||
			typeof version.data !== 'object' ||
			version.data === null
		) {
			continue;
		}
		versions.push({
			version: version.version,
			title: version.title,
			data: version.data as PortfolioVersion['data'],
			createdAt: version.createdAt,
		});
	}

	const ordered = versions
		.filter((item) => item.version >= 1)
		.sort((a, b) => a.version - b.version);

	if (ordered.length === 0) {
		return null;
	}

	const currentVersion = Math.min(Math.max(1, entry.currentVersion), ordered[ordered.length - 1].version);
	const current = ordered.find((item) => item.version === currentVersion) ?? ordered[ordered.length - 1];

	return {
		id: entry.id,
		title: entry.title,
		status: entry.status as PortfolioStatus,
		slug: typeof entry.slug === 'string' ? entry.slug : null,
		createdAt: entry.createdAt,
		updatedAt: entry.updatedAt,
		publishedAt: entry.publishedAt as string | null,
		currentVersion,
		versions: ordered,
		data: current.data,
	};
}

/**
 * The portfolio manager store is the single source of truth for portfolio
 * identity and lifecycle metadata. Content is referenced through the existing
 * `PortfolioOutput` type — no portfolio schema is duplicated here.
 *
 * It follows the project's established store conventions (class singleton,
 * `subscribe`/`notify`, guarded `localStorage` persistence) and is safe to
 * construct in any environment; at build/SSR time it stays empty, while in a
 * browser it restores the persisted collection.
 *
 * Supabase is authoritative for the authenticated user. On init (and again on
 * every auth change) the store resolves the current session, replaces its
 * in-memory collection with `repository.listForUser(userId)`, writes a
 * user-scoped cache back, and falls back to that cache (never the unscoped key)
 * when Supabase is unreachable. Create/update/delete route through
 * `portfolio-repository.ts` and only mutate cache + in-memory state after the
 * write succeeds, so a failed cloud save can never be reported as saved.
 *
 * Dependency direction:
 *   Portfolio Manager ─► PortfolioRecord ─► PortfolioOutput ─► Renderer/Preview/Export/Publish
 */
export class PortfolioManagerStore {
	private readonly persistKey: string;
	private records: PortfolioRecord[] = [];
	private readonly listeners = new Set<PortfolioManagerListener>();
	private currentUserId: string | null = null;
	private hydrationPromise: Promise<void> | null = null;
	private sessionResolved = false;

	constructor(options: PortfolioManagerStoreOptions = {}) {
		this.persistKey = options.persistKey ?? STORAGE_KEY;

		// Restore synchronously from the cache for the last known user (or the
		// legacy unscoped cache when unauthicated) so reads on first paint work
		// before Supabase answers. Then reconcile against Supabase asynchronously.
		this.currentUserId = this.readLastUser();
		this.restore();

		if (canUseStorage()) {
			onAuthStateChange(() => {
				void this.hydrate();
			});
		}
	}

	/** All managed portfolios, oldest to newest. */
	getPortfolios(): ReadonlyArray<PortfolioRecord> {
		return this.records;
	}

	/** A single portfolio by stable id, or undefined when not found. */
	getPortfolio(id: string): PortfolioRecord | undefined {
		return this.records.find((record) => record.id === id);
	}

	/** The storage key the collection is currently persisted under. */
	getPersistKey(): string {
		return this.activeStorageKey();
	}

	/**
	 * Creates a new draft portfolio, assigns a stable unique id and timestamps.
	 * For an authenticated user the record is inserted into Supabase first and
	 * the returned authoritative record is the one added to the collection. For
	 * an unauthenticated user this is purely local (existing behavior).
	 */
	async createPortfolio(input: CreatePortfolioInput): Promise<PortfolioRecord> {
		await this.ensureHydrated();
		const record = this.buildDraftRecord(input);

		if (!this.currentUserId) {
			this.records.push(record);
			this.notify();
			return record;
		}

		const authoritative = await createPortfolioRow(record, this.currentUserId).catch((error) => {
			console.error('[portfolio-store] Failed to create portfolio in Supabase.', error);
			throw error;
		});
		this.records.push(authoritative);
		this.notify();
		return authoritative;
	}

	/**
	 * Mutates a managed portfolio's lifecycle metadata (title/status/data).
	 * `createdAt` is never touched; `updatedAt` bumps only when something
	 * actually changed — a save of identical data (detected structurally) is a
	 * no-op and does not bump timestamps or record a new version. A data change
	 * records a new version snapshot. Publishing logic itself is intentionally
	 * not added here.
	 *
	 * For an authenticated user the patch is written to Supabase first; the
	 * collection is only mutated once the write succeeds, and the returned
	 * authoritative record's timestamps/status/data are adopted.
	 */
	async updatePortfolio(id: string, input: UpdatePortfolioInput): Promise<PortfolioRecord | undefined> {
		await this.ensureHydrated();
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			return undefined;
		}

		if (!this.updateHasChanges(record, input)) {
			return record;
		}

		if (!this.currentUserId) {
			const committed = this.applyUpdate(id, input);
			this.notify();
			return committed;
		}

		const patch = this.buildUpdatePatch(record, input);
		let authoritative: PortfolioRecord | null;
		try {
			authoritative = await updatePortfolioRow(id, patch);
		} catch (error) {
			console.error('[portfolio-store] Failed to update portfolio in Supabase.', error);
			return undefined;
		}
		if (!authoritative) {
			return undefined;
		}

		const committed = this.applyUpdate(id, input);
		if (committed) {
			this.adoptAuthoritativeMetadata(committed, authoritative);
			this.notify();
		}
		return committed ?? authoritative;
	}

	/**
	 * Publishes a single portfolio by persisting the resolved public slug and
	 * `published` status to Supabase FIRST, and only mutating local state once the
	 * write succeeds. Unlike `updatePortfolio` this does NOT swallow Supabase
	 * errors — the publish flow must distinguish a slug uniqueness failure (to
	 * retry with a suffixed slug) from any other failure (to report it). It
	 * returns the committed authoritative record, or throws. On throw, local
	 * state and the cache are left untouched (last-known-good is preserved).
	 */
	async publishPortfolio(id: string, slug: string): Promise<PortfolioRecord> {
		await this.ensureHydrated();
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			throw new Error('Portfolio not found.');
		}

		if (!this.currentUserId) {
			const committed = this.applyUpdate(id, { status: 'published', slug });
			if (!committed) {
				throw new Error('Portfolio not found.');
			}
			this.notify();
			return committed;
		}

		const patch = this.buildUpdatePatch(record, { status: 'published', slug });
		const authoritative = await updatePortfolioRow(id, patch);
		if (!authoritative) {
			throw new Error('Portfolio not found.');
		}

		const committed = this.applyUpdate(id, { status: 'published', slug });
		if (!committed) {
			throw new Error('Portfolio not found.');
		}
		this.adoptAuthoritativeMetadata(committed, authoritative);
		this.notify();
		return committed;
	}

	/** Removes a portfolio by stable id. Returns false when not found. */
	async removePortfolio(id: string): Promise<boolean> {
		await this.ensureHydrated();
		if (!this.currentUserId) {
			const removed = this.applyRemove(id);
			if (removed) {
				this.notify();
			}
			return removed;
		}

		const ok = await removePortfolioRow(id).catch((error) => {
			console.error('[portfolio-store] Failed to delete portfolio in Supabase.', error);
			return false;
		});
		if (!ok) {
			return false;
		}
		const removed = this.applyRemove(id);
		if (removed) {
			this.notify();
		}
		return true;
	}

	/**
	 * Creates a brand-new current version from a historical snapshot, preserving
	 * the full existing version history. The restored data is an independent
	 * deep clone — the original snapshot is never mutated. Identity and lifecycle
	 * metadata that restore must not touch (id, createdAt, status, publishedAt)
	 * are left unchanged; only updatedAt, currentVersion and the portfolio data
	 * are updated. Returns the updated record, or undefined when the portfolio or
	 * the requested version does not exist.
	 *
	 * V1 only persists the current snapshot to Supabase; version history is kept
	 * in memory/cache and refreshed from Supabase on the next hydration.
	 */
	async restorePortfolioVersion(id: string, versionNumber: number): Promise<PortfolioRecord | undefined> {
		await this.ensureHydrated();
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			return undefined;
		}
		const snapshot = record.versions.find((item) => item.version === versionNumber);
		if (!snapshot) {
			return undefined;
		}

		if (!this.currentUserId) {
			const committed = this.applyRestoreVersion(id, versionNumber);
			this.notify();
			return committed;
		}

		const patch: PortfolioUpdatePatch = {
			title: snapshot.title,
			data: clonePortfolioData(snapshot.data),
		};
		let authoritative: PortfolioRecord | null;
		try {
			authoritative = await updatePortfolioRow(id, patch);
		} catch (error) {
			console.error('[portfolio-store] Failed to restore version in Supabase.', error);
			return undefined;
		}
		if (!authoritative) {
			return undefined;
		}

		const committed = this.applyRestoreVersion(id, versionNumber);
		if (committed) {
			committed.updatedAt = authoritative.updatedAt;
			committed.title = authoritative.title;
			committed.slug = authoritative.slug;
			committed.data = authoritative.data;
			const current = committed.versions.find((version) => version.version === committed.currentVersion);
			if (current) {
				current.data = authoritative.data;
			}
			this.notify();
		}
		return committed ?? authoritative;
	}

	/**
	 * Copies an existing portfolio into a brand-new draft. Identity, timestamps
	 * and version history are all fresh — only the content is duplicated. For an
	 * authenticated user the duplicate is created in Supabase first.
	 */
	async duplicatePortfolio(id: string): Promise<PortfolioRecord | undefined> {
		await this.ensureHydrated();
		const source = this.records.find((record) => record.id === id);
		if (!source) {
			return undefined;
		}

		const draft = this.buildDuplicateRecord(source);

		if (!this.currentUserId) {
			this.records.push(draft);
			this.notify();
			return draft;
		}

		const authoritative = await createPortfolioRow(draft, this.currentUserId).catch((error) => {
			console.error('[portfolio-store] Failed to duplicate portfolio in Supabase.', error);
			return null;
		});
		if (!authoritative) {
			return undefined;
		}
		this.records.push(authoritative);
		this.notify();
		return authoritative;
	}

	/** Registers a listener notified after any change. Returns an unsubscribe function. */
	subscribe(listener: PortfolioManagerListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Reconciles the in-memory collection against Supabase for the current
	 * session. Supabase is authoritative: on success it replaces the collection
	 * and persists it to the user-scoped cache; on failure it falls back to the
	 * cached copy without destroying it. When signed out, any previous account's
	 * records are dropped and the legacy cache is used.
	 *
	 * Concurrent calls (auth listener + a mutation's `ensureHydrated`) share a
	 * single in-flight pass, so a caller can safely await the same resolution.
	 */
	hydrate(): Promise<void> {
		if (!canUseStorage()) {
			return Promise.resolve();
		}
		if (!this.hydrationPromise) {
			this.hydrationPromise = this.doHydrate().finally(() => {
				this.hydrationPromise = null;
			});
		}
		return this.hydrationPromise;
	}

	/**
	 * Ensures the session has been resolved at least once so callers (read paths
	 * and mutations alike) can decide between the Supabase and local-only paths
	 * with a hydrated collection. When the session is already known this is a
	 * no-op; otherwise it awaits one hydration pass (which also replaces the
	 * collection with the authoritative set). Read paths that look up a record by
	 * id — e.g. an editor/preview page loading a `?portfolio=` URL — should await
	 * this before `getPortfolio`, so a store that has not yet reconciled with
	 * Supabase never misreads a real record as missing.
	 */
	async ensureHydrated(): Promise<void> {
		if (!canUseStorage() || this.sessionResolved) {
			return;
		}
		await this.hydrate();
	}

	private async doHydrate(): Promise<void> {
		try {
			const { data } = await getCurrentSession();
			const userId = data.session?.user?.id ?? null;

			if (userId) {
				this.currentUserId = userId;
				this.markLastUser(userId);
				try {
					const remote = await listForUser(userId);
					this.records = remote;
				} catch (error) {
					// Supabase is authoritative but unreachable — keep the cached
					// copy intact rather than destroying valid local data.
					console.error(
						'[portfolio-store] Failed to load portfolios from Supabase; using cached copy.',
						error,
					);
					this.restore();
				}
			} else {
				// Signed out or unknown session: never surface a previous
				// account's records, and never read another user's unscoped cache.
				this.clearLastUser();
				this.currentUserId = null;
				this.records = [];
				this.restore();
			}
		} finally {
			this.sessionResolved = true;
			this.notify();
		}
	}

	/** Re-reads the persisted collection (no-op when storage is unavailable). */
	restore(): boolean {
		if (!canUseStorage()) {
			return false;
		}
		return this.restoreFrom(this.activeStorageKey());
	}

	/**
	 * Persists the collection (no-op when storage is unavailable). Guarded so a
	 * storage failure (e.g. quota or blocked access) is contained — it never
	 * throws out of a create/update and never leaves the in-memory records in a
	 * partially-persisted state. Returns false when nothing could be persisted.
	 */
	save(): boolean {
		if (!canUseStorage()) {
			return false;
		}
		try {
			const payload: PersistedState = { records: this.records };
			localStorage.setItem(this.activeStorageKey(), JSON.stringify(payload));
			return true;
		} catch {
			return false;
		}
	}

	private restoreFrom(key: string): boolean {
		const raw = localStorage.getItem(key);
		if (!raw) {
			return false;
		}

		try {
			const parsed = JSON.parse(raw) as Partial<PersistedState>;
			if (!Array.isArray(parsed.records)) {
				return false;
			}

			const restored = parsed.records
				.map(normalizePersistedRecord)
				.filter((record): record is PortfolioRecord => record !== null);

			if (restored.length === 0) {
				return false;
			}

			this.records = restored;
			return true;
		} catch {
			return false;
		}
	}

	private notify(): void {
		this.save();
		for (const listener of this.listeners) {
			listener(this.records);
		}
	}

	/** The cache key for the active (user-scoped or legacy) collection. */
	private activeStorageKey(): string {
		return this.currentUserId ? userScopedStorageKey(this.currentUserId) : this.persistKey;
	}

	private readLastUser(): string | null {
		if (!canUseStorage()) {
			return null;
		}
		try {
			const raw = localStorage.getItem(USER_INDEX_STORAGE_KEY);
			return raw && raw.trim() ? raw : null;
		} catch {
			return null;
		}
	}

	private markLastUser(userId: string): void {
		if (!canUseStorage()) {
			return;
		}
		try {
			localStorage.setItem(USER_INDEX_STORAGE_KEY, userId);
		} catch {
			// Best-effort: a blocked storage just prevents future user-scoped restores.
		}
	}

	private clearLastUser(): void {
		if (!canUseStorage()) {
			return;
		}
		try {
			localStorage.removeItem(USER_INDEX_STORAGE_KEY);
		} catch {
			// Best-effort.
		}
	}

	/** Builds a brand-new draft record, preserving the existing id/timestamp behavior. */
	private buildDraftRecord(input: CreatePortfolioInput): PortfolioRecord {
		const now = isoNow();
		const title = input.title.trim() || 'Untitled Portfolio';
		const status: PortfolioStatus = input.status === 'published' ? 'published' : 'draft';
		const snapshot: PortfolioVersion = {
			version: 1,
			title,
			data: clonePortfolioData(input.data),
			createdAt: now,
		};

		return {
			id: generatePortfolioId(),
			title,
			status,
			slug: input.data.seo?.slug ?? null,
			createdAt: now,
			updatedAt: now,
			publishedAt: status === 'published' ? now : null,
			currentVersion: 1,
			versions: [snapshot],
			data: snapshot.data,
		};
	}

	/** Builds the duplicate draft from an existing record (fresh identity/timestamps). */
	private buildDuplicateRecord(source: PortfolioRecord): PortfolioRecord {
		const now = isoNow();
		const title = duplicateTitle(
			source.title,
			this.records.map((record) => record.title)
		);
		const snapshot: PortfolioVersion = {
			version: 1,
			title,
			data: clonePortfolioData(source.data),
			createdAt: now,
		};

		return {
			id: generatePortfolioId(),
			title,
			status: 'draft',
			slug: null,
			createdAt: now,
			updatedAt: now,
			publishedAt: null,
			currentVersion: 1,
			versions: [snapshot],
			data: snapshot.data,
		};
	}

	/** True when the input would actually change the record (matches the no-op semantics). */
	private updateHasChanges(record: PortfolioRecord, input: UpdatePortfolioInput): boolean {
		const targetStatus = input.status ?? record.status;
		const hasLifecycleChange =
			input.title !== undefined && input.title.trim() !== '' && input.title.trim() !== record.title;
		const hasDataChange = input.data !== undefined && !portfolioOutputEquals(record.data, input.data);
		const hasStatusChange = targetStatus !== record.status;
		const hasSlugChange = input.slug !== undefined && input.slug !== record.slug;
		return hasDataChange || hasLifecycleChange || hasStatusChange || hasSlugChange;
	}

	/** The smallest snake_case patch (via the repository domain patch) for the input. */
	private buildUpdatePatch(record: PortfolioRecord, input: UpdatePortfolioInput): PortfolioUpdatePatch {
		const patch: PortfolioUpdatePatch = {};
		const targetStatus = input.status ?? record.status;

		if (input.title !== undefined && input.title.trim() !== '' && input.title.trim() !== record.title) {
			patch.title = input.title.trim();
		}
		if (input.data !== undefined && !portfolioOutputEquals(record.data, input.data)) {
			patch.data = clonePortfolioData(input.data);
		}
		if (input.slug !== undefined) {
			patch.slug = input.slug;
		}
		if (targetStatus !== record.status) {
			patch.status = targetStatus;
			if (targetStatus === 'published' && record.publishedAt === null) {
				patch.publishedAt = isoNow();
			}
		}

		return patch;
	}

	/**
	 * Pure local mutation for an update — mutates the record but does not notify,
	 * so the caller decides when to persist/broadcast (after Supabase succeeds).
	 */
	private applyUpdate(id: string, input: UpdatePortfolioInput): PortfolioRecord | undefined {
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			return undefined;
		}

		const now = isoNow();
		const targetStatus = input.status ?? record.status;
		const hasLifecycleChange =
			input.title !== undefined && input.title.trim() !== '' && input.title.trim() !== record.title;
		const hasDataChange = input.data !== undefined && !portfolioOutputEquals(record.data, input.data);
		const hasStatusChange = targetStatus !== record.status;
		const hasSlugChange = input.slug !== undefined && input.slug !== record.slug;

		if (hasDataChange) {
			const next = clonePortfolioData(input.data!);
			record.currentVersion = record.currentVersion + 1;
			record.versions.push({
				version: record.currentVersion,
				title: hasLifecycleChange ? input.title!.trim() : record.title,
				data: next,
				createdAt: now,
			});
			record.data = next;
		}

		if (hasLifecycleChange) {
			record.title = input.title!.trim();
		}

		if (hasStatusChange) {
			record.status = targetStatus;
		}

		if (input.slug !== undefined) {
			record.slug = input.slug;
		}

		if (hasDataChange || hasLifecycleChange || hasStatusChange || hasSlugChange) {
			if (input.status === 'published' && record.publishedAt === null) {
				record.publishedAt = now;
			}
			record.updatedAt = now;
		}

		return record;
	}

	/** Overlays the authoritative (Supabase) metadata onto a locally-mutated record. */
	private adoptAuthoritativeMetadata(record: PortfolioRecord, authoritative: PortfolioRecord): void {
		record.title = authoritative.title;
		record.status = authoritative.status;
		record.slug = authoritative.slug;
		record.updatedAt = authoritative.updatedAt;
		record.publishedAt = authoritative.publishedAt;
		record.data = authoritative.data;
		const current = record.versions.find((version) => version.version === record.currentVersion);
		if (current) {
			current.data = authoritative.data;
		}
	}

	/** Pure local mutation for a remove — does not notify. */
	private applyRemove(id: string): boolean {
		const index = this.records.findIndex((record) => record.id === id);
		if (index === -1) {
			return false;
		}
		this.records.splice(index, 1);
		return true;
	}

	/** Pure local mutation for a version restore — does not notify. */
	private applyRestoreVersion(id: string, versionNumber: number): PortfolioRecord | undefined {
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			return undefined;
		}
		const snapshot = record.versions.find((item) => item.version === versionNumber);
		if (!snapshot) {
			return undefined;
		}

		const now = isoNow();
		const restored = clonePortfolioData(snapshot.data);

		record.currentVersion = record.currentVersion + 1;
		record.versions.push({
			version: record.currentVersion,
			title: snapshot.title,
			data: restored,
			createdAt: now,
		});
		record.title = snapshot.title;
		record.data = restored;
		record.updatedAt = now;

		return record;
	}
}

/** The shared, application-wide portfolio manager singleton. */
export const portfolioManagerStore = new PortfolioManagerStore();
