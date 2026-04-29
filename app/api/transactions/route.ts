import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  // const targetDate = date ?? new Date().toISOString().slice(0, 10);
  let whereClause = ``;
  const params: any[] = [];

  if (date) {
    params.push(date);
    whereClause += `
      AND t.created_at >= $${params.length}::date
      AND t.created_at < $${params.length}::date + INTERVAL '1 day'
    `;
  }

  if (month) {
    params.push(`${month}-01`);
    whereClause += `
      AND t.created_at >= date_trunc('month', $${params.length}::date)
      AND t.created_at < date_trunc('month', $${params.length}::date) + INTERVAL '1 month'
    `;
  }

  try {
    const { rows } = await db.query(
      `
    SELECT
    t.*,
    u.name AS created_by_name
FROM "Transaction" t
JOIN "User" u ON t.created_by = u.id
WHERE t.deleted_at IS NULL AND t.type = 'Expense'
${whereClause}
ORDER BY t.created_at DESC;
      
    `,
      params,
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      amount,
      type,
      category,
      description,
      payment_method,
      product_id,
      service_id,
      quantity,
    } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!type || !amount || !payment_method || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    const userId = session.user.id;
    const { rows } = await db.query(
      `
      INSERT INTO "Transaction" ( amount, type, description, payment_method, product_id, service_id,  created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        amount,
        type,

        description,
        payment_method,
        product_id,
        service_id,
        userId,
      ],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
