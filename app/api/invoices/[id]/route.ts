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
  i.id,
  i.invoice_no,
  i.customer_id,
  i.total_amount,
  i.created_at,
  COALESCE(
    json_agg(
      jsonb_build_object(
        'id', t.id,
        'amount', t.amount,
        'description', t.description,
        'category_name', c.name
      )
    )
    FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) AS transactions

FROM "Invoice" i
LEFT JOIN "Transaction" t
  ON t.invoice_id = i.id
  AND t.deleted_at IS NULL
LEFT JOIN "Category" c
  ON c.id = t.category_id
WHERE i.id = $1
  AND i.deleted_at IS NULL
GROUP BY i.id;
    `,
      [id],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
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
      UPDATE "Invoice"
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [id],
    );

    return NextResponse.json(
      { message: "Invoice deleted (soft)" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
