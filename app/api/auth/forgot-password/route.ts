import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateResetToken } from "@/lib/token";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();

  const userRes = await db.query('SELECT id FROM "User" WHERE email = $1', [
    email,
  ]);

  const user = userRes.rows[0];

  if (user) {
    const { raw, hash } = generateResetToken();

    await db.query(
      `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      `,
      [user.id, hash]
    );
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${raw}`;
    await sendResetPasswordEmail(email, resetLink);
  }

  // Always return success
  return NextResponse.json({
    message: "If an account exists, a reset link has been sent.",
  });
}
