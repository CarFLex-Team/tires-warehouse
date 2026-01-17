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
 SELECT
  c.*,
  COALESCE(
    json_agg(i ORDER BY i.created_at DESC)
      FILTER (WHERE i.id IS NOT NULL),
    '[]'
  ) AS invoices
FROM "Customer" c
LEFT JOIN "Invoice" i
  ON i.customer_id = c.id
  AND i.deleted_at IS NULL
WHERE c.id = $1
  AND c.deleted_at IS NULL
GROUP BY c.id;

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
