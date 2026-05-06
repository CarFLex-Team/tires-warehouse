import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT i.id AS inventory_id, p.id AS id,name,size,brand,sku, price, cost,quantity,is_active,  p.created_at,  p.updated_at,condition
      FROM "Inventory" as i , "Product" as p
      WHERE i.product_id = p.id
        AND p.deleted_at IS NULL
      ORDER BY size ASC
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { size, brand, price, cost, quantity, condition } = await req.json();
    // console.log("Received data:", {
    //   size,
    //   brand,
    //   price,
    //   cost,
    //   quantity,
    //   condition,
    // });
    // Validate input
    if (
      !size ||
      !brand ||
      !price ||
      !cost ||
      quantity === undefined ||
      !condition
    ) {
      return NextResponse.json(
        {
          error:
            " size, brand, price, cost, quantity and condition are required",
        },
        { status: 400 },
      );
    }

    // Insert into Product table and get the generated productId
    const productResult = await db.query(
      `
      INSERT INTO "Product" (size, brand, price, cost, is_active, created_at, updated_at,name,condition)
      VALUES ($1, $2, $3, $4, true, NOW(), NOW(),$5,$6)
      RETURNING id`,
      [size, brand, price, cost, `${condition} ${brand} ${size}`, condition],
    );

    const productId = productResult.rows[0].id; // Get the productId from the returned result

    // Insert into Inventory table using the productId
    const inventoryResult = await db.query(
      `
      INSERT INTO "Inventory" (product_id, quantity, updated_at)
      VALUES ($1, $2, NOW())
      RETURNING *`,
      [productId, quantity],
    );

    // Return the newly inserted inventory record
    return NextResponse.json(inventoryResult.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
