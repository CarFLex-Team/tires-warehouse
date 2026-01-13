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
      UPDATE "Category"
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [Number(id)]
    );

    return NextResponse.json(
      { message: "Category deleted (soft)" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
