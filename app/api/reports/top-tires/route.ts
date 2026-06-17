import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // your db client

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || new Date().getFullYear();
    const { rows } = await db.query(`
WITH tire_sales AS (
  SELECT
      EXTRACT(MONTH FROM t.created_at)::int AS month,
      t.product_id,
      SUM(t.quantity) AS units
  FROM "Transaction" t
  WHERE
      t.deleted_at IS NULL
      AND t.status = 'finished'
      AND t.type = 'Sales'
      AND t.category = 'Tire'
      AND EXTRACT(YEAR FROM t.created_at) = ${year}
  GROUP BY 1, t.product_id
),
ranked AS (
  SELECT
      ts.*,
      ROW_NUMBER() OVER (
          PARTITION BY ts.month
          ORDER BY ts.units DESC
      ) AS rn
  FROM tire_sales ts
)
SELECT
    r.month,
    p.name,
    p.condition ,
    r.units
FROM ranked r
JOIN "Product" p
    ON p.id = r.product_id
WHERE r.rn <= 5
ORDER BY r.month, r.units DESC;
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch top tires data" },
      { status: 500 },
    );
  }
}
