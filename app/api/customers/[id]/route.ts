import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { rows } = await db.query(
      `
       SELECT *
        FROM "Customer"
        WHERE id = $1
          AND deleted_at IS NULL
    `,
      [id],
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { name, phone, email } = await req.json();
    console.log("PATCH request body:", { name, phone, email });
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await db.query(
      `
      UPDATE "Customer"
      SET name = $1, phone = $2, email = $3, updated_at = NOW()
      WHERE id = $4
      `,
      [name, phone, email, id],
    );

    return NextResponse.json({ message: "Customer updated" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    await db.query(
      `
      UPDATE "Customer"
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [id],
    );

    return NextResponse.json(
      { message: "Customer deleted (soft)" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
