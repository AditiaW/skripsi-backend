import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendResetEmailParams {
  email: string;
  token: string;
}

export const sendPasswordResetEmail = async ({ email, token }: SendResetEmailParams) => {
  const resetUrl = `${process.env.ORIGIN}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: 'GM Candra Mebel <onboarding@resend.dev>',
    to: email,
    subject: '🔒 Reset Your Password - GM Candra Mebel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password for GM Candra Mebel. Click the button below to set a new password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you didn’t request this, you can safely ignore this email. This link will expire in <strong>1 hour</strong>.</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">If the button above doesn’t work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px;">${resetUrl}</p>
        <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} GM Candra Mebel. All rights reserved.</p>
      </div>
    `
  });
};
