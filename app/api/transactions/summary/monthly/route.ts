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
     COUNT(*) FILTER (WHERE t.deleted_at IS NULL) AS total_transactions,

        COUNT(*) FILTER (
          WHERE t.type = 'Sales' AND t.deleted_at IS NULL
        ) AS total_sales_count,

        COALESCE(SUM(t.amount) FILTER (
          WHERE t.type = 'Sales' AND t.deleted_at IS NULL
        ), 0) AS total_sales_amount,

        COUNT(*) FILTER (
          WHERE t.type = 'Sales'
            AND t.payment_method = 'Cash'
            AND t.deleted_at IS NULL
        ) AS cash_sales_count,

        COALESCE(SUM(t.amount) FILTER (
          WHERE t.type = 'Sales'
            AND t.payment_method = 'Cash'
            AND t.deleted_at IS NULL
        ), 0) AS cash_sales_amount,

        COUNT(*) FILTER (
          WHERE t.type = 'Sales'
            AND t.payment_method = 'Debit'
            AND t.deleted_at IS NULL
        ) AS debit_sales_count,

        COALESCE(SUM(t.amount) FILTER (
          WHERE t.type = 'Sales'
            AND t.payment_method = 'Debit'
            AND t.deleted_at IS NULL
        ), 0) AS debit_sales_amount
    FROM "Transaction" t
    WHERE
      t.created_at >= date_trunc('month', $1::date)
      AND t.created_at < date_trunc('month', $1::date) + INTERVAL '1 month'
    `,
    [`${month}-01`]
  );

  return Response.json(rows[0]);
}
