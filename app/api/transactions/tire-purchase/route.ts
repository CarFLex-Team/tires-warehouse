import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { product, payment_method, created_by, created_at } = await req.json();
  const { size, brand, price, cost, quantity, condition, category } =
    product || {};

  if (
    !size ||
    !brand ||
    !price ||
    !cost ||
    quantity === undefined ||
    !condition ||
    !payment_method ||
    !created_by ||
    !created_at ||
    !category
  ) {
    return NextResponse.json(
      {
        error:
          "size, brand, price, cost, quantity, condition, payment_method, created_by, created_at and category are required",
      },
      { status: 400 },
    );
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const productLock = await client.query(
      `
      SELECT id
      FROM "Product"
      WHERE brand = $1
        AND size = $2
        AND condition = $3
        AND category = $4
      FOR UPDATE`,
      [brand, size, condition, category],
    );

    let productRow;
    let inventoryRow;

    if (productLock.rows.length > 0) {
      // --- Existing product: update price/cost, bump inventory ---
      const productId = productLock.rows[0].id;

      const productUpdate = await client.query(
        `
        UPDATE "Product"
        SET price = $1,
            cost = $2,
            is_active = true,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
        [price, cost, productId],
      );
      productRow = productUpdate.rows[0];
      const inventoryLock = await client.query(
        `
        SELECT id, quantity
        FROM "Inventory"
        WHERE product_id = $1
        FOR UPDATE`,
        [productId],
      );
      if (inventoryLock.rows.length > 0) {
        const inventoryUpdate = await client.query(
          `
          UPDATE "Inventory"
          SET quantity = quantity + $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *`,
          [quantity, inventoryLock.rows[0].id],
        );
        inventoryRow = inventoryUpdate.rows[0];
      } else {
        // Product existed but somehow had no inventory row yet
        const inventoryInsert = await client.query(
          `
          INSERT INTO "Inventory" (product_id, quantity, updated_at)
          VALUES ($1, $2, NOW())
          RETURNING *`,
          [productId, quantity],
        );
        inventoryRow = inventoryInsert.rows[0];
      }
    } else {
      // --- New product: insert as before ---
      const productInsert = await client.query(
        `
        INSERT INTO "Product" (size, brand, price, cost, is_active, created_at, updated_at, name, condition, category)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW(), $5, $6, $7)
        RETURNING *`,
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
      productRow = productInsert.rows[0];

      const inventoryInsert = await client.query(
        `
        INSERT INTO "Inventory" (product_id, quantity, updated_at)
        VALUES ($1, $2, NOW())
        RETURNING *`,
        [productRow.id, quantity],
      );
      inventoryRow = inventoryInsert.rows[0];
    }

    const description = `${condition} ${category} ${brand} ${size} (x${quantity})`;
    const amount = cost * quantity;

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
        product: productRow,
        inventory: inventoryRow,
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
