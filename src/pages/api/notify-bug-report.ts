import type { APIRoute } from 'astro';

export const prerender = false;

const DEVELOPER_EMAIL = 'mamidalasivabalaji@gmail.com';

function getEnv(key: string): string | undefined {
	const fromMeta = import.meta.env[key];
	if (typeof fromMeta === 'string' && fromMeta) return fromMeta;
	const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
	return proc?.env?.[key];
}

function escapeHtml(text?: string | null): string {
	if (!text) return '';
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

interface ScreenshotSummary {
	name: string;
	type: string;
	size: number;
	dataUrl?: string;
}

interface NotificationPayload {
	reportId: string;
	category: string;
	title: string;
	description: string;
	expectedBehavior: string;
	reproductionSteps?: string;
	additionalMessage?: string;
	userEmail?: string | null;
	userId?: string | null;
	createdAt: string;
	deviceInfo?: {
		userAgent?: string;
		screenWidth?: number;
		screenHeight?: number;
		pathname?: string;
	};
	screenshotCount?: number;
	screenshots?: ScreenshotSummary[];
}

export const POST: APIRoute = async ({ request }) => {
	try {
		let body: NotificationPayload;
		try {
			body = await request.json();
		} catch {
			return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const {
			reportId,
			category,
			title,
			description,
			expectedBehavior,
			reproductionSteps,
			additionalMessage,
			userEmail,
			userId,
			createdAt,
			deviceInfo,
			screenshotCount = 0,
			screenshots = [],
		} = body;

		if (!reportId || !title || !description) {
			return new Response(JSON.stringify({ error: 'Missing required report fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const recipient =
			getEnv('DEVELOPER_NOTIFICATION_EMAIL')?.trim() || DEVELOPER_EMAIL;
		const resendApiKey = getEnv('RESEND_API_KEY')?.trim();
		const sendgridApiKey = getEnv('SENDGRID_API_KEY')?.trim();
		const webhookUrl = getEnv('NOTIFICATION_WEBHOOK_URL')?.trim();

		const subject = `[PortForge AI] New Bug Report — ${title}`;

		const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
		.container { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
		.header { background: #0f172a; color: #ffffff; padding: 20px 24px; }
		.header h1 { margin: 0; font-size: 18px; font-weight: 600; }
		.badge { display: inline-block; padding: 4px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; background: #e0e7ff; color: #3730a3; margin-top: 8px; }
		.content { padding: 24px; }
		.section { margin-bottom: 20px; }
		.section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
		.section-body { font-size: 14px; background: #f1f5f9; padding: 12px 14px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
		.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
		.meta-table td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
		.meta-label { color: #64748b; width: 140px; font-weight: 500; }
		.meta-val { color: #0f172a; font-family: monospace; }
		.footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>PortForge AI Bug Report</h1>
			<span class="badge">${escapeHtml(category || 'Bug')}</span>
		</div>
		<div class="content">
			<table class="meta-table">
				<tr>
					<td class="meta-label">Reference ID:</td>
					<td class="meta-val">#${escapeHtml(reportId)}</td>
				</tr>
				<tr>
					<td class="meta-label">Submitted By:</td>
					<td class="meta-val">${escapeHtml(userEmail || 'Anonymous')} ${userId ? `(${escapeHtml(userId)})` : ''}</td>
				</tr>
				<tr>
					<td class="meta-label">Created At:</td>
					<td class="meta-val">${escapeHtml(createdAt || new Date().toISOString())}</td>
				</tr>
				<tr>
					<td class="meta-label">Page / Path:</td>
					<td class="meta-val">${escapeHtml(deviceInfo?.pathname || '/report-bug')}</td>
				</tr>
				<tr>
					<td class="meta-label">Screenshots:</td>
					<td class="meta-val">${screenshotCount} attachment(s) recorded in Supabase</td>
				</tr>
			</table>

			<div class="section">
				<div class="section-title">Bug Title</div>
				<div style="font-size: 16px; font-weight: 600; color: #0f172a;">${escapeHtml(title)}</div>
			</div>

			<div class="section">
				<div class="section-title">What Happened?</div>
				<div class="section-body">${escapeHtml(description)}</div>
			</div>

			<div class="section">
				<div class="section-title">What Did You Expect To Happen?</div>
				<div class="section-body">${escapeHtml(expectedBehavior)}</div>
			</div>

			${
				reproductionSteps
					? `
			<div class="section">
				<div class="section-title">Steps to Reproduce</div>
				<div class="section-body">${escapeHtml(reproductionSteps)}</div>
			</div>`
					: ''
			}

			${
				additionalMessage
					? `
			<div class="section">
				<div class="section-title">Additional Notes</div>
				<div class="section-body">${escapeHtml(additionalMessage)}</div>
			</div>`
					: ''
			}

			${
				deviceInfo?.userAgent
					? `
			<div class="section">
				<div class="section-title">Device & Environment</div>
				<div style="font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px; font-family: monospace;">
					Resolution: ${deviceInfo.screenWidth || '?'}x${deviceInfo.screenHeight || '?'}<br />
					User Agent: ${escapeHtml(deviceInfo.userAgent)}
				</div>
			</div>`
					: ''
			}
		</div>
		<div class="footer">
			This notification was sent by PortForge AI to ${escapeHtml(recipient)} from the public.bug_reports record.
		</div>
	</div>
</body>
</html>
`;

		const textContent = `
[PortForge AI] New Bug Report
Category: ${category}
Reference: #${reportId}
Title: ${title}
Reporter: ${userEmail || 'Anonymous'} ${userId ? `(${userId})` : ''}
Submitted: ${createdAt}
URL: ${deviceInfo?.pathname || '/report-bug'}

--- WHAT HAPPENED ---
${description}

--- EXPECTED BEHAVIOR ---
${expectedBehavior}

${reproductionSteps ? `--- REPRODUCTION STEPS ---\n${reproductionSteps}\n` : ''}
${additionalMessage ? `--- ADDITIONAL NOTES ---\n${additionalMessage}\n` : ''}
${deviceInfo?.userAgent ? `Device: ${deviceInfo.userAgent} (${deviceInfo.screenWidth}x${deviceInfo.screenHeight})\n` : ''}
Attached Screenshots: ${screenshotCount} (stored in Supabase bug_reports row)
`;

		// 1. Try Resend if configured
		if (resendApiKey) {
			try {
				const fromEmail =
					getEnv('RESEND_FROM_EMAIL')?.trim() || 'PortForge AI <onboarding@resend.dev>';

				// Prepare attachments for Resend if present and valid
				const emailAttachments = screenshots
					.filter((s) => s.dataUrl && s.dataUrl.includes(','))
					.map((s) => {
						const base64Content = s.dataUrl!.split(',')[1];
						return {
							filename: s.name,
							content: base64Content,
						};
					});

				const resendRes = await fetch('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${resendApiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						from: fromEmail,
						to: recipient,
						subject,
						html: htmlContent,
						text: textContent,
						attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
					}),
				});

				if (resendRes.ok) {
					const data = await resendRes.json();
					return new Response(
						JSON.stringify({
							success: true,
							notified: true,
							provider: 'resend',
							emailId: data.id,
						}),
						{ status: 200, headers: { 'Content-Type': 'application/json' } }
					);
				}

				const errData = await resendRes.text();
				console.error('[notify-bug-report] Resend API responded with error:', errData);
			} catch (resendError) {
				console.error('[notify-bug-report] Failed sending email via Resend:', resendError);
			}
		}

		// 2. Try SendGrid if configured
		if (sendgridApiKey) {
			try {
				const fromEmail =
					getEnv('SENDGRID_FROM_EMAIL')?.trim() || 'noreply@portforge.ai';
				const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sendgridApiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						personalizations: [{ to: [{ email: recipient }] }],
						from: { email: fromEmail, name: 'PortForge AI' },
						subject,
						content: [
							{ type: 'text/plain', value: textContent },
							{ type: 'text/html', value: htmlContent },
						],
					}),
				});

				if (sgRes.ok) {
					return new Response(
						JSON.stringify({
							success: true,
							notified: true,
							provider: 'sendgrid',
						}),
						{ status: 200, headers: { 'Content-Type': 'application/json' } }
					);
				}
				const errData = await sgRes.text();
				console.error('[notify-bug-report] SendGrid API error:', errData);
			} catch (sgError) {
				console.error('[notify-bug-report] Failed sending email via SendGrid:', sgError);
			}
		}

		// 3. Try webhook if configured
		if (webhookUrl) {
			try {
				await fetch(webhookUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: subject,
						reportId,
						title,
						category,
						description,
						expectedBehavior,
						userEmail,
						createdAt,
					}),
				});
				return new Response(
					JSON.stringify({
						success: true,
						notified: true,
						provider: 'webhook',
					}),
					{ status: 200, headers: { 'Content-Type': 'application/json' } }
				);
			} catch (whError) {
				console.error('[notify-bug-report] Failed posting to webhook:', whError);
			}
		}

		// 4. No email provider configured yet
		console.info(
			`[notify-bug-report] Bug report #${reportId} committed to database. Email notification to ${recipient} is pending server configuration. To activate, set RESEND_API_KEY in Vercel environment variables.`
		);

		return new Response(
			JSON.stringify({
				success: true,
				notified: false,
				reason: 'EMAIL_PROVIDER_NOT_CONFIGURED',
				targetEmail: recipient,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (globalError: unknown) {
		const msg = globalError instanceof Error ? globalError.message : 'Internal error';
		console.error('[notify-bug-report] Unhandled server error in notify API:', globalError);
		return new Response(
			JSON.stringify({
				success: false,
				error: msg,
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
