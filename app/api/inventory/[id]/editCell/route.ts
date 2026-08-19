import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  //   const client = await db.connect();
  try {
    const { id } = await context.params;
    const body = await req.json();
    // await client.query("BEGIN");
    //     await client.query(
    //       `
    //    UPDATE "Product"
    //       SET  brand = $2, price = $3, cost = $4, is_active = $5, updated_at = NOW(), size = $6,category = $7
    //       WHERE id = $1

    //       `,
    //       [
    //         id,
    //         body.brand,
    //         body.price,
    //         body.cost,
    //         body.is_active,
    //         body.size,
    //         body.category,
    //       ],
    //     );
    await db.query(
      `
      UPDATE "Inventory"
      SET quantity = $1, updated_at = NOW()
      WHERE product_id = $2
      `,
      [body.quantity, id],
    );
    // await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    // await client.query("ROLLBACK");
    console.error("Edit inventory cell error:", err);
    return NextResponse.json(
      { error: "Failed to edit inventory cell" },
      { status: 500 },
    );
  }
}
