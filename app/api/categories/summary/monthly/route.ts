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
  c.name AS category,
  SUM(t.amount) AS turn_over
FROM "Transaction" t
JOIN "Category" c ON c.id = t.category_id
WHERE t.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND   t.created_at >= date_trunc('month', $1::date)
      AND t.created_at < date_trunc('month', $1::date) + INTERVAL '1 month'
GROUP BY c.id, c.name
ORDER BY turn_over DESC
LIMIT 2;

    `,
    [`${month}-01`],
  );

  return Response.json(rows);
}
