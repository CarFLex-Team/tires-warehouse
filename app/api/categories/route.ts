import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT *
      FROM "Category"
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const { rows } = await db.query(
      `
      INSERT INTO "Category" ( name, type)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, type]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
