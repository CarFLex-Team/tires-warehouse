import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const targetDate = date ?? new Date().toISOString().slice(0, 10);
  try {
    const { rows } = await db.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE i.deleted_at IS NULL) AS total_transactions,

        COUNT(*) FILTER (
          WHERE i.status = 'finished' AND i.deleted_at IS NULL
        ) AS total_sales_count,

        COALESCE(SUM(i.total_amount) FILTER (
          WHERE i.status = 'finished' AND i.deleted_at IS NULL
        ), 0) AS total_sales_amount,

        COUNT(*) FILTER (
          WHERE i.status = 'finished'
            AND (i.payment_method = 'Cash' OR i.payment_method = 'Mix')
            AND i.deleted_at IS NULL
        ) AS cash_sales_count,

        COALESCE(SUM(i.cash_amount) FILTER (
          WHERE i.status = 'finished'
          AND  (i.payment_method = 'Cash' OR i.payment_method = 'Mix')
            AND i.deleted_at IS NULL
        ), 0) AS cash_sales_amount,

        COUNT(*) FILTER (
          WHERE i.status = 'finished'
            AND (i.payment_method = 'Debit' OR i.payment_method = 'Mix')
            AND i.deleted_at IS NULL
        ) AS debit_sales_count,

        COALESCE(SUM(i.debit_amount) FILTER (
          WHERE i.status = 'finished'
            AND (i.payment_method = 'Debit' OR i.payment_method = 'Mix')
            AND i.deleted_at IS NULL
        ), 0) AS debit_sales_amount

      FROM "Invoice" i
    WHERE
      i.created_at >= $1::date
      AND i.created_at < $1::date + INTERVAL '1 day' AND i.status = 'finished'
    `,
      [targetDate],
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Daily summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summary" },
      { status: 500 },
    );
  }
}
