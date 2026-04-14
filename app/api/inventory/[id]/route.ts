import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    await db.query(
      `
      UPDATE "Product"
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [id],
    );

    return NextResponse.json(
      { message: "Product deleted (soft)" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const client = await db.connect();
  try {
    const { id } = await context.params;
    const body = await req.json();
    await client.query("BEGIN");
    await client.query(
      `
   UPDATE "Product"
      SET  price = $2, cost = $3, is_active = $4, updated_at = NOW(), size = $5
      WHERE id = $1

      `,
      [id, body.price, body.cost, body.is_active, body.size],
    );
    await client.query(
      `
      UPDATE "Inventory"
      SET quantity = $1, updated_at = NOW()
      WHERE product_id = $2
      `,
      [body.quantity, id],
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Edit Take Status error:", err);
    return NextResponse.json({ error: "Failed to Take car" }, { status: 500 });
  } finally {
    client.release();
  }
}
