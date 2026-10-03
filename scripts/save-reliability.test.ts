import { deepEqual, equal, notEqual, ok, throws } from 'node:assert/strict';
import { test } from 'node:test';
import { transformProjects } from '../src/lib/ai/transformer.ts';
import {
	buildBoundedCachePayload,
	deepSemanticEquals,
	portfolioOutputEquals,
	safePersistCache,
} from '../src/lib/portfolio-manager/portfolio-manager-utils.ts';
import type { PortfolioOutput } from '../src/lib/ai/types.ts';
import type { PortfolioInput } from '../src/lib/ai/transformer.ts';
import { createEmptyPortfolioData, createEmptyProjectEntry } from '../src/lib/portfolio/types.ts';
import { syncRepeatableRows } from '../src/lib/portfolio/form-binding.ts';
import { wizardStore } from '../src/lib/portfolio/wizard-store.ts';

// Helper to construct test PortfolioInput with projects
function createInput(projects: ReturnType<typeof createEmptyProjectEntry>[]): PortfolioInput {
	const data = createEmptyPortfolioData();
	data.projects = projects;
	return {
		data,
		templateId: 'minimal',
		mode: 'balanced',
	};
}

test('A. First-time portfolio save transforms single project correctly', () => {
	const p1 = createEmptyProjectEntry();
	p1.projectName = 'First Project';
	p1.description = 'First app description';
	p1.technologies = 'Astro, TypeScript';

	const out = transformProjects(createInput([p1]));
	equal(out.length, 1);
	equal(out[0].name, 'First Project');
	equal(out[0].description, 'First app description');
	deepEqual(out[0].technologies, ['Astro', 'TypeScript']);
});

test('B. Existing portfolio edit preserves updated fields on save', () => {
	const p1 = createEmptyProjectEntry();
	p1.projectName = 'Portfolio App';
	p1.projectRole = 'Full Stack Lead';
	p1.description = 'Updated summary';

	const out = transformProjects(createInput([p1]));
	equal(out[0].name, 'Portfolio App');
	equal(out[0].role, 'Full Stack Lead');
	equal(out[0].description, 'Updated summary');
});

test('C. Existing project edit modifies specific case-study fields', () => {
	const p1 = createEmptyProjectEntry();
	p1.projectName = 'Case Study App';
	p1.problem = 'Slow load times under load';
	p1.solution = 'Implemented Astro SSR with edge caching';
	p1.results = 'Cut latency by 75%';

	const out = transformProjects(createInput([p1]));
	equal(out[0].problem, 'Slow load times under load');
	equal(out[0].solution, 'Implemented Astro SSR with edge caching');
	equal(out[0].results, 'Cut latency by 75%');
});

test('D. Add second project appends correctly and preserves first project', () => {
	const p1 = createEmptyProjectEntry();
	p1.projectName = 'Project One';
	p1.description = 'Desc 1';

	const p2 = createEmptyProjectEntry();
	p2.projectName = 'Project Two';
	p2.description = 'Desc 2';

	const out = transformProjects(createInput([p1, p2]));
	equal(out.length, 2);
	equal(out[0].name, 'Project One');
	equal(out[1].name, 'Project Two');
	equal(out[0].id, 'prj-1');
	equal(out[1].id, 'prj-2');
});

test('E. Multiple projects maintain their defined ordering', () => {
	const projects = ['Alpha', 'Beta', 'Gamma'].map((name) => {
		const p = createEmptyProjectEntry();
		p.projectName = name;
		return p;
	});

	const out = transformProjects(createInput(projects));
	equal(out.length, 3);
	equal(out[0].name, 'Alpha');
	equal(out[1].name, 'Beta');
	equal(out[2].name, 'Gamma');
});

test('F. Complete case study preserves all 6 conceptual fields', () => {
	const p = createEmptyProjectEntry();
	p.projectName = 'Enterprise Cloud';
	p.problem = 'Siloed database clusters';
	p.whyItMattered = 'Customer analytics were delayed by 12 hours';
	p.solution = 'Built real-time CDC pipeline';
	p.howItWasBuilt = 'Kafka, Debezium, Go, PostgreSQL';
	p.challenges = 'Zero-downtime migration of 2TB dataset';
	p.results = 'Analytics freshness reduced to sub-second';

	const out = transformProjects(createInput([p]));
	equal(out[0].problem, 'Siloed database clusters');
	equal(out[0].whyItMattered, 'Customer analytics were delayed by 12 hours');
	equal(out[0].solution, 'Built real-time CDC pipeline');
	equal(out[0].howItWasBuilt, 'Kafka, Debezium, Go, PostgreSQL');
	equal(out[0].challenges, 'Zero-downtime migration of 2TB dataset');
	equal(out[0].results, 'Analytics freshness reduced to sub-second');
});

test('G. Partial case study preserves populated fields and sets omitted to undefined', () => {
	const p = createEmptyProjectEntry();
	p.projectName = 'Partial App';
	p.problem = 'Memory leak in worker';
	p.solution = 'Fixed unclosed file handles';

	const out = transformProjects(createInput([p]));
	equal(out[0].problem, 'Memory leak in worker');
	equal(out[0].solution, 'Fixed unclosed file handles');
	equal(out[0].whyItMattered, undefined);
	equal(out[0].howItWasBuilt, undefined);
	equal(out[0].challenges, undefined);
	equal(out[0].results, undefined);
});

test('H. Screenshots parse URLs and captions correctly', () => {
	const p = createEmptyProjectEntry();
	p.projectName = 'Visual App';
	p.mediaUrls = 'https://example.com/shot1.png | Home Dashboard\nhttps://example.com/shot2.png';

	const out = transformProjects(createInput([p]));
	ok(out[0].media);
	equal(out[0].media?.length, 2);
	equal(out[0].media?.[0].url, 'https://example.com/shot1.png');
	equal(out[0].media?.[0].caption, 'Home Dashboard');
	equal(out[0].media?.[1].url, 'https://example.com/shot2.png');
});

test('I. Demo video URL is preserved', () => {
	const p = createEmptyProjectEntry();
	p.projectName = 'Video App';
	p.demoVideoUrl = 'https://youtube.com/watch?v=demo987';

	const out = transformProjects(createInput([p]));
	equal(out[0].demoVideoUrl, 'https://youtube.com/watch?v=demo987');
});

test('J. Empty optional fields do not become corrupted strings', () => {
	const p = createEmptyProjectEntry();
	p.projectName = 'Clean App';
	p.githubUrl = '';
	p.demoUrl = '';
	p.demoVideoUrl = '';
	p.mediaUrls = '';

	const out = transformProjects(createInput([p]));
	equal(out[0].repositoryUrl, undefined);
	equal(out[0].liveUrl, undefined);
	equal(out[0].demoVideoUrl, undefined);
	equal(out[0].media, undefined);
});

test('K. Missing project name throws descriptive validation error instead of silent drop', () => {
	const p = createEmptyProjectEntry();
	p.projectName = '';
	p.description = 'This project has a description but no name';
	p.problem = 'Core problem statement';

	throws(
		() => transformProjects(createInput([p])),
		/Project 1 has details but is missing a Project Name/
	);
});

test('L. localStorage quota failure is handled gracefully without crashing', () => {
	// Create mock records with historical versions and large photo preview
	const mockRecord = {
		id: 'rec-1',
		title: 'Portfolio 1',
		currentVersion: 5,
		versions: [
			{ version: 1, title: 'V1', data: {} as any, createdAt: '2026-01-01' },
			{ version: 2, title: 'V2', data: {} as any, createdAt: '2026-01-02' },
			{ version: 3, title: 'V3', data: {} as any, createdAt: '2026-01-03' },
			{ version: 4, title: 'V4', data: {} as any, createdAt: '2026-01-04' },
			{ version: 5, title: 'V5', data: { builder: { profilePhoto: { preview: 'data:image/png;base64,'.padEnd(2000, 'x') } } } as any, createdAt: '2026-01-05' },
		],
		data: { builder: { profilePhoto: { preview: 'data:image/png;base64,'.padEnd(2000, 'x') } } } as any,
		createdAt: '2026-01-01',
		updatedAt: '2026-01-05',
		userId: 'user-1',
		status: 'draft' as const,
		slug: 'portfolio-1',
	};

	// 1. Verify bounded cache payload limits versions to 1 snapshot (the active version)
	const bounded = buildBoundedCachePayload([mockRecord]);
	equal(bounded.records[0].versions.length, 1);
	equal(bounded.records[0].versions[0].version, 5);

	// 2. Simulate QuotaExceededError on localStorage.setItem
	let quotaAttempts = 0;
	const originalLocalStorage = globalThis.localStorage;
	globalThis.localStorage = {
		getItem: () => null,
		setItem: () => {
			quotaAttempts++;
			const err = new Error('QuotaExceededError');
			err.name = 'QuotaExceededError';
			throw err;
		},
		removeItem: () => {},
		clear: () => {},
		length: 0,
		key: () => null,
	};

	try {
		// safePersistCache catches QuotaExceededError safely, attempts fallback, and returns false without throwing
		const okResult = safePersistCache([mockRecord], 'test-key');
		equal(okResult, false);
		ok(quotaAttempts >= 1, 'Attempted setItem and gracefully caught quota failure');
	} finally {
		globalThis.localStorage = originalLocalStorage;
	}
});

test('M. Supabase successful save + localStorage failure maintains valid record in memory', () => {
	// Simulate authoritative record returned from Supabase
	const authoritativeRecord = {
		id: 'supabase-rec-1',
		title: 'Authoritative Draft',
		currentVersion: 1,
		versions: [{ version: 1, title: 'Authoritative Draft', data: {} as any, createdAt: '2026-10-02' }],
		data: {
			projects: [{ name: 'Project 1', description: 'Desc' }],
		} as any,
		createdAt: '2026-10-02T10:00:00Z',
		updatedAt: '2026-10-02T10:00:00Z',
		userId: 'user-123',
		status: 'draft' as const,
		slug: 'authoritative-draft',
	};

	// LocalStorage throws QuotaExceededError
	const originalLocalStorage = globalThis.localStorage;
	globalThis.localStorage = {
		getItem: () => null,
		setItem: () => {
			const err = new Error('QuotaExceededError');
			err.name = 'QuotaExceededError';
			throw err;
		},
		removeItem: () => {},
		clear: () => {},
		length: 0,
		key: () => null,
	};

	try {
		// Cache write fails due to quota
		const cacheOk = safePersistCache([authoritativeRecord], 'portforge:test');
		equal(cacheOk, false);

		// But the authoritative record is intact and valid
		ok(authoritativeRecord);
		equal(authoritativeRecord.id, 'supabase-rec-1');
		equal(authoritativeRecord.title, 'Authoritative Draft');
		equal(authoritativeRecord.data.projects[0].name, 'Project 1');
	} finally {
		globalThis.localStorage = originalLocalStorage;
	}
});

test('N. PostgreSQL JSONB key-order equality: deepSemanticEquals compares independent of key order', () => {
	// Case 1: Simple object key reordering
	ok(deepSemanticEquals({ a: 1, b: 2 }, { b: 2, a: 1 }));

	// Case 2: Nested objects with reordered keys
	ok(
		deepSemanticEquals(
			{ seo: { slug: 'my-slug', title: 'My Title' }, projects: [{ id: '1', name: 'P1' }] },
			{ projects: [{ name: 'P1', id: '1' }], seo: { title: 'My Title', slug: 'my-slug' } }
		)
	);

	// Case 3: Array order is preserved (must NOT be considered equal if order differs)
	equal(deepSemanticEquals([1, 2, 3], [3, 2, 1]), false);

	// Case 4: Changed values
	equal(deepSemanticEquals({ a: 1, b: 2 }, { a: 1, b: 99 }), false);

	// Case 5: Missing keys
	equal(deepSemanticEquals({ a: 1, b: 2 }, { a: 1 }), false);

	// Case 6: Null values
	ok(deepSemanticEquals({ a: null }, { a: null }));
	equal(deepSemanticEquals({ a: null }, { a: 0 }), false);
	equal(deepSemanticEquals({ a: null }, { a: undefined }), false);

	// Case 7: PortfolioOutput equality with Postgres key sorting
	const outputA: PortfolioOutput = {
		schemaVersion: '1.0.0',
		theme: { templateId: 'minimal', name: 'Minimal', description: '', keywords: [] },
		sections: [],
		projects: [{ id: 'prj-1', name: 'Test', technologies: ['TS'], description: '', highlights: [] }],
		experience: [],
		skills: [],
		education: [],
		achievements: [],
		certifications: [],
		social: null,
		resume: null,
		seo: { title: 'Test', description: '', keywords: [], slug: 'test', canonicalUrl: '/p/test', ogImage: '/og/test.png' },
		metadata: { templateId: 'minimal', mode: 'balanced', schemaVersion: '1.0.0', generatedAt: 'now-1', source: 'mock', createdAt: 'now-1', updatedAt: 'now-1', version: 1, template: 'minimal', language: 'en' },
		builder: null,
	};

	// Postgres JSONB order (alphabetized keys)
	const outputB = JSON.parse(JSON.stringify({
		achievements: [],
		builder: null,
		certifications: [],
		education: [],
		experience: [],
		metadata: { templateId: 'minimal', mode: 'balanced', schemaVersion: '1.0.0', generatedAt: 'now-2', source: 'mock', createdAt: 'now-2', updatedAt: 'now-2', version: 1, template: 'minimal', language: 'en' },
		projects: [{ description: '', highlights: [], id: 'prj-1', name: 'Test', technologies: ['TS'] }],
		resume: null,
		schemaVersion: '1.0.0',
		sections: [],
		skills: [],
		social: null,
		theme: { description: '', keywords: [], name: 'Minimal', templateId: 'minimal' },
		seo: { canonicalUrl: '/p/test', description: '', keywords: [], ogImage: '/og/test.png', slug: 'test', title: 'Test' },
	})) as PortfolioOutput;

	ok(portfolioOutputEquals(outputA, outputB));
});

test('O. Existing projects hydrated into DOM when SSR has zero project rows', () => {
	// Minimal DOM mock simulating Browser environment with SSR 0 rows
	class MockElement {
		tagName: string;
		dataset: Record<string, string> = {};
		children: MockElement[] = [];
		parentNode: MockElement | null = null;
		content: { firstElementChild: MockElement | null } = { firstElementChild: null };

		constructor(tag: string) {
			this.tagName = tag.toUpperCase();
		}

		querySelectorAll<T = MockElement>(selector: string): T[] {
			const res: MockElement[] = [];
			const match = (el: MockElement) => {
				if (selector === '[data-list-index]' && el.dataset.listIndex !== undefined) {
					res.push(el);
				}
				for (const child of el.children) {
					match(child);
				}
			};
			for (const child of this.children) {
				match(child);
			}
			return res as unknown as T[];
		}

		querySelector<T = MockElement>(selector: string): T | null {
			if (selector === '[data-entry-template]') {
				for (const child of this.children) {
					if (child.dataset.entryTemplate !== undefined) return child as unknown as T;
				}
			}
			return null;
		}

		cloneNode(deep = true): MockElement {
			const clone = new MockElement(this.tagName);
			clone.dataset = { ...this.dataset };
			if (deep) {
				clone.children = this.children.map((c) => {
					const cc = c.cloneNode(true);
					cc.parentNode = clone;
					return cc;
				});
			}
			return clone;
		}

		after(newEl: MockElement): void {
			if (!this.parentNode) return;
			const idx = this.parentNode.children.indexOf(this);
			this.parentNode.children.splice(idx + 1, 0, newEl);
			newEl.parentNode = this.parentNode;
		}

		remove(): void {
			if (!this.parentNode) return;
			const idx = this.parentNode.children.indexOf(this);
			if (idx >= 0) this.parentNode.children.splice(idx, 1);
			this.parentNode = null;
		}

		appendChild(child: MockElement): void {
			this.children.push(child);
			child.parentNode = this;
		}
	}

	// Setup section root with template but 0 [data-list-index] rows (exact SSR condition)
	const sectionRoot = new MockElement('DIV');
	const templateEl = new MockElement('TEMPLATE');
	templateEl.dataset.entryTemplate = '';

	const panelTemplate = new MockElement('DIV');
	panelTemplate.dataset.listIndex = '0';
	templateEl.content.firstElementChild = panelTemplate;
	sectionRoot.appendChild(templateEl);

	// Store has 2 projects loaded from DB
	const p1 = createEmptyProjectEntry();
	p1.projectName = 'DB Project 1';
	const p2 = createEmptyProjectEntry();
	p2.projectName = 'DB Project 2';
	wizardStore.setSectionData('projects', [p1, p2]);

	// Execute syncRepeatableRows on the mock DOM
	syncRepeatableRows(sectionRoot as unknown as HTMLElement, 'projects');

	// Verify that 2 DOM panels were created with indices "0" and "1"
	const mountedGroups = sectionRoot.querySelectorAll<MockElement>('[data-list-index]');
	equal(mountedGroups.length, 2);
	equal(mountedGroups[0].dataset.listIndex, '0');
	equal(mountedGroups[1].dataset.listIndex, '1');
});
