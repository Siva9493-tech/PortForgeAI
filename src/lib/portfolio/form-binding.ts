import { SECTION_BINDINGS } from './field-config';
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

function entryFrom(
	data: unknown,
	mode: 'object' | 'list'
): Record<string, unknown> | undefined {
	if (mode === 'list') {
		if (!Array.isArray(data)) return undefined;
		return (data[0] as Record<string, unknown> | undefined) ?? {};
	}
	if (data == null || typeof data !== 'object') return undefined;
	return data as Record<string, unknown>;
}

export function applySectionValues(root: ParentNode, stepId: keyof PortfolioData): void {
	const binding = SECTION_BINDINGS[stepId];
	const source = entryFrom(wizardStore.getState().data[stepId], binding.mode);
	if (!source) return;

	for (const field of root.querySelectorAll<FormField>('[name]')) {
		if (Object.prototype.hasOwnProperty.call(source, field.name)) {
			setFieldValue(field, source[field.name]);
		}
	}
}

export function collectSectionData(root: HTMLElement, stepId: keyof PortfolioData): void {
	const binding = SECTION_BINDINGS[stepId];
	const data = wizardStore.getState().data[stepId] as unknown;
	let next: PortfolioData[keyof PortfolioData];

	if (binding.mode === 'list') {
		const list = clone(Array.isArray(data) ? data : []) as Record<string, unknown>[];
		const entry = (list[0] ?? {}) as Record<string, unknown>;
		for (const field of root.querySelectorAll<FormField>('[name]')) {
			if (Object.prototype.hasOwnProperty.call(entry, field.name)) {
				entry[field.name] = getFieldValue(field);
			}
		}
		if (list.length === 0) list.push(entry);
		else list[0] = entry;
		next = list as unknown as PortfolioData[keyof PortfolioData];
	} else {
		const obj = clone((data as object | undefined) ?? {}) as Record<string, unknown>;
		for (const field of root.querySelectorAll<FormField>('[name]')) {
			if (Object.prototype.hasOwnProperty.call(obj, field.name)) {
				obj[field.name] = getFieldValue(field);
			}
		}
		next = obj as unknown as PortfolioData[keyof PortfolioData];
	}

	wizardStore.setSectionData(stepId, next);
}
