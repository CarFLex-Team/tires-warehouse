import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // your db client

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || new Date().getFullYear();
    const { rows } = await db.query(`
           WITH months AS (
  SELECT generate_series(1, 12) AS month
)
      SELECT
        m.month,
        COALESCE(SUM(i.total_amount), 0) AS total_amount,
        COALESCE(SUM(i.tax), 0) AS total_tax
      FROM months m
      LEFT JOIN "Invoice" i ON EXTRACT(MONTH FROM i.created_at)::int = m.month
        AND EXTRACT(YEAR FROM i.created_at) = ${year}
        AND i.deleted_at IS NULL AND i.status = 'finished'
      GROUP BY m.month
      ORDER BY m.month;
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch revenue data" },
      { status: 500 },
    );
  }
}
