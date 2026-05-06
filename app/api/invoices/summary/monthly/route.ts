import { db } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  if (!month) {
    return new Response("Month is required", { status: 400 });
  }

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
           AND (i.cash_amount IS NOT NULL AND i.cash_amount > 0 )
            AND i.deleted_at IS NULL
        ) AS cash_sales_count,

        COALESCE(SUM(i.cash_amount) FILTER (
          WHERE i.status = 'finished'
          AND (i.cash_amount IS NOT NULL AND i.cash_amount > 0 )
            AND i.deleted_at IS NULL
        ), 0) AS cash_sales_amount,

        COUNT(*) FILTER (
          WHERE i.status = 'finished'
            AND (i.debit_amount IS NOT NULL AND i.debit_amount > 0 )
            AND i.deleted_at IS NULL
        ) AS debit_sales_count,

        COALESCE(SUM(i.debit_amount) FILTER (
          WHERE i.status = 'finished'
            AND (i.debit_amount IS NOT NULL AND i.debit_amount > 0 )
            AND i.deleted_at IS NULL
        ), 0) AS debit_sales_amount,
        COUNT(*) FILTER (
          WHERE i.status = 'finished'
            AND (i.check_amount IS NOT NULL AND i.check_amount > 0 )
            AND i.deleted_at IS NULL
        ) AS check_sales_count,

        COALESCE(SUM(i.check_amount) FILTER (
          WHERE i.status = 'finished'
            AND (i.check_amount IS NOT NULL AND i.check_amount > 0 )
            AND i.deleted_at IS NULL
        ), 0) AS check_sales_amount

      FROM "Invoice" i
    WHERE
      i.created_at >= date_trunc('month', $1::date)
      AND i.created_at < date_trunc('month', $1::date) + INTERVAL '1 month' AND i.status = 'finished'
    `,
    [`${month}-01`],
  );

  return Response.json(rows[0]);
}
