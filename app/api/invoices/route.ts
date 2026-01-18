import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const client = await db.connect();

  try {
    const { total, customer_id, payment_method, transactions } =
      await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const created_by = session.user.id;
    if (
      !customer_id ||
      !created_by ||
      !payment_method ||
      !Array.isArray(transactions)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await client.query("BEGIN");

    // 1️⃣ Create invoice
    const invoiceRes = await client.query(
      `
      INSERT INTO "Invoice" (customer_id, created_by, total_amount, created_at,payment_method)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING id
      `,
      [customer_id, created_by, total, payment_method],
    );

    const invoiceId = invoiceRes.rows[0].id;

    // 2️⃣ Create transactions

    for (const tx of transactions) {
      await client.query(
        `
        INSERT INTO "Transaction" (invoice_id, amount, description, created_at,type,category_id,created_by,payment_method)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7)
        `,
        [
          invoiceId,
          tx.amount,
          tx.description,
          tx.type,
          tx.category_id,
          created_by,
          payment_method,
        ],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ invoice_id: invoiceId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create invoice error", err);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
