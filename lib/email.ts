import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  await resend.emails.send({
    from: "Tire Warehouse <onboarding@resend.dev>", // or
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;padding:10px 16px;background:#1f2937;color:white;border-radius:6px;text-decoration:none">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
