import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userId: string
) {
  const url = `${APP_URL}/reset-password/confirm?token=${encodeURIComponent(
    token
  )}&uid=${encodeURIComponent(userId)}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${url}">Click here to set a new password</a></p>
      <p>This link will expire in 60 minutes.</p>
    `,
  });
}

export async function sendAffiliateInviteEmail(
  email: string,
  inviteCode: string
) {
  console.log(FROM);
  const url = `${APP_URL}/signup?invite=${encodeURIComponent(inviteCode)}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'You’ve been invited to join as an affiliate',
    html: `
      <p>You have been invited to join our affiliate program.</p>
      <p><a href="${url}">Click here to create your affiliate account</a></p>
    `,
  });
}
