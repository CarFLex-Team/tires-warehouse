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
  COALESCE(
    json_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL),
    '[]'
  ) AS sizes
FROM "Invoice" i
JOIN "Transaction" t
  ON t.invoice_id = i.id
  AND t.deleted_at IS NULL
JOIN "Product" p
  ON p.id = t.product_id
WHERE i.id = $1
  AND i.deleted_at IS NULL
GROUP BY i.id;
    `,
      [id],
    );
    if (rows.length === 0) {
      return NextResponse.json([]);
    }
    return NextResponse.json(rows[0].sizes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}
