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
      UPDATE "Transaction"
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [id],
    );

    return NextResponse.json(
      { message: "Transaction deleted (soft)" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { amount, description, payment_method, created_at } =
      await req.json();
    await db.query(
      `
      UPDATE "Transaction"
      SET updated_at = NOW(),
          amount = $1,
       
          description = $2,
          payment_method = $3,
          
        
          created_at = $4
      WHERE id = $5
      `,
      [amount, description, payment_method, created_at || new Date(), id],
    );

    return NextResponse.json(
      { message: "Transaction updated" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}
