import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT *
      FROM "Service"
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to fetch services: ${error.message}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, price } = await req.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 },
      );
    }

    const { rows } = await db.query(
      `
      INSERT INTO "Service" ( name,price)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, price],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
