import type { PortfolioData } from './types';

export function isMeaningful(value: unknown): boolean {
	if (value == null) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value > 0;
	if (Array.isArray(value)) return value.some(isMeaningful);
	if (typeof value === 'object') {
		return Object.values(value as Record<string, unknown>).some(isMeaningful);
	}
	return false;
}

export function isSectionCompleted(
	data: PortfolioData,
	sectionKey: keyof PortfolioData
): boolean {
	return isMeaningful(data[sectionKey]);
}
