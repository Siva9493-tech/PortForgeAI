import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, c as renderSlot, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute, t as spreadAttributes } from "./server_DbbqJ9by.mjs";
//#region node_modules/lucide-astro/dist/.Layout.astro
createAstro("https://astro.build");
var $$Component = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Component;
	const size = Astro.props.size;
	const cls = Astro.props.class;
	const name = Astro.props.iconName;
	delete Astro.props.size;
	delete Astro.props.class;
	delete Astro.props.iconName;
	const props = Object.assign({
		"xmlns": "http://www.w3.org/2000/svg",
		"stroke-width": 2,
		"width": size ?? 24,
		"height": size ?? 24,
		"stroke": "currentColor",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"fill": "none",
		"viewBox": "0 0 24 24"
	}, Astro.props);
	return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute([
		"lucide",
		{ [`lucide-${name}`]: name },
		cls
	], "class:list")}>${renderSlot($$result, $$slots["default"])}</svg>`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/.Layout.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Github.astro
createAstro("https://astro.build");
var $$Github = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Github;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "github",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Github.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Sparkles.astro
createAstro("https://astro.build");
var $$Sparkles = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Sparkles;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "sparkles",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Sparkles.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Trophy.astro
createAstro("https://astro.build");
var $$Trophy = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Trophy;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "trophy",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Trophy.astro", void 0);
//#endregion
//#region src/lib/portfolio/types.ts
function createEmptyPersonalInformation() {
	return {
		fullName: "",
		professionalTitle: "",
		email: "",
		phone: "",
		location: "",
		about: "",
		profilePhoto: null
	};
}
function createEmptySkills() {
	return {
		programmingLanguages: "",
		frameworks: "",
		databases: "",
		devTools: "",
		cloudPlatforms: "",
		softSkills: "",
		additionalSkills: ""
	};
}
function createEmptySocialLinks() {
	return {
		linkedinProfile: "",
		githubProfile: "",
		portfolioWebsite: "",
		twitterProfile: "",
		instagram: "",
		youtubeChannel: "",
		otherWebsite: "",
		customLinks: []
	};
}
function createEmptyResume() {
	return {
		fileName: "",
		fileType: "",
		fileSize: 0
	};
}
function createEmptyGitHubImport() {
	return {
		githubUsername: "",
		repositoryVisibility: "",
		connected: false,
		importedRepositories: []
	};
}
function createEmptyLinkedInImport() {
	return {
		linkedinProfileUrl: "",
		importMode: "",
		connected: false
	};
}
function createEmptyPortfolioData() {
	return {
		personalInformation: createEmptyPersonalInformation(),
		education: [],
		experience: [],
		projects: [],
		skills: createEmptySkills(),
		certifications: [],
		achievements: [],
		socialLinks: [createEmptySocialLinks()],
		resume: createEmptyResume(),
		githubImport: createEmptyGitHubImport(),
		linkedinImport: createEmptyLinkedInImport()
	};
}
//#endregion
//#region src/lib/portfolio/steps.ts
var WIZARD_STEPS = [
	{
		id: "personalInformation",
		number: 1,
		title: "Personal Information"
	},
	{
		id: "education",
		number: 2,
		title: "Education"
	},
	{
		id: "experience",
		number: 3,
		title: "Experience"
	},
	{
		id: "projects",
		number: 4,
		title: "Projects"
	},
	{
		id: "skills",
		number: 5,
		title: "Skills"
	},
	{
		id: "certifications",
		number: 6,
		title: "Certifications"
	},
	{
		id: "achievements",
		number: 7,
		title: "Achievements"
	},
	{
		id: "socialLinks",
		number: 8,
		title: "Social Links"
	},
	{
		id: "resume",
		number: 9,
		title: "Resume Upload"
	},
	{
		id: "githubImport",
		number: 10,
		title: "GitHub Import"
	},
	{
		id: "linkedinImport",
		number: 11,
		title: "LinkedIn Import"
	}
];
var TOTAL_STEPS = WIZARD_STEPS.length;
var FIRST_STEP_ID = WIZARD_STEPS[0].id;
var LAST_STEP_ID = WIZARD_STEPS[TOTAL_STEPS - 1].id;
function getStepById(stepId) {
	return WIZARD_STEPS.find((step) => step.id === stepId);
}
function getStepIndex(stepId) {
	return WIZARD_STEPS.findIndex((step) => step.id === stepId);
}
function isStepId(value) {
	return WIZARD_STEPS.some((step) => step.id === value);
}
//#endregion
//#region src/lib/portfolio/wizard-store.ts
function canUseStorage() {
	return typeof localStorage !== "undefined";
}
function mergePortfolioData(source) {
	const base = createEmptyPortfolioData();
	if (!source) return base;
	const target = base;
	const originals = source;
	for (const section of Object.keys(base)) {
		const value = originals[section];
		if (value === void 0) continue;
		if (Array.isArray(value)) target[section] = value.map((entry) => ({ ...entry }));
		else if (value !== null && typeof value === "object") target[section] = {
			...target[section],
			...value
		};
	}
	return base;
}
var WizardStore = class {
	persistKey;
	state;
	listeners = /* @__PURE__ */ new Set();
	constructor(options = {}) {
		this.persistKey = options.persistKey;
		this.state = {
			currentStep: options.initialStep ?? FIRST_STEP_ID,
			totalSteps: TOTAL_STEPS,
			completedSteps: [...new Set(options.completedSteps ?? [])],
			visitedSteps: [...new Set(options.visitedSteps ?? [FIRST_STEP_ID])],
			progress: 0,
			data: mergePortfolioData(options.initialData)
		};
		if (!this.state.visitedSteps.includes(this.state.currentStep)) this.state.visitedSteps.push(this.state.currentStep);
		if (this.persistKey) this.restore();
		this.recomputeProgress();
	}
	getState() {
		return this.state;
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	getProgress() {
		return this.state.progress;
	}
	computeProgress() {
		if (this.state.totalSteps === 0) return 0;
		return Math.round(this.state.completedSteps.length / this.state.totalSteps * 100);
	}
	recomputeProgress() {
		this.state.progress = this.computeProgress();
	}
	getCurrentStep() {
		return getStepById(this.state.currentStep) ?? WIZARD_STEPS[0];
	}
	getCurrentStepIndex() {
		return getStepIndex(this.state.currentStep);
	}
	isFirstStep() {
		return this.state.currentStep === FIRST_STEP_ID;
	}
	isLastStep() {
		return this.state.currentStep === LAST_STEP_ID;
	}
	next() {
		if (this.isLastStep()) return false;
		this.addCompleted(this.state.currentStep);
		const nextIndex = Math.min(this.getCurrentStepIndex() + 1, TOTAL_STEPS - 1);
		this.state.currentStep = WIZARD_STEPS[nextIndex].id;
		this.addVisited(this.state.currentStep);
		this.notify();
		return true;
	}
	previous() {
		if (this.isFirstStep()) return false;
		const prevIndex = Math.max(this.getCurrentStepIndex() - 1, 0);
		this.state.currentStep = WIZARD_STEPS[prevIndex].id;
		this.addVisited(this.state.currentStep);
		this.notify();
		return true;
	}
	goToStep(stepId) {
		const step = getStepById(stepId);
		if (!step) return false;
		if (this.state.currentStep === step.id) return true;
		this.state.currentStep = step.id;
		this.addVisited(step.id);
		this.notify();
		return true;
	}
	isCompleted(stepId) {
		return this.state.completedSteps.includes(stepId);
	}
	isVisited(stepId) {
		return this.state.visitedSteps.includes(stepId);
	}
	markCompleted(stepId) {
		if (this.state.completedSteps.includes(stepId)) return;
		this.addCompleted(stepId);
		this.addVisited(stepId);
		this.notify();
	}
	markVisited(stepId) {
		if (this.state.visitedSteps.includes(stepId)) return;
		this.addVisited(stepId);
		this.notify();
	}
	addCompleted(stepId) {
		if (!this.state.completedSteps.includes(stepId)) this.state.completedSteps.push(stepId);
	}
	addVisited(stepId) {
		if (!this.state.visitedSteps.includes(stepId)) this.state.visitedSteps.push(stepId);
	}
	setSectionData(section, value) {
		if (this.state.data[section] === value) return;
		this.state.data[section] = value;
		this.notify();
	}
	getSectionData(section) {
		return this.state.data[section];
	}
	getData() {
		return this.state.data;
	}
	reset() {
		this.state.currentStep = FIRST_STEP_ID;
		this.state.completedSteps = [];
		this.state.visitedSteps = [FIRST_STEP_ID];
		this.state.data = createEmptyPortfolioData();
		this.notify();
	}
	save() {
		if (!this.persistKey || !canUseStorage()) return;
		localStorage.setItem(this.persistKey, JSON.stringify({
			currentStep: this.state.currentStep,
			completedSteps: this.state.completedSteps,
			visitedSteps: this.state.visitedSteps,
			data: this.state.data
		}));
	}
	restore() {
		if (!this.persistKey || !canUseStorage()) return false;
		const raw = localStorage.getItem(this.persistKey);
		if (!raw) return false;
		try {
			const parsed = JSON.parse(raw);
			if (parsed.currentStep && isStepId(parsed.currentStep)) this.state.currentStep = parsed.currentStep;
			if (Array.isArray(parsed.completedSteps)) this.state.completedSteps = parsed.completedSteps.filter(isStepId);
			if (Array.isArray(parsed.visitedSteps)) this.state.visitedSteps = parsed.visitedSteps.filter(isStepId);
			if (parsed.data) this.state.data = mergePortfolioData(parsed.data);
			if (!this.state.visitedSteps.includes(this.state.currentStep)) this.state.visitedSteps.push(this.state.currentStep);
			return true;
		} catch {
			return false;
		}
	}
	notify() {
		this.recomputeProgress();
		this.save();
		for (const listener of this.listeners) listener(this.state);
	}
};
var wizardStore = new WizardStore({ persistKey: "portforge:wizard:v1" });
//#endregion
//#region src/lib/portfolio/completion.ts
function isMeaningful(value) {
	if (value == null) return false;
	if (typeof value === "string") return value.trim().length > 0;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value > 0;
	if (Array.isArray(value)) return value.some(isMeaningful);
	if (typeof value === "object") return Object.values(value).some(isMeaningful);
	return false;
}
var OBJECT_RULES = {
	personalInformation: {
		fields: ["fullName", "email"],
		match: "all"
	},
	skills: {
		fields: [
			"programmingLanguages",
			"frameworks",
			"databases",
			"devTools",
			"cloudPlatforms",
			"softSkills",
			"additionalSkills"
		],
		match: "any"
	},
	resume: {
		fields: ["fileName"],
		match: "all"
	},
	githubImport: {
		fields: ["githubUsername"],
		match: "all"
	},
	linkedinImport: {
		fields: ["linkedinProfileUrl"],
		match: "all"
	}
};
var LIST_RULES = {
	education: {
		fields: ["degree", "institution"],
		match: "all"
	},
	experience: {
		fields: ["jobTitle", "company"],
		match: "all"
	},
	projects: {
		fields: ["projectName"],
		match: "all"
	},
	certifications: {
		fields: ["certificationName"],
		match: "all"
	},
	achievements: {
		fields: ["achievementTitle"],
		match: "all"
	}
};
function toRecord(value) {
	return value ?? {};
}
function matchesRule(entry, rule) {
	const values = rule.fields.map((field) => entry[field]);
	return rule.match === "all" ? values.every(isMeaningful) : values.some(isMeaningful);
}
function socialLinksComplete(value) {
	if (!Array.isArray(value)) return false;
	const entry = value[0];
	if (!entry || typeof entry !== "object") return false;
	const links = entry;
	if ([
		"linkedinProfile",
		"githubProfile",
		"portfolioWebsite",
		"twitterProfile",
		"instagram",
		"youtubeChannel",
		"otherWebsite"
	].some((field) => isMeaningful(links[field]))) return true;
	return Array.isArray(links.customLinks) && links.customLinks.some((link) => isMeaningful(link.label) && isMeaningful(link.url));
}
function importSectionComplete(value, sectionKey) {
	const rule = OBJECT_RULES[sectionKey];
	if (rule && matchesRule(toRecord(value), rule)) return true;
	const connected = value?.connected;
	return Boolean(connected);
}
/**
* Whether a portfolio section counts as complete based purely on the content
* the user has actually entered. A section is complete when its meaningful
* required content is present — not merely because it was visited.
*
* New sections should add an entry to OBJECT_RULES / LIST_RULES. Sections
* without a rule fall back to "any meaningful content".
*/
function isSectionCompleted(data, sectionKey) {
	const value = data[sectionKey];
	if (sectionKey === "socialLinks") return socialLinksComplete(value);
	const objectRule = OBJECT_RULES[sectionKey];
	if (objectRule) {
		if (sectionKey === "githubImport" || sectionKey === "linkedinImport") return importSectionComplete(value, sectionKey);
		return matchesRule(toRecord(value), objectRule);
	}
	const listRule = LIST_RULES[sectionKey];
	if (listRule) return Array.isArray(value) && value.some((entry) => entry != null && matchesRule(toRecord(entry), listRule));
	return isMeaningful(value);
}
/**
* Overall builder completion derived from the actual section data — never from
* visit/navigation state. `total` follows the step list, so it stays accurate
* if a section is ever added or removed.
*/
function getBuilderProgress(data) {
	const total = WIZARD_STEPS.length;
	const completed = WIZARD_STEPS.reduce((count, step) => isSectionCompleted(data, step.id) ? count + 1 : count, 0);
	return {
		completed,
		total,
		percent: total === 0 ? 0 : Math.round(completed / total * 100)
	};
}
//#endregion
//#region src/lib/portfolio/section-guidance.ts
/**
* Sections that make up a portfolio worth reviewing. Optional sections
* (certifications, achievements, social links, resume, imports) are surfaced
* when they have been started, but are never forced on the user.
*/
var CORE_SECTION_IDS = [
	"personalInformation",
	"education",
	"experience",
	"projects",
	"skills"
];
function isCoreSection(stepId) {
	return CORE_SECTION_IDS.includes(stepId);
}
/**
* Whether a section has been engaged: the user either visited it or entered at
* least one meaningful value. Visitation alone counts as "in progress" so a
* freshly opened builder reads as an active workflow rather than a checklist.
*/
function hasEngagedWithSection(data, visitedSteps, stepId) {
	return visitedSteps.includes(stepId) || isMeaningful(data[stepId]);
}
/**
* Three-state section status used for the BuilderSection pill and the sidebar
* step labels. Completion is content-based (reuses `isSectionCompleted`); a
* section that has been engaged but is not complete is "in progress".
*/
function getSectionStatus(data, visitedSteps, stepId) {
	if (isSectionCompleted(data, stepId)) return "complete";
	return hasEngagedWithSection(data, visitedSteps, stepId) ? "in-progress" : "not-started";
}
function countTokens(value) {
	return value.split(/[,;\n]/).map((token) => token.trim()).filter(Boolean).length;
}
function countAddedEntries(entries) {
	return entries.filter((entry) => isMeaningful(entry)).length;
}
function pluralize(count, singular, plural) {
	return `${count} ${count === 1 ? singular : plural}`;
}
/**
* A compact summary of what a complete section holds ("3 projects added",
* "12 skills added", "2 positions added"). Returns null for sections without a
* natural count and for incomplete sections, so the chip only ever communicates
* finished work. Reuses the completion logic — never reads navigation state.
*/
function getSectionSummary(data, stepId) {
	if (!isSectionCompleted(data, stepId)) return null;
	switch (stepId) {
		case "projects": return pluralize(countAddedEntries(data.projects), "project added", "projects added");
		case "experience": return pluralize(countAddedEntries(data.experience), "position added", "positions added");
		case "education": return pluralize(countAddedEntries(data.education), "education entry added", "education entries added");
		case "skills": return pluralize([
			data.skills.programmingLanguages,
			data.skills.frameworks,
			data.skills.databases,
			data.skills.devTools,
			data.skills.cloudPlatforms,
			data.skills.softSkills,
			data.skills.additionalSkills
		].reduce((sum, value) => sum + countTokens(value), 0), "skill added", "skills added");
		case "certifications": return pluralize(countAddedEntries(data.certifications), "certification added", "certifications added");
		case "achievements": return pluralize(countAddedEntries(data.achievements), "achievement added", "achievements added");
		case "resume": return "Resume uploaded";
		case "githubImport": {
			const count = data.githubImport.importedRepositories.length;
			return pluralize(count, "repository imported", "repositories imported");
		}
		case "linkedinImport": return "LinkedIn connected";
		default: return null;
	}
}
/**
* Whether the important sections are complete and the portfolio is worth
* reviewing. Optional sections never block review.
*/
function isPortfolioReadyForReview(data) {
	return CORE_SECTION_IDS.every((stepId) => isSectionCompleted(data, stepId));
}
/**
* The most useful section to work on next, steering the user through the
* important sections in existing flow order.
*
* - If the current section is an incomplete important section, recommend it
*   (finish what you are on) — a fresh portfolio points at Personal Information.
* - Otherwise recommend the first incomplete important section in flow order,
*   so the CTA is a real forward jump to the earliest missing content.
* - Optional sections are never pushed by the CTA: once every important section
*   is complete this returns undefined and the flow becomes "Preview Portfolio".
*/
function getNextGuidedStep(data, currentStep) {
	if (currentStep && isCoreSection(currentStep) && !isSectionCompleted(data, currentStep)) {
		const current = WIZARD_STEPS.find((step) => step.id === currentStep);
		if (current) return current;
	}
	return WIZARD_STEPS.find((step) => isCoreSection(step.id) && !isSectionCompleted(data, step.id));
}
//#endregion
//#region src/lib/ai/templates.ts
/**
* Registered portfolio templates. These are placeholder definitions only; no
* actual rendering exists yet. They drive both the prompt builder (which
* template to generate copy for) and the future renderer.
*/
var TEMPLATES = {
	classic: {
		id: "classic",
		name: "Classic",
		description: "A timeless, structured, professional layout suited to corporate roles.",
		keywords: [
			"professional",
			"structured",
			"corporate",
			"timeline"
		]
	},
	modern: {
		id: "modern",
		name: "Modern",
		description: "A contemporary, balanced layout with generous whitespace and cards.",
		keywords: [
			"contemporary",
			"balanced",
			"card-based",
			"clean"
		]
	},
	minimal: {
		id: "minimal",
		name: "Minimal",
		description: "A sparse, typography-first layout that lets content lead.",
		keywords: [
			"minimal",
			"typography",
			"sparse",
			"elegant"
		]
	},
	developer: {
		id: "developer",
		name: "Developer",
		description: "A technical layout emphasizing projects, skills, and side work.",
		keywords: [
			"technical",
			"projects",
			"open-source",
			"developer"
		]
	},
	creative: {
		id: "creative",
		name: "Creative",
		description: "An expressive layout with bold accents for design and artistic roles.",
		keywords: [
			"creative",
			"bold",
			"expressive",
			"design"
		]
	}
};
function getTemplate(id) {
	return TEMPLATES[id];
}
//#endregion
//#region src/lib/ai/prompt-builder.ts
var MODE_GUIDANCE = {
	concise: "Keep every description short, punchy, and limited to one or two sentences.",
	balanced: "Keep descriptions concise but complete; two to three sentences per entry.",
	detailed: "Expand descriptions to three to four sentences with measurable impact where possible."
};
/** Trims whitespace and normalizes CRLF / CR line breaks to a single LF. */
function clean(value) {
	if (!value) return "";
	return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
/** Splits a value into trimmed, non-empty lines (used for bullet lists). */
function cleanLines(value) {
	return clean(value).split("\n").map((line) => line.trim()).filter(Boolean);
}
/** Joins non-empty parts with a separator, returning '' when all are empty. */
function joinParts(separator, ...parts) {
	return parts.map(clean).filter(Boolean).join(separator);
}
/** Formats a single `- label: value` line, or '' when the value is empty. */
function fieldLine(label, value) {
	const content = clean(value);
	return content ? `- ${label}: ${content}` : "";
}
/**
* Builds a markdown `## Title` section from already-formatted lines.
* Returns an empty string when every line is blank so callers can skip the
* section automatically.
*/
function section(title, lines) {
	const content = lines.filter(Boolean);
	return content.length > 0 ? `## ${title}\n${content.join("\n")}` : "";
}
/** Builds a markdown `## Title` section from a list of present values. */
function bulletSection(title, values) {
	return section(title, values.map(clean));
}
/** `## Personal Information` — only non-empty contact fields are included. */
function buildPersonalPrompt(input) {
	const personal = input.data.personalInformation;
	return section("Personal Information", [
		fieldLine("Name", personal.fullName),
		fieldLine("Professional Title", personal.professionalTitle),
		fieldLine("Email", personal.email),
		fieldLine("Phone", personal.phone),
		fieldLine("Location", personal.location),
		fieldLine("Profile Photo", personal.profilePhoto?.name)
	]);
}
/** `## Education` — one bullet group per entry, skipping empty fields. */
function buildEducationPrompt(input) {
	const rows = [];
	for (const entry of input.data.education) {
		const title = joinParts(" at ", entry.degree, entry.institution);
		if (!title) continue;
		const years = joinParts(" - ", entry.startYear, entry.endYear);
		rows.push(`- ${title}`, fieldLine("Field of Study", entry.fieldOfStudy), fieldLine("Years", years), fieldLine("CGPA", entry.cgpa), fieldLine("Description", entry.description));
	}
	return section("Education", rows);
}
/** `## Experience` — one bullet group per entry, skipping empty fields. */
function buildExperiencePrompt(input) {
	const rows = [];
	for (const entry of input.data.experience) {
		const title = joinParts(" at ", entry.jobTitle, entry.company);
		if (!title) continue;
		const years = entry.currentlyWorking ? joinParts(" - ", entry.startDate, "Present") : joinParts(" - ", entry.startDate, entry.endDate);
		rows.push(`- ${title}`, fieldLine("Employment Type", entry.employmentType), fieldLine("Location", entry.location), fieldLine("Period", years), fieldLine("Description", entry.description));
	}
	return section("Experience", rows);
}
/** `## Projects` — one bullet group per entry, including highlights. */
function buildProjectsPrompt(input) {
	const rows = [];
	for (const entry of input.data.projects) {
		if (!clean(entry.projectName)) continue;
		const title = joinParts(" — ", entry.projectName, entry.projectRole);
		rows.push(`- ${title}`, fieldLine("Technologies", entry.technologies), fieldLine("Repository", entry.githubUrl), fieldLine("Live Demo", entry.demoUrl), fieldLine("Description", entry.description), ...cleanLines(entry.highlights).map((highlight) => `  - Highlight: ${highlight}`));
	}
	return section("Projects", rows);
}
/** `## Skills` — one `- Category: value` line per populated category. */
function buildSkillsPrompt(input) {
	const skills = input.data.skills;
	return section("Skills", [
		["Programming Languages", skills.programmingLanguages],
		["Frameworks", skills.frameworks],
		["Databases", skills.databases],
		["Developer Tools", skills.devTools],
		["Cloud Platforms", skills.cloudPlatforms],
		["Soft Skills", skills.softSkills],
		["Additional Skills", skills.additionalSkills]
	].map(([label, value]) => fieldLine(label, value)));
}
/** `## Certifications` — one bullet group per entry. */
function buildCertificationPrompt(input) {
	const rows = [];
	for (const entry of input.data.certifications) {
		if (!clean(entry.certificationName)) continue;
		rows.push(`- ${clean(entry.certificationName)}`, fieldLine("Organization", entry.issuingOrganization), fieldLine("Issue Date", entry.issueDate), fieldLine("Credential ID", entry.credentialId), fieldLine("Credential URL", entry.credentialUrl), fieldLine("Description", entry.description));
	}
	return section("Certifications", rows);
}
/** `## Achievements` — one bullet group per entry. */
function buildAchievementPrompt(input) {
	const rows = [];
	for (const entry of input.data.achievements) {
		if (!clean(entry.achievementTitle)) continue;
		rows.push(`- ${clean(entry.achievementTitle)}`, fieldLine("Organization", entry.organization), fieldLine("Date", entry.achievementDate), fieldLine("Category", entry.category), fieldLine("Description", entry.description), fieldLine("Supporting Link", entry.supportingLink));
	}
	return section("Achievements", rows);
}
/** `## Social Links` — populated profiles only. */
function buildSocialPrompt(input) {
	const social = input.data.socialLinks[0];
	return bulletSection("Social Links", [
		social ? `LinkedIn: ${social.linkedinProfile}` : void 0,
		social ? `GitHub: ${social.githubProfile}` : void 0,
		social ? `Website: ${social.portfolioWebsite}` : void 0,
		social ? `Twitter: ${social.twitterProfile}` : void 0,
		social ? `Instagram: ${social.instagram}` : void 0,
		social ? `YouTube: ${social.youtubeChannel}` : void 0,
		social ? `Other: ${social.otherWebsite}` : void 0
	]);
}
function joinOptional(...values) {
	return values.filter((value) => Boolean(value)).join(", ");
}
/**
* Converts wizard data into a structured AI prompt.
* Pure string generation; performs no networking.
*/
function buildPrompt(input) {
	const template = getTemplate(input.templateId);
	const mode = input.mode ?? "balanced";
	const targetRole = input.targetRole?.trim();
	return {
		role: "portfolio-copywriter",
		system: "You are a senior portfolio copywriter. You convert raw resume data into polished, professional portfolio copy that conforms exactly to the requested structure. Never invent facts that are not present in the source data. Return valid structured content.",
		template: `Template: ${template.name} (${template.description})`,
		personal: buildPersonalPrompt(input),
		experience: buildExperiencePrompt(input),
		projects: buildProjectsPrompt(input),
		skills: buildSkillsPrompt(input),
		education: buildEducationPrompt(input),
		certifications: buildCertificationPrompt(input),
		achievements: buildAchievementPrompt(input),
		social: buildSocialPrompt(input),
		instructions: joinOptional(`Target role: ${targetRole}`, MODE_GUIDANCE[mode], `Output style should match the "${template.name}" template.`)
	};
}
//#endregion
//#region src/lib/ai/portfolio-schema.ts
/** Version of the normalized output schema. */
var PORTFOLIO_SCHEMA_VERSION = "1.0.0";
//#endregion
//#region src/lib/ai/transformer.ts
/** Trims whitespace and normalizes CRLF / CR line breaks to a single LF. */
function normalizeText(value) {
	if (!value) return "";
	return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
/**
* Splits a value on the given separator, trims each part, drops empty items
* and removes case-insensitive duplicates.
*/
function normalizeArray(value, separator = /[,;\n]/) {
	if (!value) return [];
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const item of value.split(separator)) {
		const normalized = normalizeText(item);
		if (!normalized) continue;
		const key = normalized.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(normalized);
	}
	return result;
}
/**
* Returns a shallow copy of a record with empty entries removed
* (undefined / null / blank strings / empty arrays).
*/
function removeEmptyFields(value) {
	const result = {};
	const source = value;
	for (const key of Object.keys(source)) {
		const entry = source[key];
		if (!(entry === void 0 || entry === null || typeof entry === "string" && normalizeText(entry) === "" || Array.isArray(entry) && entry.length === 0)) result[key] = entry;
	}
	return result;
}
/** Generates a URL-safe slug from any text (falls back to "portfolio"). */
function generateSlug(value) {
	return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "portfolio";
}
/** Builds generation metadata (createdAt, updatedAt, version, template, language). */
function generateMetadata(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		templateId: input.templateId,
		mode: input.mode ?? "balanced",
		schemaVersion: PORTFOLIO_SCHEMA_VERSION,
		generatedAt: now,
		source: "mock",
		createdAt: now,
		updatedAt: now,
		version: PORTFOLIO_SCHEMA_VERSION,
		template: input.templateId,
		language: "en"
	};
}
/** Builds default SEO (title, description, keywords, slug, canonical, og placeholder). */
function generateSEO(data) {
	const personal = data.personalInformation;
	const fullName = normalizeText(personal.fullName);
	const titleText = normalizeText(personal.professionalTitle);
	const slug = generateSlug(fullName || titleText);
	const description = normalizeText(personal.about) || (titleText ? `${titleText} portfolio` : "");
	const keywords = [titleText, ...Object.values(removeEmptyFields(data.skills)).flatMap((value) => normalizeArray(value))];
	return {
		title: [fullName, titleText].filter(Boolean).join(" — ") || "Portfolio",
		description: description.slice(0, 160),
		keywords,
		slug,
		canonicalUrl: `/p/${slug}`,
		ogImage: `/og/${slug}.png`
	};
}
/** Transforms wizard experience entries into normalized output entries. */
function transformExperience(input) {
	return input.data.experience.map((entry, index) => ({
		id: `exp-${index + 1}`,
		role: normalizeText(entry.jobTitle),
		company: normalizeText(entry.company),
		employmentType: normalizeText(entry.employmentType),
		location: normalizeText(entry.location),
		startDate: normalizeText(entry.startDate),
		endDate: entry.currentlyWorking ? "" : normalizeText(entry.endDate),
		currentlyWorking: entry.currentlyWorking,
		description: normalizeText(entry.description)
	})).filter((entry) => entry.role !== "" || entry.company !== "");
}
/** Transforms wizard projects, deduping technologies and highlights. */
function transformProjects(input) {
	return input.data.projects.map((entry, index) => ({
		id: `prj-${index + 1}`,
		name: normalizeText(entry.projectName),
		role: normalizeText(entry.projectRole),
		technologies: normalizeArray(entry.technologies),
		repositoryUrl: normalizeText(entry.githubUrl) || void 0,
		liveUrl: normalizeText(entry.demoUrl) || void 0,
		description: normalizeText(entry.description),
		highlights: normalizeArray(entry.highlights, /\n/)
	})).filter((entry) => entry.name !== "");
}
/** Transforms wizard education entries into normalized output entries. */
function transformEducation(input) {
	return input.data.education.map((entry, index) => ({
		id: `edc-${index + 1}`,
		degree: normalizeText(entry.degree),
		institution: normalizeText(entry.institution),
		fieldOfStudy: normalizeText(entry.fieldOfStudy),
		startYear: normalizeText(entry.startYear),
		endYear: normalizeText(entry.endYear),
		cgpa: normalizeText(entry.cgpa),
		description: normalizeText(entry.description)
	})).filter((entry) => entry.degree !== "" || entry.institution !== "");
}
/** Transforms wizard skills into deduplicated category/value pairs. */
function transformSkills(input) {
	const skills = input.data.skills;
	const categories = [
		["Programming Languages", skills.programmingLanguages],
		["Frameworks", skills.frameworks],
		["Databases", skills.databases],
		["Developer Tools", skills.devTools],
		["Cloud Platforms", skills.cloudPlatforms],
		["Soft Skills", skills.softSkills],
		["Additional Skills", skills.additionalSkills]
	];
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const [category, value] of categories) {
		const normalized = normalizeArray(value);
		if (normalized.length === 0) continue;
		const combined = normalized.join(", ");
		const key = combined.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push({
			category,
			value: combined
		});
	}
	return result;
}
/** Transforms wizard certifications into normalized output entries. */
function transformCertifications(input) {
	return input.data.certifications.map((entry, index) => ({
		id: `cert-${index + 1}`,
		name: normalizeText(entry.certificationName),
		issuingOrganization: normalizeText(entry.issuingOrganization),
		issueDate: normalizeText(entry.issueDate),
		credentialId: normalizeText(entry.credentialId),
		credentialUrl: normalizeText(entry.credentialUrl),
		description: normalizeText(entry.description)
	})).filter((entry) => entry.name !== "");
}
/** Transforms wizard achievements into normalized output entries. */
function transformAchievements(input) {
	return input.data.achievements.map((entry, index) => ({
		id: `ach-${index + 1}`,
		title: normalizeText(entry.achievementTitle),
		organization: normalizeText(entry.organization),
		date: normalizeText(entry.achievementDate),
		category: normalizeText(entry.category),
		description: normalizeText(entry.description),
		link: normalizeText(entry.supportingLink)
	})).filter((entry) => entry.title !== "");
}
/** Transforms the first social links row into a normalized object (null when empty). */
function transformSocialLinks(input) {
	const social = input.data.socialLinks[0];
	if (!social) return null;
	const links = removeEmptyFields({
		linkedin: normalizeText(social.linkedinProfile),
		github: normalizeText(social.githubProfile),
		website: normalizeText(social.portfolioWebsite),
		twitter: normalizeText(social.twitterProfile),
		instagram: normalizeText(social.instagram),
		youtube: normalizeText(social.youtubeChannel),
		other: normalizeText(social.otherWebsite)
	});
	return Object.keys(links).length > 0 ? links : null;
}
/** Transforms resume attachment metadata (null when empty). */
function transformResume(input) {
	const resume = input.data.resume;
	if (!normalizeText(resume.fileName) && !normalizeText(resume.fileUrl) && resume.fileSize <= 0) return null;
	return {
		fileName: normalizeText(resume.fileName),
		fileType: normalizeText(resume.fileType),
		fileSize: resume.fileSize,
		fileUrl: normalizeText(resume.fileUrl) || void 0
	};
}
/**
* Collects builder-only data that the normalized output does not model so it
* survives a save → edit → save round-trip. The profile photo (name, type,
* size and its data URL) is preserved so the stored portfolio can keep and
* re-render the user's uploaded image. Returns undefined when nothing needs
* preserving.
*/
function transformBuilderExtras(input) {
	const personal = input.data.personalInformation;
	const social = input.data.socialLinks[0];
	const github = input.data.githubImport;
	const linkedin = input.data.linkedinImport;
	const extras = {};
	const email = normalizeText(personal.email);
	if (email) extras.email = email;
	const phone = normalizeText(personal.phone);
	if (phone) extras.phone = phone;
	const location = normalizeText(personal.location);
	if (location) extras.location = location;
	const about = normalizeText(personal.about);
	if (about) extras.about = about;
	const profilePhoto = personal.profilePhoto;
	if (profilePhoto && profilePhoto.dataUrl) extras.profilePhoto = {
		name: profilePhoto.name,
		type: profilePhoto.type,
		size: profilePhoto.size,
		dataUrl: profilePhoto.dataUrl
	};
	if (social?.customLinks?.length) {
		const links = social.customLinks.map((link) => ({
			label: normalizeText(link.label),
			url: normalizeText(link.url)
		})).filter((link) => link.label !== "" || link.url !== "");
		if (links.length > 0) extras.customLinks = links;
	}
	if (github && (github.connected || normalizeText(github.githubUsername) !== "" || normalizeText(github.repositoryVisibility) !== "" || (github.importedRepositories ?? []).length > 0)) extras.githubImport = {
		githubUsername: normalizeText(github.githubUsername),
		repositoryVisibility: normalizeText(github.repositoryVisibility),
		connected: github.connected,
		importedRepositories: (github.importedRepositories ?? []).map((repository) => ({
			name: normalizeText(repository.name),
			description: normalizeText(repository.description),
			url: normalizeText(repository.url),
			technologies: (repository.technologies ?? []).map((technology) => normalizeText(technology)).filter((technology) => technology !== "")
		})).filter((repository) => repository.name !== "" || repository.url !== "")
	};
	if (linkedin && (linkedin.connected || normalizeText(linkedin.linkedinProfileUrl) !== "" || normalizeText(linkedin.importMode) !== "")) extras.linkedinImport = {
		linkedinProfileUrl: normalizeText(linkedin.linkedinProfileUrl),
		importMode: normalizeText(linkedin.importMode),
		connected: linkedin.connected
	};
	return Object.keys(extras).length > 0 ? extras : void 0;
}
function buildSections(data, state) {
	return [
		{
			id: "summary",
			title: "Summary",
			present: Boolean(normalizeText(data.personalInformation.fullName) || normalizeText(data.personalInformation.about) || normalizeText(data.personalInformation.professionalTitle))
		},
		{
			id: "experience",
			title: "Experience",
			present: state.experience > 0
		},
		{
			id: "projects",
			title: "Projects",
			present: state.projects > 0
		},
		{
			id: "skills",
			title: "Skills",
			present: state.skills > 0
		},
		{
			id: "education",
			title: "Education",
			present: state.education > 0
		},
		{
			id: "certifications",
			title: "Certifications",
			present: state.certifications > 0
		},
		{
			id: "achievements",
			title: "Achievements",
			present: state.achievements > 0
		},
		{
			id: "social",
			title: "Social",
			present: state.social
		}
	].filter((definition) => definition.present).map((definition, index) => ({
		id: definition.id,
		title: definition.title,
		order: index
	}));
}
/**
* Single source of truth for every future renderer: converts raw wizard data
* into a clean, normalized, strongly typed `PortfolioOutput`.
*/
function transformPortfolio(input) {
	const data = input.data;
	const template = getTemplate(input.templateId);
	const experience = transformExperience(input);
	const projects = transformProjects(input);
	const education = transformEducation(input);
	const skills = transformSkills(input);
	const certifications = transformCertifications(input);
	const achievements = transformAchievements(input);
	const social = transformSocialLinks(input);
	const resume = transformResume(input);
	const sections = buildSections(data, {
		summary: true,
		experience: experience.length,
		projects: projects.length,
		skills: skills.length,
		education: education.length,
		certifications: certifications.length,
		achievements: achievements.length,
		social: social !== null
	});
	return {
		schemaVersion: PORTFOLIO_SCHEMA_VERSION,
		theme: {
			templateId: template.id,
			name: template.name,
			description: template.description,
			keywords: template.keywords
		},
		sections,
		projects,
		experience,
		skills,
		education,
		achievements,
		certifications,
		social,
		resume,
		seo: generateSEO(data),
		metadata: generateMetadata(input),
		builder: transformBuilderExtras(input)
	};
}
//#endregion
//#region src/lib/ai/generator.ts
/**
* Orchestrates generation. Until a real provider is wired up, it transforms
* the wizard data into the normalized output directly — no external calls are
* made. The optional `prompt` is the prepared AI instruction threaded through
* the pipeline for the future provider; the mock engine does not consume it yet.
*/
function generatePortfolio$1(input, prompt) {
	return transformPortfolio(input);
}
//#endregion
//#region src/lib/themes/themes.ts
var PRIMARY_BUTTON = "inline-flex items-center gap-xs bg-primary px-md py-sm text-button font-medium text-on-primary transition duration-200 hover:bg-primary-hover";
var GHOST_BUTTON = "inline-flex items-center gap-xs border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition duration-200 hover:bg-surface-3";
var DEFAULT_THEME_ID = "modern";
/**
* The five built-in portfolio themes. These are metadata + presentation-class
* definitions only; they describe how to style a portfolio without changing the
* normalized portfolio data.
*/
var THEMES = {
	classic: {
		id: "classic",
		name: "Classic",
		description: "A timeless, structured layout suited to corporate roles.",
		previewColor: "#828fff",
		fontPairing: {
			body: "Sans-serif",
			heading: "Sans-serif"
		},
		spacingProfile: "spacious",
		cardStyle: "Subtle rounded card",
		buttonStyle: "Rounded primary",
		layoutStyle: "Centered page column",
		sectionSpacing: "Large section rhythm",
		presentation: {
			font: "font-sans",
			display: "font-sans",
			card: "card rounded-sm",
			button: `${PRIMARY_BUTTON} rounded-md`,
			ghostButton: `${GHOST_BUTTON} rounded-md`,
			layout: "mx-auto w-full max-w-page",
			sectionSpacing: "mb-xl md:mb-section",
			heading: "text-ink",
			accent: "text-primary-hover"
		}
	},
	modern: {
		id: "modern",
		name: "Modern",
		description: "A contemporary, balanced layout with generous whitespace and cards.",
		previewColor: "#5e6ad2",
		fontPairing: {
			body: "Inter",
			heading: "Inter"
		},
		spacingProfile: "balanced",
		cardStyle: "Soft rounded card",
		buttonStyle: "Rounded primary",
		layoutStyle: "Centered page",
		sectionSpacing: "Large section rhythm",
		presentation: {
			font: "font-sans",
			display: "font-sans",
			card: "card rounded-xl",
			button: `${PRIMARY_BUTTON} rounded-lg`,
			ghostButton: `${GHOST_BUTTON} rounded-lg`,
			layout: "mx-auto w-full max-w-page",
			sectionSpacing: "mb-xl md:mb-section",
			heading: "text-ink",
			accent: "text-primary"
		}
	},
	minimal: {
		id: "minimal",
		name: "Minimal",
		description: "A sparse, typography-first layout that lets content lead.",
		previewColor: "#8a8f98",
		fontPairing: {
			body: "Inter",
			heading: "Inter"
		},
		spacingProfile: "compact",
		cardStyle: "Sharp, restrained card",
		buttonStyle: "Square primary",
		layoutStyle: "Narrow reading column",
		sectionSpacing: "Moderate section rhythm",
		presentation: {
			font: "font-sans",
			display: "font-sans",
			card: "card rounded-none",
			button: `${PRIMARY_BUTTON} rounded-none`,
			ghostButton: `${GHOST_BUTTON} rounded-none`,
			layout: "mx-auto w-full max-w-narrow",
			sectionSpacing: "mb-md md:mb-xl",
			heading: "text-ink",
			accent: "text-ink"
		}
	},
	developer: {
		id: "developer",
		name: "Developer",
		description: "A technical layout emphasizing projects, skills, and side work.",
		previewColor: "#f5a623",
		fontPairing: {
			body: "Inter",
			heading: "JetBrains Mono"
		},
		spacingProfile: "balanced",
		cardStyle: "Technical, bordered card",
		buttonStyle: "Monospaced primary",
		layoutStyle: "Wide technical grid",
		sectionSpacing: "Large section rhythm",
		presentation: {
			font: "font-sans",
			display: "font-mono",
			card: "card rounded-md font-mono border-hairline-strong",
			button: `${PRIMARY_BUTTON} rounded-md font-mono`,
			ghostButton: `${GHOST_BUTTON} rounded-md font-mono`,
			layout: "mx-auto w-full max-w-wide",
			sectionSpacing: "mb-xl md:mb-section",
			heading: "text-ink",
			accent: "text-primary"
		}
	},
	creative: {
		id: "creative",
		name: "Creative",
		description: "An expressive layout with bold accents for design and artistic roles.",
		previewColor: "#27a644",
		fontPairing: {
			body: "Inter",
			heading: "Inter"
		},
		spacingProfile: "spacious",
		cardStyle: "Expressive, pill-raised card",
		buttonStyle: "Pill primary",
		layoutStyle: "Centered page",
		sectionSpacing: "Extra roomy rhythm",
		presentation: {
			font: "font-sans",
			display: "font-sans",
			card: "card rounded-2xl border-primary-focus",
			button: `${PRIMARY_BUTTON} rounded-full`,
			ghostButton: `${GHOST_BUTTON} rounded-full`,
			layout: "mx-auto w-full max-w-page",
			sectionSpacing: "mb-xl md:mb-xxl",
			heading: "text-ink",
			accent: "text-semantic-warning"
		}
	}
};
//#endregion
//#region src/lib/themes/theme-utils.ts
/** Type guard for a theme id. */
function isThemeId(value) {
	return value in THEMES;
}
/** Resolves a theme by id (falls back to the first available theme). */
function getThemeById(id) {
	return THEMES[id] ?? THEMES[Object.keys(THEMES)[0]];
}
/**
* A token-based swatch class for the theme selector. Returns an existing
* design-token utility (never raw hex), so no inline colors are introduced.
*/
function previewSwatchClass(themeId) {
	return {
		classic: "bg-primary-hover",
		modern: "bg-primary",
		minimal: "bg-ink-subtle",
		developer: "bg-semantic-warning",
		creative: "bg-semantic-success"
	}[themeId];
}
//#endregion
//#region src/lib/themes/theme-store.ts
/** Session-scoped key so the active theme survives a Preview refresh. */
var SESSION_KEY = "portforge:theme:v1";
/** Reads a persisted theme id (session only). Returns null when unavailable. */
function readSessionThemeId() {
	if (typeof window === "undefined" || typeof sessionStorage === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return typeof parsed.id === "string" && isThemeId(parsed.id) ? parsed.id : null;
	} catch {
		return null;
	}
}
/** Persists the active theme id for the current browsing session. */
function writeSessionThemeId(id) {
	if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id }));
	} catch {}
}
/**
* The theme store is the single source of truth for the active theme. It is
* safe to construct in any environment (SSR/build leaves it at the default);
* in a browser it restores the session's theme from `sessionStorage`.
*/
var ThemeStoreImpl = class {
	current = THEMES[readSessionThemeId() ?? "modern"];
	listeners = /* @__PURE__ */ new Set();
	getTheme() {
		return this.current;
	}
	setTheme(id) {
		const next = THEMES[id];
		if (!next || next === this.current) return;
		this.current = next;
		this.persist();
		this.notify();
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	/** Removes a previously registered theme listener. */
	unsubscribe(listener) {
		this.listeners.delete(listener);
	}
	resetTheme() {
		if (this.current === THEMES["modern"]) return;
		this.current = THEMES[DEFAULT_THEME_ID];
		this.persist();
		this.notify();
	}
	getAvailableThemes() {
		return Object.values(THEMES);
	}
	persist() {
		writeSessionThemeId(this.current.id);
	}
	notify() {
		for (const listener of this.listeners) listener(this.current);
	}
};
var themeStore = new ThemeStoreImpl();
//#endregion
//#region src/lib/publish/publish-utils.ts
var PUBLISH_SCHEMA_VERSION = "1.0.0";
var SLUG_MAX_LENGTH = 60;
/**
* Generates a URL-safe slug from any name. Pure and deterministic; falls back
* to `fallback` when the result would be empty.
*/
function generatePublishSlug(name, fallback = "portfolio") {
	return name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, SLUG_MAX_LENGTH) || fallback;
}
/**
* Estimates the number of static pages a build would produce. A portfolio is
* a single page by default, plus one detail page per project.
*/
function estimatePageCount(output) {
	return 1 + ((output.projects?.length ?? 0) > 0 ? output.projects.length : 0);
}
var BYTES = {
	overhead: 28e3,
	section: 2200,
	perProject: 900,
	perExperience: 700,
	perSkill: 400,
	perEducation: 500,
	perAchievement: 600,
	perCertification: 500,
	perSocial: 600
};
/**
* Rough byte estimate of the rendered portfolio. A small constant per part,
* consistent with the renderer — deterministic and free of I/O.
*/
function estimateBuildSize(output, includeAssets = true) {
	let bytes = BYTES.overhead;
	bytes += (output.sections?.length ?? 0) * BYTES.section;
	bytes += (output.projects?.length ?? 0) * BYTES.perProject;
	bytes += (output.experience?.length ?? 0) * BYTES.perExperience;
	bytes += (output.skills?.length ?? 0) * BYTES.perSkill;
	bytes += (output.education?.length ?? 0) * BYTES.perEducation;
	bytes += (output.achievements?.length ?? 0) * BYTES.perAchievement;
	bytes += (output.certifications?.length ?? 0) * BYTES.perCertification;
	bytes += output.social ? BYTES.perSocial : 0;
	if (includeAssets && output.resume) bytes += output.resume.fileSize ?? 0;
	return bytes;
}
/** Derives a stable portfolio id from a slug. */
function buildPortfolioId(slug) {
	return `p-${slug}`;
}
//#endregion
//#region src/lib/publish/publish-validator.ts
function hasValue(value) {
	return typeof value === "string" && value.trim().length > 0;
}
/**
* Validates a normalized portfolio output and produces a readiness report
* covering required metadata (title, personal info, projects, skills, theme,
* SEO). Pure and provider-independent.
*/
function validatePortfolio(output) {
	const items = [];
	const warnings = [];
	const missing = [];
	const hasTitle = hasValue(output.seo?.title ?? output.theme?.name ?? "");
	const hasPersonalInfo = hasValue(output.seo?.description) || hasValue(output.seo?.title);
	const hasProjects = (output.projects?.length ?? 0) > 0;
	const hasSkills = (output.skills?.length ?? 0) > 0;
	const hasTheme = output.theme !== null && output.theme !== void 0;
	const hasSeo = output.seo !== null && output.seo !== void 0 && hasValue(output.seo.description);
	const hasSocial = output.social !== null && output.social !== void 0;
	const check = (label, passes, detail) => {
		const status = passes ? "ready" : "missing";
		if (!passes) missing.push(label);
		items.push({
			label,
			status,
			detail
		});
	};
	check("Portfolio title", hasTitle, "Used as the site title and in search results.");
	check("Personal Information", hasPersonalInfo, "Provides the human context behind the portfolio.");
	check("Projects", hasProjects, "Project entries showcase your body of work.");
	check("Skills", hasSkills, "Skills communicate your areas of expertise.");
	check("Theme", hasTheme, "A visual theme is selected for the presentation.");
	check("SEO metadata", hasSeo, "Search and social sharing rely on SEO metadata.");
	if (!hasSocial) warnings.push("No social links provided — consider adding profiles for discoverability.");
	if ((output.education?.length ?? 0) === 0) warnings.push("Education section is empty — optional but recommended.");
	if (output.resume === null) warnings.push("No resume attached. Download availability is limited.");
	const ready = missing.length === 0;
	return {
		ready,
		status: ready ? "ready" : "not-ready",
		items,
		warnings,
		missing,
		estimatedSizeBytes: estimateBuildSize(output),
		estimatedPages: estimatePageCount(output)
	};
}
//#endregion
//#region src/lib/publish/publish-manifest.ts
/**
* Builds a full publish manifest for a portfolio. Metadata only — no files are
* generated. The result is deterministic given the same inputs.
*/
function generateManifest(output, assets, options = {}) {
	const seoTitle = output.seo?.title ?? output.theme?.name ?? "Portfolio";
	const slug = options.slug ?? output.seo?.slug ?? generatePublishSlug(seoTitle);
	const name = options.name ?? seoTitle;
	const generatedAt = options.generatedAt ?? (/* @__PURE__ */ new Date()).toISOString();
	const version = options.version ?? output.metadata?.version ?? "1.0.0";
	const language = options.language ?? output.metadata?.language ?? "en";
	return {
		id: buildPortfolioId(slug),
		slug,
		name,
		theme: output.theme?.name ?? output.theme?.templateId ?? "none",
		generatedAt,
		version,
		language,
		schemaVersion: PUBLISH_SCHEMA_VERSION,
		seo: {
			title: seoTitle,
			description: output.seo?.description ?? "",
			keywords: output.seo?.keywords ?? []
		},
		sections: (output.sections ?? []).map((section) => ({
			id: section.id,
			title: section.title,
			order: section.order
		})),
		assets,
		build: {
			schemaVersion: output.schemaVersion ?? "1.0.0",
			pages: estimatePageCount(output),
			estimatedSizeBytes: estimateBuildSize(output)
		}
	};
}
//#endregion
//#region src/lib/publish/publish.ts
/**
* Resolves the slug for a portfolio, preferring the explicit option, then the
* output's SEO slug, then a slug derived from the title.
*/
function resolveSlug(output, options = {}) {
	return options.slug ?? output.seo?.slug ?? generatePublishSlug(output.seo?.title ?? "Portfolio");
}
/**
* Describes the deployable assets for a portfolio as pure metadata. No files
* are created — this is the contract future adapters will build against.
*/
function prepareAssets(output, options = {}) {
	const slug = resolveSlug(output, options);
	const assets = [];
	assets.push({
		id: "home",
		type: "html",
		name: "index.html",
		path: "/index.html",
		sizeBytes: estimateBuildSize(output, false)
	});
	const jsonSize = JSON.stringify(output).length;
	assets.push({
		id: "data",
		type: "json",
		name: "portfolio.json",
		path: `/p/${slug}/portfolio.json`,
		sizeBytes: jsonSize
	});
	if (output.seo?.ogImage) assets.push({
		id: "og-image",
		type: "image",
		name: `${slug}-og.png`,
		path: `/og/${slug}.png`,
		sizeBytes: 0
	});
	if (output.resume?.fileUrl || output.resume?.fileName) assets.push({
		id: "resume",
		type: "pdf",
		name: output.resume?.fileName ?? "resume.pdf",
		path: output.resume?.fileUrl ?? `/resume/${slug}.pdf`,
		sizeBytes: output.resume?.fileSize ?? 0
	});
	return assets;
}
/**
* Assembles a complete, reusable publish package from a normalized output.
* The package is the input for future deployment adapters.
*/
function generatePortfolioPackage(output, options = {}) {
	const assets = prepareAssets(output, options);
	const manifest = generateManifest(output, assets, options);
	return {
		output,
		theme: output.theme,
		seo: output.seo,
		manifest,
		assets,
		settings: options
	};
}
//#endregion
//#region src/lib/portfolio/generator.ts
/**
* Reuses the publish module's functions to build a `PublishResult` directly
* from an already-generated output — avoiding a second portfolio transform.
*/
function buildPublishResult(portfolio) {
	const readiness = validatePortfolio(portfolio);
	const manifest = generateManifest(portfolio, prepareAssets(portfolio));
	const pkg = readiness.ready ? generatePortfolioPackage(portfolio) : null;
	return {
		ok: readiness.ready,
		status: readiness.status,
		slug: manifest.slug,
		readiness,
		manifest,
		package: pkg
	};
}
/**
* The one public entry point of the generation pipeline. Reads the wizard
* store (or an explicit override), threads the active theme through, builds
* the AI prompt, runs the mocked AI engine, and prepares the publish payload —
* all by reusing the existing modules. No duplicated logic or transforms.
*
* Flow:
*   wizardStore ─► PortfolioInput ─► buildPrompt ─► AI engine ─► PortfolioOutput
*        themeStore ──────────────────────────────┘            ─► SEO
*                                                        publish ─► PublishResult
*/
function generatePortfolio(data) {
	const source = data ?? wizardStore.getState().data;
	const theme = themeStore.getTheme();
	const input = {
		data: source,
		templateId: theme.id,
		mode: "balanced"
	};
	const portfolio = generatePortfolio$1(input, buildPrompt(input));
	const publish = buildPublishResult(portfolio);
	return {
		portfolio,
		seo: portfolio.seo,
		theme,
		publish
	};
}
//#endregion
export { createEmptySocialLinks as _, previewSwatchClass as a, $$Github as b, getSectionStatus as c, getBuilderProgress as d, isMeaningful as f, WIZARD_STEPS as g, TOTAL_STEPS as h, isThemeId as i, getSectionSummary as l, wizardStore as m, themeStore as n, DEFAULT_THEME_ID as o, isSectionCompleted as p, getThemeById as r, getNextGuidedStep as s, generatePortfolio as t, isPortfolioReadyForReview as u, $$Trophy as v, $$Component as x, $$Sparkles as y };
