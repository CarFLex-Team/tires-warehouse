import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT
        t.*,
        c.name AS category_name,
        u.name AS created_by_name
        FROM "Transaction" t
        JOIN "Category" c ON c.id = t.category_id
        JOIN "User" u ON u.id = t.created_by
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC;
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { amount, type, category_id, description, payment_method } =
      await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!category_id || !type || !amount || !payment_method || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    const userId = session.user.id;
    const { rows } = await db.query(
      `
      INSERT INTO "Transaction" ( amount, type, category_id, description, payment_method, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [amount, type, category_id, description, payment_method, userId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
