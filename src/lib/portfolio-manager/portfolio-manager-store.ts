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

export type PortfolioManagerListener = (records: ReadonlyArray<PortfolioRecord>) => void;

export interface PortfolioManagerStoreOptions {
	persistKey?: string;
}

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

/** Default storage key, consistent with the project's `portforge:*:v1` convention. */
const STORAGE_KEY = 'portforge:portfolios:v1';

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
 * Dependency direction:
 *   Portfolio Manager ─► PortfolioRecord ─► PortfolioOutput ─► Renderer/Preview/Export/Publish
 */
export class PortfolioManagerStore {
	private readonly persistKey: string;
	private records: PortfolioRecord[] = [];
	private readonly listeners = new Set<PortfolioManagerListener>();

	constructor(options: PortfolioManagerStoreOptions = {}) {
		this.persistKey = options.persistKey ?? STORAGE_KEY;
		this.restore();
	}

	/** All managed portfolios, oldest to newest. */
	getPortfolios(): ReadonlyArray<PortfolioRecord> {
		return this.records;
	}

	/** A single portfolio by stable id, or undefined when not found. */
	getPortfolio(id: string): PortfolioRecord | undefined {
		return this.records.find((record) => record.id === id);
	}

	/** Creates a new draft portfolio, assigns a stable unique id and timestamps. */
	createPortfolio(input: CreatePortfolioInput): PortfolioRecord {
		const now = isoNow();
		const title = input.title.trim() || 'Untitled Portfolio';
		const status: PortfolioStatus = input.status === 'published' ? 'published' : 'draft';
		const snapshot: PortfolioVersion = {
			version: 1,
			title,
			data: clonePortfolioData(input.data),
			createdAt: now,
		};

		const record: PortfolioRecord = {
			id: generatePortfolioId(),
			title,
			status,
			createdAt: now,
			updatedAt: now,
			publishedAt: status === 'published' ? now : null,
			currentVersion: 1,
			versions: [snapshot],
			data: snapshot.data,
		};

		this.records.push(record);
		this.notify();
		return record;
	}

	/**
	 * Mutates a managed portfolio's lifecycle metadata (title/status/data).
	 * `createdAt` is never touched; `updatedAt` bumps only when something
	 * actually changed — a save of identical data (detected structurally) is a
	 * no-op and does not bump timestamps or record a new version. A data change
	 * records a new version snapshot. Publishing logic itself is intentionally
	 * not added here.
	 */
	updatePortfolio(id: string, input: UpdatePortfolioInput): PortfolioRecord | undefined {
		const record = this.records.find((entry) => entry.id === id);
		if (!record) {
			return undefined;
		}

		const now = isoNow();
		const targetStatus = input.status ?? record.status;
		const hasLifecycleChange = input.title !== undefined && input.title.trim() !== '' && input.title.trim() !== record.title;
		const hasDataChange =
			input.data !== undefined && !portfolioOutputEquals(record.data, input.data);
		const hasStatusChange = targetStatus !== record.status;

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

		if (hasDataChange || hasLifecycleChange || hasStatusChange) {
			if (input.status === 'published' && record.publishedAt === null) {
				record.publishedAt = now;
			}
			record.updatedAt = now;
			this.notify();
		}

		return record;
	}

	/** Removes a portfolio by stable id. Returns false when not found. */
	removePortfolio(id: string): boolean {
		const index = this.records.findIndex((record) => record.id === id);
		if (index === -1) {
			return false;
		}
		this.records.splice(index, 1);
		this.notify();
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
	 */
	restorePortfolioVersion(id: string, versionNumber: number): PortfolioRecord | undefined {
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

		this.notify();
		return record;
	}

	/**
	 * Copies an existing portfolio into a brand-new draft. Identity, timestamps
	 * and version history are all fresh — only the content is duplicated.
	 */
	duplicatePortfolio(id: string): PortfolioRecord | undefined {
		const source = this.records.find((record) => record.id === id);
		if (!source) {
			return undefined;
		}

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

		const record: PortfolioRecord = {
			id: generatePortfolioId(),
			title,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
			publishedAt: null,
			currentVersion: 1,
			versions: [snapshot],
			data: snapshot.data,
		};

		this.records.push(record);
		this.notify();
		return record;
	}

	/** Registers a listener notified after any change. Returns an unsubscribe function. */
	subscribe(listener: PortfolioManagerListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** Re-reads the persisted collection (no-op when storage is unavailable). */
	restore(): boolean {
		if (!canUseStorage()) {
			return false;
		}

		const raw = localStorage.getItem(this.persistKey);
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
			localStorage.setItem(this.persistKey, JSON.stringify(payload));
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
}

/** The shared, application-wide portfolio manager singleton. */
export const portfolioManagerStore = new PortfolioManagerStore();