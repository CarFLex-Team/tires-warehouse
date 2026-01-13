import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await db.query(
      `
      UPDATE "Transaction"
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    return NextResponse.json(
      { message: "Transaction deleted (soft)" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
