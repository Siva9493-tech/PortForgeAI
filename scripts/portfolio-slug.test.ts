import { equal, ok } from 'node:assert/strict';
import { test } from 'node:test';
import { generatePublishSlug } from '../src/lib/publish/publish-utils.ts';
import {
	isValidSlug,
	publicUrlForSlug,
	resolvePublishSlug,
	suffixSlug,
	type SlugSource,
} from '../src/lib/portfolio-manager/portfolio-slug.ts';

/**
 * Pure unit tests for the publish slug helpers. Run with Node's built-in test
 * runner (no third-party framework):
 *
 *   node --experimental-strip-types --test scripts/*.test.ts
 */

/** Builds a minimal, valid slug source, overriding any slice for a case. */
function source(over: Partial<SlugSource> = {}): SlugSource {
	return {
		id: '550e8400-e29b-41d4-a716-446655440000',
		title: 'Jordan Lee',
		slug: null,
		data: { seo: { title: 'Jordan Lee — Product Designer', slug: 'jordan-lee' } },
		...over,
	};
}

test('generatePublishSlug normalizes a title to an URL-safe slug', () => {
	equal(generatePublishSlug('My AI/ML Portfolio'), 'my-ai-ml-portfolio');
	equal(generatePublishSlug('  --My AI??/ML----  '), 'my-ai-ml');
	equal(generatePublishSlug('Product Designer'), 'product-designer');
});

test('generatePublishSlug is lowercase and deterministic', () => {
	equal(generatePublishSlug('JOHN DOE'), 'john-doe');
	equal(generatePublishSlug('JOHN DOE'), generatePublishSlug('JOHN DOE'));
});

test('generatePublishSlug falls back deterministically', () => {
	equal(generatePublishSlug('!!!'), 'portfolio');
	equal(generatePublishSlug('!!!', 'pf-123'), 'pf-123');
	// An id-derived slug is valid and stable.
	equal(
		generatePublishSlug('550e8400-e29b-41d4-a716-446655440000', 'portfolio'),
		'550e8400-e29b-41d4-a716-446655440000',
	);
});

test('isValidSlug accepts only normalized slugs', () => {
	ok(isValidSlug('my-ai-ml-portfolio'));
	ok(isValidSlug('550e8400-e29b-41d4-a716-446655440000'));
	ok(!isValidSlug(''));
	ok(!isValidSlug('My-AI')); // uppercase
	ok(!isValidSlug('my_ai')); // underscore
	ok(!isValidSlug('my-ai-')); // trailing hyphen
	ok(!isValidSlug('my--portfolio')); // repeated hyphen
	ok(!isValidSlug('a'.repeat(61))); // over the max length
});

test('resolvePublishSlug keeps an existing stable slug on republish', () => {
	equal(resolvePublishSlug(source({ slug: 'my-ai-ml-portfolio' })), 'my-ai-ml-portfolio');
});

test('resolvePublishSlug falls back to the SEO slug', () => {
	equal(resolvePublishSlug(source({ slug: null })), 'jordan-lee');
});

test('resolvePublishSlug derives from the SEO title', () => {
	equal(resolvePublishSlug(source({ slug: null, data: { seo: { title: 'My AI/ML Portfolio' } } })), 'my-ai-ml-portfolio');
});

test('resolvePublishSlug derives from the title when SEO is absent', () => {
	equal(resolvePublishSlug(source({ slug: null, data: { seo: null } })), 'jordan-lee');
	const bare: SlugSource = { id: 'abc-1', title: 'Only Title', slug: null, data: { seo: null } };
	equal(resolvePublishSlug(bare), 'only-title');
});

test('resolvePublishSlug uses the id slug when the title is empty', () => {
	equal(
		resolvePublishSlug(source({ title: '', slug: null, data: { seo: null } })),
		generatePublishSlug('550e8400-e29b-41d4-a716-446655440000'),
	);
});

test('resolvePublishSlug skips an invalid existing slug', () => {
	equal(
		resolvePublishSlug(source({ slug: 'Bad Slug!', data: { seo: { title: 'My Title' } } })),
		'my-title',
	);
});

test('suffixSlug appends a deterministic counter', () => {
	equal(suffixSlug('my-ai-ml-portfolio', 2), 'my-ai-ml-portfolio-2');
	equal(suffixSlug('my-ai-ml-portfolio', 3), 'my-ai-ml-portfolio-3');
});

test('publicUrlForSlug builds the public profile URL', () => {
	equal(publicUrlForSlug('my-ai-ml-portfolio'), '/portfolio/my-ai-ml-portfolio');
});
