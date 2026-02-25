import { db } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  if (!month) {
    return new Response("Month is required", { status: 400 });
  }
  try {
    const { rows } = await db.query(
      `
    SELECT
  p.name AS Product,
  SUM(t.amount) AS turn_over
FROM "Transaction" t
JOIN "Product" p ON p.id = t.product_id
WHERE t.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND   t.created_at >= date_trunc('month', $1::date)
      AND t.created_at < date_trunc('month', $1::date) + INTERVAL '1 month'
GROUP BY p.id, p.name
ORDER BY turn_over DESC
LIMIT 2;

    `,
      [`${month}-01`],
    );

    return Response.json(rows);
  } catch (error: any) {
    return Response.json(
      {
        error: "Failed to fetch inventory monthly summary",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
