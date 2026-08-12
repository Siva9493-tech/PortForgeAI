/**
 * Copies `text` to the clipboard. Uses the async Clipboard API when available
 * (secure contexts), otherwise falls back to a hidden textarea + the legacy
 * `document.execCommand('copy')` path. Resolves `true` when the copy
 * succeeded, `false` when it failed or was unavailable. Callers should give
 * the user explicit feedback based on the boolean.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// Fall through to the legacy path below.
	}
	return legacyCopy(text);
}

/** Hidden-textarea fallback for environments without the async Clipboard API. */
function legacyCopy(text: string): boolean {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	document.body.appendChild(textarea);
	textarea.select();
	textarea.setSelectionRange(0, textarea.value.length);

	let copied = false;
	try {
		const legacyDocument = document as unknown as {
			execCommand(command: string): boolean;
		};
		copied = legacyDocument.execCommand('copy');
	} catch {
		copied = false;
	}

	document.body.removeChild(textarea);
	return copied;
}
