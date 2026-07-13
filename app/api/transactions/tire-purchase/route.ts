import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  const { product, payment_method, created_by, created_at } = await req.json();
  const { size, brand, price, cost, quantity, condition } = product || {};
  const client = await db.connect();
  if (
    !size ||
    !brand ||
    !price ||
    !cost ||
    quantity === undefined ||
    !condition ||
    !payment_method ||
    !created_by ||
    !created_at
  ) {
    return NextResponse.json(
      {
        error:
          "size, brand, price, cost, quantity, condition, payment_method, created_by and created_at are required",
      },
      { status: 400 },
    );
  }

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `
      INSERT INTO "Product" (size, brand, price, cost, is_active, created_at, updated_at, name, condition)
      VALUES ($1, $2, $3, $4, true, NOW(), NOW(), $5, $6)
      RETURNING id`,
      [size, brand, price, cost, `${condition} ${brand} ${size}`, condition],
    );
    const productId = productResult.rows[0].id;

    const inventoryResult = await client.query(
      `
      INSERT INTO "Inventory" (product_id, quantity, updated_at)
      VALUES ($1, $2, NOW())
      RETURNING *`,
      [productId, quantity],
    );

    const description = `${condition} ${brand} ${size} (x${quantity})`;
    const amount = cost * quantity; // same assumption as before — adjust if amount should be just `cost`

    const transactionResult = await client.query(
      `
      INSERT INTO "Transaction" (description, type, category, amount, payment_method, created_by, created_at)
      VALUES ($1, 'Expense', 'Tire', $2, $3, $4, $5)
      RETURNING *`,
      [description, amount, payment_method, created_by, created_at],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        product: productResult.rows[0],
        inventory: inventoryResult.rows[0],
        transaction: transactionResult.rows[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
