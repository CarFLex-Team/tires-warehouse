import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
     SELECT
      i.id AS inventory_id,
      p.id AS id,
      p.name,
      p.size,
      p.brand,
      p.sku,
      p.price,
      p.cost,
      i.quantity,
      p.is_active,
      p.created_at,
      p.updated_at,
      p.condition,
      p.category,
      pi.image_path
    FROM "Inventory" AS i
    INNER JOIN "Product" AS p
      ON i.product_id = p.id
    LEFT JOIN "ProductImage" AS pi
      ON pi.product_id = p.id
      WHERE p.deleted_at IS NULL
    ORDER BY p.size ASC
    `);
    const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}`;
    const result = rows.map((row: any) => ({
      ...row,
      image_url: row.image_path ? `${baseUrl}/${row.image_path}` : null,
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { size, brand, price, cost, quantity, condition, category } =
      await req.json();
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
      !condition ||
      !category
    ) {
      return NextResponse.json(
        {
          error:
            " size, brand, price, cost, quantity, condition and category are required",
        },
        { status: 400 },
      );
    }

    // Insert into Product table and get the generated productId
    const productResult = await db.query(
      `
      INSERT INTO "Product" (size, brand, price, cost, is_active, created_at, updated_at,name,condition,category)
      VALUES ($1, $2, $3, $4, true, NOW(), NOW(),$5,$6,$7)
      RETURNING id`,
      [
        size,
        brand,
        price,
        cost,
        `${condition} ${category} ${brand} ${size}`,
        condition,
        category,
      ],
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
