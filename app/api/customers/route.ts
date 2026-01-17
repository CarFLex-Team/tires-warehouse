import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const { rows } = await db.query(
      `
      SELECT
        *
      FROM "Customer"
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `,
    );

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const { rows } = await db.query(
      `
      INSERT INTO "Customer" ( name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name, email, phone],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
