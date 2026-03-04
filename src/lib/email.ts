function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

interface SendInvitationEmailParams {
  to: string;
  disciplerName: string;
  proposedPhaseLabel: string;
  customMessage?: string | null;
  appUrl: string;
}

export async function sendInvitationEmail(params: SendInvitationEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.INVITE_FROM_EMAIL || 'Harmony Baptist Church <onboarding@resend.dev>';
  const inviteUrl = `${params.appUrl}/auth/signup?email=${encodeURIComponent(params.to)}`;
  const safeDiscipler = escapeHtml(params.disciplerName || 'A discipler');
  const safePhase = escapeHtml(params.proposedPhaseLabel);
  const safeMessage = params.customMessage ? escapeHtml(params.customMessage) : '';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">You are invited to discipleship at Harmony Baptist Church</h2>
      <p><strong>${safeDiscipler}</strong> invited you to connect through the Deep Discipleship Hub.</p>
      <p><strong>Suggested starting focus:</strong> ${safePhase}</p>
      ${safeMessage ? `<p><strong>Message:</strong> ${safeMessage}</p>` : ''}
      <p>
        Create your account or sign in here:<br />
        <a href="${inviteUrl}">${inviteUrl}</a>
      </p>
      <p style="color:#4b5563; font-size:12px;">If you were not expecting this invite, you can ignore this email.</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: 'You are invited to Deep Discipleship',
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { sent: false, reason: errorText || `Email API failed (${response.status})` };
  }

  return { sent: true as const };
}
