import {
	FIRST_STEP_ID,
	LAST_STEP_ID,
	TOTAL_STEPS,
	WIZARD_STEPS,
	getStepById,
	getStepIndex,
	isStepId,
	type WizardStep,
} from './steps';
import { createEmptyPortfolioData, type PortfolioData, type StepId } from './types';

export interface WizardState {
	currentStep: StepId;
	totalSteps: number;
	completedSteps: StepId[];
	visitedSteps: StepId[];
	progress: number;
	data: PortfolioData;
}

export interface WizardStoreOptions {
	initialStep?: StepId;
	completedSteps?: StepId[];
	visitedSteps?: StepId[];
	initialData?: Partial<PortfolioData>;
	persistKey?: string;
}

export type WizardStateListener = (state: Readonly<WizardState>) => void;

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

function mergePortfolioData(source: Partial<PortfolioData> | undefined): PortfolioData {
	const base = createEmptyPortfolioData();
	if (!source) return base;

	const target = base as unknown as Record<string, unknown>;
	const originals = source as Record<string, unknown>;

	for (const section of Object.keys(base) as (keyof PortfolioData)[]) {
		const value = originals[section];
		if (value === undefined) continue;

		if (Array.isArray(value)) {
			target[section] = value.map((entry) => ({ ...(entry as object) }));
		} else if (value !== null && typeof value === 'object') {
			target[section] = {
				...(target[section] as object),
				...(value as object),
			};
		}
	}

	return base;
}

export class WizardStore {
	private readonly persistKey?: string;
	private state: WizardState;
	private readonly listeners = new Set<WizardStateListener>();

	constructor(options: WizardStoreOptions = {}) {
		this.persistKey = options.persistKey;
		this.state = {
			currentStep: options.initialStep ?? FIRST_STEP_ID,
			totalSteps: TOTAL_STEPS,
			completedSteps: [...new Set(options.completedSteps ?? [])],
			visitedSteps: [...new Set(options.visitedSteps ?? [FIRST_STEP_ID])],
			progress: 0,
			data: mergePortfolioData(options.initialData),
		};

		if (!this.state.visitedSteps.includes(this.state.currentStep)) {
			this.state.visitedSteps.push(this.state.currentStep);
		}

		if (this.persistKey) {
			this.restore();
		}

		this.recomputeProgress();
	}

	getState(): Readonly<WizardState> {
		return this.state;
	}

	subscribe(listener: WizardStateListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	// --- Progress ---

	getProgress(): number {
		return this.state.progress;
	}

	private computeProgress(): number {
		if (this.state.totalSteps === 0) return 0;
		return Math.round((this.state.completedSteps.length / this.state.totalSteps) * 100);
	}

	private recomputeProgress(): void {
		this.state.progress = this.computeProgress();
	}

	// --- Navigation ---

	getCurrentStep(): WizardStep {
		return getStepById(this.state.currentStep) ?? WIZARD_STEPS[0];
	}

	getCurrentStepIndex(): number {
		return getStepIndex(this.state.currentStep);
	}

	isFirstStep(): boolean {
		return this.state.currentStep === FIRST_STEP_ID;
	}

	isLastStep(): boolean {
		return this.state.currentStep === LAST_STEP_ID;
	}

	next(): boolean {
		if (this.isLastStep()) return false;

		this.addCompleted(this.state.currentStep);
		const nextIndex = Math.min(this.getCurrentStepIndex() + 1, TOTAL_STEPS - 1);
		this.state.currentStep = WIZARD_STEPS[nextIndex].id;
		this.addVisited(this.state.currentStep);
		this.notify();
		return true;
	}

	previous(): boolean {
		if (this.isFirstStep()) return false;

		const prevIndex = Math.max(this.getCurrentStepIndex() - 1, 0);
		this.state.currentStep = WIZARD_STEPS[prevIndex].id;
		this.addVisited(this.state.currentStep);
		this.notify();
		return true;
	}

	goToStep(stepId: StepId): boolean {
		const step = getStepById(stepId);
		if (!step) return false;

		if (this.state.currentStep === step.id) return true;
		this.state.currentStep = step.id;
		this.addVisited(step.id);
		this.notify();
		return true;
	}

	// --- Completion & visitation ---

	isCompleted(stepId: StepId): boolean {
		return this.state.completedSteps.includes(stepId);
	}

	isVisited(stepId: StepId): boolean {
		return this.state.visitedSteps.includes(stepId);
	}

	markCompleted(stepId: StepId): void {
		if (this.state.completedSteps.includes(stepId)) {
			return;
		}
		this.addCompleted(stepId);
		this.addVisited(stepId);
		this.notify();
	}

	markVisited(stepId: StepId): void {
		if (this.state.visitedSteps.includes(stepId)) {
			return;
		}
		this.addVisited(stepId);
		this.notify();
	}

	private addCompleted(stepId: StepId): void {
		if (!this.state.completedSteps.includes(stepId)) {
			this.state.completedSteps.push(stepId);
		}
	}

	private addVisited(stepId: StepId): void {
		if (!this.state.visitedSteps.includes(stepId)) {
			this.state.visitedSteps.push(stepId);
		}
	}

	// --- Form data ---

	setSectionData<S extends keyof PortfolioData>(section: S, value: PortfolioData[S]): void {
		if (this.state.data[section] === value) {
			return;
		}
		this.state.data[section] = value;
		this.notify();
	}

	getSectionData<S extends keyof PortfolioData>(section: S): Readonly<PortfolioData[S]> {
		return this.state.data[section];
	}

	getData(): Readonly<PortfolioData> {
		return this.state.data;
	}

	// --- Lifecycle ---

	reset(): void {
		this.state.currentStep = FIRST_STEP_ID;
		this.state.completedSteps = [];
		this.state.visitedSteps = [FIRST_STEP_ID];
		this.state.data = createEmptyPortfolioData();
		this.notify();
	}

	save(): void {
		if (!this.persistKey || !canUseStorage()) return;

		localStorage.setItem(
			this.persistKey,
			JSON.stringify({
				currentStep: this.state.currentStep,
				completedSteps: this.state.completedSteps,
				visitedSteps: this.state.visitedSteps,
				data: this.state.data,
			})
		);
	}

	restore(): boolean {
		if (!this.persistKey || !canUseStorage()) return false;

		const raw = localStorage.getItem(this.persistKey);
		if (!raw) return false;

		try {
			const parsed = JSON.parse(raw) as Partial<WizardState>;

			if (parsed.currentStep && isStepId(parsed.currentStep)) {
				this.state.currentStep = parsed.currentStep;
			}
			if (Array.isArray(parsed.completedSteps)) {
				this.state.completedSteps = parsed.completedSteps.filter(isStepId);
			}
			if (Array.isArray(parsed.visitedSteps)) {
				this.state.visitedSteps = parsed.visitedSteps.filter(isStepId);
			}
			if (parsed.data) {
				this.state.data = mergePortfolioData(parsed.data);
			}

			if (!this.state.visitedSteps.includes(this.state.currentStep)) {
				this.state.visitedSteps.push(this.state.currentStep);
			}

			return true;
		} catch {
			return false;
		}
	}

	private notify(): void {
		this.recomputeProgress();
		this.save();
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}
}

export const wizardStore = new WizardStore({ persistKey: 'portforge:wizard:v1' });
