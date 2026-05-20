import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  let whereClause = `i.deleted_at IS NULL`;
  const params: any[] = [];

  if (status) {
    params.push(status);
    whereClause += ` AND i.status = $${params.length}`;
  }

  if (date) {
    params.push(date);
    whereClause += `
      AND i.created_at >= $${params.length}::date
      AND i.created_at < $${params.length}::date + INTERVAL '1 day'
    `;
  }

  if (month) {
    params.push(`${month}-01`);
    whereClause += `
      AND i.created_at >= date_trunc('month', $${params.length}::date)
      AND i.created_at < date_trunc('month', $${params.length}::date) + INTERVAL '1 month'
    `;
  }

  if (search) {
    params.push(`%${search}%`);
    whereClause += `
      AND EXISTS (
        SELECT 1
        FROM "Transaction" t
        JOIN "Product" p ON p.id = t.product_id
        WHERE t.invoice_id = i.id
          AND p.size ILIKE $${params.length}
      )
    `;
  }

  try {
    const { rows } = await db.query(
      `
      SELECT
        i.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        u.name AS created_by_name
      FROM "Invoice" i
      LEFT JOIN "Customer" c ON c.id = i.customer_id
      LEFT JOIN "User" u ON u.id = i.created_by
      WHERE ${whereClause}
      ORDER BY i.created_at DESC
      `,
      params,
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error.message },
      { status: 500 },
    );
  }
}
