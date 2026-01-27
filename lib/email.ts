// import { Resend } from "resend";

// function getResendClient() {
//   if (!process.env.RESEND_API_KEY) {
//     throw new Error("RESEND_API_KEY is missing");
//   }

//   return new Resend(process.env.RESEND_API_KEY);
// }

// export async function sendResetPasswordEmail(to: string, resetLink: string) {
//   const resend = getResendClient();
//   await resend.emails.send({
//     from: "Tire Warehouse <onboarding@resend.dev>", // or
//     to,
//     subject: "Reset your password",
//     html: `
//       <div style="font-family: Arial, sans-serif">
//         <h2>Password Reset</h2>
//         <p>You requested to reset your password.</p>
//         <p>
//           <a href="${resetLink}"
//              style="display:inline-block;padding:10px 16px;background:#1f2937;color:white;border-radius:6px;text-decoration:none">
//             Reset Password
//           </a>
//         </p>
//         <p>This link will expire in 10 minutes.</p>
//         <p>If you did not request this, you can ignore this email.</p>
//       </div>
//     `,
//   });
// }

import nodemailer from "nodemailer";

function getBrevoTransporter() {
  if (!process.env.BREVO_SMTP_USER) {
    throw new Error("BREVO_SMTP_USER is missing");
  }

  if (!process.env.BREVO_SMTP_PASS) {
    throw new Error("BREVO_SMTP_PASS is missing");
  }

  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });
}

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  const transporter = getBrevoTransporter();

  const fromEmail =
    process.env.FROM_EMAIL || "Tires Warehouse <mazencarflex@outlook.com>";

  await transporter.sendMail({
    from: fromEmail,
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
