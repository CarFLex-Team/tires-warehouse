import splitSets from "./splitSets";
export default async function handleTireSet(
  client: any,
  product: { quantity: number; id: string; price: number; cost: number; size: string },
) {
  // 1. Get tire info

  console.log("Tire rows for size", product.size, product);
  if (!product) return;
  const tire = product;

  // 2. Split sets of 4 logic
  const remainingQuantity = tire.quantity;
  const { quantityToUsed, newSetQuantity } = splitSets(remainingQuantity);

  if (quantityToUsed > 0) {
    // Move leftovers to used inventory
    const { rows: usedRows } = await client.query(
      `SELECT i.id FROM "Inventory" i
       JOIN "Product" p ON i.product_id = p.id
       WHERE p.condition='USED' AND p.size=$1
       LIMIT 1 FOR UPDATE`,
      [product.size],
    );

    if (usedRows.length > 0) {
      await client.query(
        `UPDATE "Inventory" SET quantity = quantity + $1 WHERE id=$2`,
        [quantityToUsed, usedRows[0].id],
      );
    } else {
      const productResult = await client.query(
        `
            INSERT INTO "Product" (size, brand, price, cost, is_active, created_at, updated_at,name,condition)
            VALUES ($1, 'Used', $2, $3, true, NOW(), NOW(),$4,$5)
            RETURNING id`,
        [product.size, tire.price, tire.cost, `USED Used ${product.size}`, "USED"],
      );

      const productId = productResult.rows[0].id; // Get the productId from the returned result

      // Insert into Inventory table using the productId
      await client.query(
        `
            INSERT INTO "Inventory" (product_id, quantity, updated_at)
            VALUES ($1, $2, NOW())
            RETURNING *`,
        [productId, quantityToUsed],
      );
    }
  }

  // 3. Update set quantity
  await client.query(
    `UPDATE "Inventory" SET quantity = $1 WHERE product_id = $2`,
    [newSetQuantity, tire.id],
  );
  await client.query(
    `
         INSERT INTO "Inventory_movement" (product_id, quantity, created_at,reason)
        VALUES ($1, $2, NOW(), 'adjustment')

          `,
    [tire.id, quantityToUsed],
  );
}
