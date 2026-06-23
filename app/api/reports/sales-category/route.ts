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

  -- Expenses
  COALESCE(
    SUM(
      CASE
        WHEN t.type = 'Expense'
        THEN t.amount
        ELSE 0
      END
    ),
    0
  ) AS expenses,

  -- New Tires
  COALESCE(
    SUM(
      CASE
        WHEN p.condition = 'NEW'
        THEN t.quantity
        ELSE 0
      END
    ),
    0
  ) AS "newTiresQuantity",

  COALESCE(
    SUM(
      CASE
        WHEN p.condition = 'NEW'
        THEN t.amount
        ELSE 0
      END
    ),
    0
  ) AS "newTiresAmount",

  -- Used Tires
  COALESCE(
    SUM(
      CASE
        WHEN p.condition = 'USED'
        THEN t.quantity
        ELSE 0
      END
    ),
    0
  ) AS "usedTiresQuantity",

  COALESCE(
    SUM(
      CASE
        WHEN p.condition = 'USED' OR p.condition='SET'
        THEN t.amount
        ELSE 0
      END
    ),
    0
  ) AS "usedTiresAmount",

  -- Services
  COALESCE(
    SUM(
      CASE
        WHEN t.service_id IS NOT NULL
        THEN t.quantity
        ELSE 0
      END
    ),
    0
  ) AS "servicesQuantity",

  COALESCE(
    SUM(
      CASE
        WHEN t.service_id IS NOT NULL
        THEN t.amount
        ELSE 0
      END
    ),
    0
  ) AS "servicesAmount"

FROM months m
LEFT JOIN "Transaction" t
  ON EXTRACT(MONTH FROM t.created_at)::int = m.month
  AND EXTRACT(YEAR FROM t.created_at) = ${year}
  AND t.deleted_at IS NULL AND t.status = 'finished'

LEFT JOIN "Product" p
  ON p.id = t.product_id

GROUP BY m.month
ORDER BY m.month;
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch sales by category data" },
      { status: 500 },
    );
  }
}
