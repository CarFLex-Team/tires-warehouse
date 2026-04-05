import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT i.id AS inventory_id, p.id AS id,name,size,brand,sku, price, cost,quantity,is_active,  p.created_at,  p.updated_at,condition
      FROM "Inventory" as i , "Product" as p
      WHERE i.product_id = p.id
        AND p.deleted_at IS NULL AND i.quantity <= 4
      ORDER BY i.quantity ASC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch inventory Summary", details: error.message },
      { status: 500 },
    );
  }
}
