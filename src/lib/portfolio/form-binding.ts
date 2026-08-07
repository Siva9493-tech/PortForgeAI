import { EMPTY_ENTRY_FACTORIES, SECTION_BINDINGS } from './field-config';
import { wizardStore } from './wizard-store';
import type { PortfolioData } from './types';

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function setFieldValue(field: FormField, value: unknown): void {
	if (field instanceof HTMLInputElement && field.type === 'checkbox') {
		field.checked = Boolean(value);
	} else {
		field.value = value == null ? '' : String(value);
	}
}

function getFieldValue(field: FormField): unknown {
	if (field instanceof HTMLInputElement && field.type === 'checkbox') {
		return field.checked;
	}
	return field.value;
}

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function applyGroupValues(groupRoot: HTMLElement, source: Record<string, unknown>): void {
	for (const field of groupRoot.querySelectorAll<FormField>('[name]')) {
		if (Object.prototype.hasOwnProperty.call(source, field.name)) {
			setFieldValue(field, source[field.name]);
		}
	}
}

function collectGroupValues(groupRoot: HTMLElement, target: Record<string, unknown>): void {
	for (const field of groupRoot.querySelectorAll<FormField>('[name]')) {
		if (Object.prototype.hasOwnProperty.call(target, field.name)) {
			target[field.name] = getFieldValue(field);
		}
	}
}

function clearGroupValues(groupRoot: HTMLElement): void {
	for (const field of groupRoot.querySelectorAll<FormField>('input, select, textarea')) {
		if (field instanceof HTMLInputElement && field.type === 'checkbox') {
			field.checked = false;
		} else {
			field.value = '';
		}
	}
}

export function applySectionValues(root: ParentNode, stepId: keyof PortfolioData): void {
	const binding = SECTION_BINDINGS[stepId];
	const data = wizardStore.getState().data[stepId] as unknown;

	if (binding.mode === 'list') {
		const list = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
		for (const group of root.querySelectorAll<HTMLElement>('[data-list-index]')) {
			const index = Number(group.dataset.listIndex);
			const entry = list[index];
			if (entry) applyGroupValues(group, entry);
		}
		return;
	}

	if (data == null || typeof data !== 'object') return;
	applyGroupValues(root as HTMLElement, data as Record<string, unknown>);
}

export function collectSectionData(
	groupRoot: HTMLElement,
	stepId: keyof PortfolioData,
	index = 0
): void {
	const binding = SECTION_BINDINGS[stepId];
	const data = wizardStore.getState().data[stepId] as unknown;
	let next: PortfolioData[keyof PortfolioData];

	if (binding.mode === 'list') {
		const list = clone(Array.isArray(data) ? data : []) as Record<string, unknown>[];
		const entry = (list[index] ?? {}) as Record<string, unknown>;
		collectGroupValues(groupRoot, entry);
		list[index] = entry;
		next = list as unknown as PortfolioData[keyof PortfolioData];
	} else {
		const obj = clone((data as object | undefined) ?? {}) as Record<string, unknown>;
		collectGroupValues(groupRoot, obj);
		next = obj as unknown as PortfolioData[keyof PortfolioData];
	}

	wizardStore.setSectionData(stepId, next);
}

export function addRepeatEntry(sectionRoot: HTMLElement, stepId: keyof PortfolioData): boolean {
	const binding = SECTION_BINDINGS[stepId];
	if (binding.mode !== 'list') return false;

	const factory = EMPTY_ENTRY_FACTORIES[stepId];
	if (!factory) return false;

	const groups = Array.from(sectionRoot.querySelectorAll<HTMLElement>('[data-list-index]'));
	const template = groups[groups.length - 1];
	if (!template) return false;

	const entryClone = template.cloneNode(true) as HTMLElement;
	clearGroupValues(entryClone);
	entryClone.dataset.listIndex = String(groups.length);
	template.after(entryClone);

	const currentList = wizardStore.getState().data[stepId] as unknown;
	const list = clone(
		Array.isArray(currentList) ? currentList : []
	) as Record<string, unknown>[];
	list.push(factory() as Record<string, unknown>);
	wizardStore.setSectionData(stepId, list as unknown as PortfolioData[keyof PortfolioData]);
	return true;
}