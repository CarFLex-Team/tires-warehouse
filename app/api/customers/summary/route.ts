import { db } from "@/lib/db";
export async function GET() {
  const { rows } = await db.query(
    `
 SELECT
  c.name AS customer,
  SUM(i.total_amount) AS turn_over
FROM "Invoice" i
JOIN "Customer" c ON c.id = i.customer_id
WHERE i.deleted_at IS NULL
  AND c.deleted_at IS NULL

GROUP BY c.id, c.name
ORDER BY turn_over DESC
LIMIT 3;
    `,
  );

  return Response.json(rows);
}
