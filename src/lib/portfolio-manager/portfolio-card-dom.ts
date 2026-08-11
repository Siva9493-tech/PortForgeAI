import type { PortfolioRecord } from './portfolio-manager-types';
import { formatPortfolioDate, portfolioStatusText, portfolioStatusTone } from './portfolio-card-utils';

/**
 * Builds a DOM element for a managed portfolio card. Used by the My Portfolios
 * page to (re)render the card grid client-side from the single store while
 * mirroring the markup produced by `PortfolioCard.astro`.
 */
export function createPortfolioCardElement(portfolio: PortfolioRecord): HTMLElement {
	const tone = portfolioStatusTone(portfolio.status);
	const titleId = `portfolio-card-title-${portfolio.id}`;

	const card = document.createElement('article');
	card.className = 'card flex flex-col p-md';
	card.setAttribute('aria-labelledby', titleId);

	const header = document.createElement('div');
	header.className = 'flex items-start justify-between gap-sm';

	const heading = document.createElement('h3');
	heading.id = titleId;
	heading.className = 'truncate text-body font-semibold text-ink';
	heading.textContent = portfolio.title;

	const pill = document.createElement('span');
	pill.className = 'inline-flex shrink-0 items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-xs py-xs';

	const dot = document.createElement('span');
	dot.className = `h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`;
	dot.setAttribute('aria-hidden', 'true');

	const status = document.createElement('span');
	status.className = `text-caption font-medium ${tone.label}`;
	status.textContent = portfolioStatusText(portfolio.status);

	pill.append(dot, status);
	header.append(heading, pill);

	const meta = document.createElement('dl');
	meta.className = 'mt-md flex flex-col gap-xs';

	const updatedRow = document.createElement('div');
	updatedRow.className = 'flex items-center justify-between gap-sm';
	const updatedDt = document.createElement('dt');
	updatedDt.className = 'text-caption text-ink-subtle';
	updatedDt.textContent = 'Last updated';
	const updatedDd = document.createElement('dd');
	updatedDd.className = 'text-caption font-medium text-ink';
	updatedDd.textContent = formatPortfolioDate(portfolio.updatedAt);
	updatedRow.append(updatedDt, updatedDd);

	const versionRow = document.createElement('div');
	versionRow.className = 'flex items-center justify-between gap-sm';
	const versionDt = document.createElement('dt');
	versionDt.className = 'text-caption text-ink-subtle';
	versionDt.textContent = 'Version';
	const versionDd = document.createElement('dd');
	versionDd.className = 'text-caption font-medium text-ink';
	versionDd.textContent = `v${portfolio.currentVersion}`;
	versionRow.append(versionDt, versionDd);

	meta.append(updatedRow, versionRow);

	const footer = document.createElement('div');
	footer.className =
		'mt-md flex grow flex-col gap-sm rounded-b-md border-t border-hairline pt-sm';

	if (portfolio.status === 'draft') {
		const publishButton = document.createElement('button');
		publishButton.type = 'button';
		publishButton.dataset.publishPortfolio = portfolio.id;
		publishButton.setAttribute('aria-label', `Publish ${portfolio.title}`);
		publishButton.className =
			'inline-flex w-full items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover';
		publishButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>Publish`;
		footer.append(publishButton);
	}

	const duplicateButton = document.createElement('button');
	duplicateButton.type = 'button';
	duplicateButton.dataset.duplicatePortfolio = portfolio.id;
	duplicateButton.setAttribute('aria-label', `Duplicate ${portfolio.title}`);
	duplicateButton.className =
		'inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
	duplicateButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Duplicate`;
	footer.append(duplicateButton);

	const historyButton = document.createElement('button');
	historyButton.type = 'button';
	historyButton.dataset.historyPortfolio = portfolio.id;
	historyButton.setAttribute('aria-label', `View version history for ${portfolio.title}`);
	historyButton.className =
		'inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
	historyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>Version History`;
	footer.append(historyButton);

	const exportButton = document.createElement('button');
	exportButton.type = 'button';
	exportButton.dataset.exportPortfolio = portfolio.id;
	exportButton.setAttribute('aria-label', `Export ${portfolio.title}`);
	exportButton.className =
		'inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
	exportButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>Export`;
	footer.append(exportButton);

	const actions = document.createElement('div');
	actions.className = 'flex flex-wrap gap-sm';

	const editLink = document.createElement('a');
	editLink.href = `/portfolio-builder?portfolio=${portfolio.id}`;
	editLink.setAttribute('aria-label', `Edit ${portfolio.title}`);
	editLink.className =
		'inline-flex flex-1 items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
	editLink.textContent = 'Edit';
	editLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>${editLink.innerHTML}`;

	const openLink = document.createElement('a');
	openLink.href = `/preview?portfolio=${portfolio.id}`;
	openLink.setAttribute('aria-label', `Open ${portfolio.title}`);
	openLink.className =
		'inline-flex flex-1 items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
	openLink.textContent = 'Open';
	openLink.innerHTML = `${openLink.innerHTML}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-ink-subtle" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>`;

	actions.append(editLink, openLink);

	const deleteButton = document.createElement('button');
	deleteButton.type = 'button';
	deleteButton.dataset.deletePortfolio = portfolio.id;
	deleteButton.setAttribute('aria-label', `Delete ${portfolio.title}`);
	deleteButton.className =
		'inline-flex flex-1 items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-semantic-danger transition-colors duration-200 hover:bg-surface-2';
	deleteButton.textContent = 'Delete';
	deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>${deleteButton.innerHTML}`;
	actions.append(deleteButton);

	footer.append(actions);

	card.append(header, meta, footer);
	return card;
}