import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // your db client

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || new Date().getFullYear();

    const { rows } = await db.query(
      `
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
      AND EXTRACT(YEAR FROM t.created_at) = $1
  GROUP BY 1, t.product_id
),
tire_sales_with_condition AS (
  SELECT
      ts.month,
      ts.product_id,
      ts.units,
      p.name,
      p.condition
  FROM tire_sales ts
  JOIN "Product" p ON p.id = ts.product_id
),
ranked AS (
  SELECT
      tsc.*,
      ROW_NUMBER() OVER (
          PARTITION BY tsc.month, tsc.condition
          ORDER BY tsc.units DESC
      ) AS rn
  FROM tire_sales_with_condition tsc
)
SELECT
    r.month,
    r.condition,
    r.name,
    r.units
FROM ranked r
WHERE r.rn <= 5
ORDER BY r.month, r.condition, r.units DESC;
      `,
      [year],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch top tires data" },
      { status: 500 },
    );
  }
}
