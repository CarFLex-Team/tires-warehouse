import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/hash-pass";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const resetRes = await db.query(
    `
    SELECT * FROM password_resets
    WHERE token = $1
      AND used = false
      AND expires_at > NOW()
    `,
    [hashedToken]
  );

  const reset = resetRes.rows[0];
  if (!reset) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const newPassword = await hashPassword(password);

  await db.query(
    'UPDATE "User" SET password = $1, updated_at = NOW() WHERE id = $2',
    [newPassword, reset.user_id]
  );

  await db.query("UPDATE password_resets SET used = true WHERE id = $1", [
    reset.id,
  ]);

  return NextResponse.json({
    message: "Password reset successful",
  });
}
