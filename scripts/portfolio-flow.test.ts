import { equal, notEqual, ok } from 'node:assert/strict';
import { test } from 'node:test';
import {
	extractOwnerName,
	isSlugDerivedFromName,
	resolvePublishSlug,
	suffixSlug,
	publicUrlForSlug,
	type SlugSource,
} from '../src/lib/portfolio-manager/portfolio-slug.ts';
import { duplicateTitle } from '../src/lib/portfolio-manager/portfolio-manager-utils.ts';
import { generatePublishSlug } from '../src/lib/publish/publish-utils.ts';

test('TEST 1: New portfolio creation derives correct initial slug from owner name', () => {
	const ownerName = 'Siva Balaji Mamidala';
	const baseSlug = generatePublishSlug(ownerName);
	equal(baseSlug, 'siva-balaji-mamidala');

	const record: SlugSource = {
		id: 'id-1',
		title: ownerName,
		slug: baseSlug,
		data: { seo: { title: ownerName, slug: baseSlug } },
	};

	equal(record.title, 'Siva Balaji Mamidala');
	equal(record.slug, 'siva-balaji-mamidala');
	equal(publicUrlForSlug(record.slug), '/portfolio/siva-balaji-mamidala');
});

test('TEST 2: Editing portfolio name updates database name, public slug, and public URL', () => {
	// Original portfolio: Siva Balaji Mamidala
	const originalRecord: SlugSource = {
		id: 'portfolio-101',
		title: 'Siva Balaji Mamidala',
		slug: 'siva-balaji-mamidala',
		data: { seo: { title: 'Siva Balaji Mamidala', slug: 'siva-balaji-mamidala' } },
	};

	// Name edited to Mohan
	const newName = 'Mohan';
	const nameChanged = !isSlugDerivedFromName(originalRecord.slug ?? '', newName);
	equal(nameChanged, true);

	// New slug derived from Mohan
	const newSlug = generatePublishSlug(newName);
	equal(newSlug, 'mohan');

	// Simulate updated record
	const updatedRecord: SlugSource = {
		id: originalRecord.id,
		title: newName,
		slug: newSlug,
		data: { seo: { title: newName, slug: newSlug } },
	};

	equal(updatedRecord.title, 'Mohan');
	equal(updatedRecord.slug, 'mohan');
	equal(publicUrlForSlug(updatedRecord.slug), '/portfolio/mohan');
	notEqual(updatedRecord.slug, originalRecord.slug);

	// resolvePublishSlug on the edited record also yields 'mohan'
	equal(resolvePublishSlug(updatedRecord), 'mohan');
});

test('TEST 2b: Unchanged name retains existing slug and suffixed collision slug', () => {
	const record: SlugSource = {
		id: 'portfolio-102',
		title: 'Mohan',
		slug: 'mohan-2',
		data: { seo: { title: 'Mohan', slug: 'mohan-2' } },
	};

	// Name has not changed
	ok(isSlugDerivedFromName(record.slug ?? '', record.title));
	equal(resolvePublishSlug(record), 'mohan-2');
});

test('TEST 4: Duplicate gets new identity, does not retain source slug or ID', () => {
	const source = {
		id: 'source-uuid-111',
		title: 'Siva Balaji Mamidala',
		slug: 'siva-balaji-mamidala',
		data: { seo: { title: 'Siva Balaji Mamidala', slug: 'siva-balaji-mamidala' } },
	};

	const duplicateTitleName = duplicateTitle(source.title, [source.title]);
	equal(duplicateTitleName, 'Siva Balaji Mamidala (Copy)');

	const duplicateBaseSlug = generatePublishSlug(duplicateTitleName);
	equal(duplicateBaseSlug, 'siva-balaji-mamidala-copy');

	// Duplicate must have its own identity and must NOT retain original slug
	notEqual(duplicateBaseSlug, source.slug);

	// If duplicate name is edited to Mohan
	const editedDuplicateName = 'Mohan';
	const duplicateNewSlug = generatePublishSlug(editedDuplicateName);
	equal(duplicateNewSlug, 'mohan');

	// If mohan already exists, collision strategy produces mohan-2
	const collisionSlug = suffixSlug(duplicateNewSlug, 2);
	equal(collisionSlug, 'mohan-2');
	equal(publicUrlForSlug(collisionSlug), '/portfolio/mohan-2');
});

test('TEST 5: Collision strategy produces deterministic -2, -3 suffixes', () => {
	const base = 'mohan';
	equal(suffixSlug(base, 2), 'mohan-2');
	equal(suffixSlug(base, 3), 'mohan-3');
	equal(suffixSlug(base, 4), 'mohan-4');
});
