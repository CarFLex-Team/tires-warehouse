import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import handleTireSet from "@/lib/handleTireSet";
export async function GET() {
  try {
    const { rows } = await db.query(`
SELECT
  i.*,
  c.name AS customer_name
FROM "Invoice" i
LEFT JOIN "Customer" c ON c.id = i.customer_id
WHERE i.deleted_at IS NULL AND i.status = 'pending'
ORDER BY i.created_at DESC

    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const client = await db.connect();

  try {
    const {
      total,
      subtotal,
      tax,
      customer_id,
      payment_method,
      status,
      transactions,
    } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const created_by = session.user.id;
    if (
      !customer_id ||
      !created_by ||
      !subtotal ||
      !status ||
      !Array.isArray(transactions)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await client.query("BEGIN");

    // 1️⃣ Create invoice
    const invoiceRes = await client.query(
      `
      INSERT INTO "Invoice" (customer_id, created_by, total_amount, subtotal, tax, created_at, payment_method,status)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6,$7)
      RETURNING id
      `,
      [
        customer_id,
        created_by,
        total || null,
        subtotal,
        tax || null,
        payment_method || null,
        status,
      ],
    );

    const invoiceId = invoiceRes.rows[0].id;

    // 2️⃣ Create transactions

    for (const tx of transactions) {
      if (tx.category === "Tire") {
        await client.query(
          `
        INSERT INTO "Transaction" (invoice_id, amount, description, created_at,type,category,created_by,payment_method,product_id,quantity,status)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8,$9,$10)
        
        `,
          [
            invoiceId,
            tx.amount,
            tx.description,
            tx.type,
            tx.category,
            created_by,
            payment_method || null,
            tx.product_id,
            tx.quantity,
            status,
          ],
        );
        const { rows: updatedInventoryRows } = await client.query(
          `
          UPDATE "Inventory" i
          SET quantity = quantity - $1
          FROM "Product" p
          WHERE p.id = $2
            AND i.product_id = p.id
            AND p.deleted_at IS NULL
            AND i.quantity >= $1
            RETURNING p.id, quantity, price ,cost ,size
        
        `,
          [tx.quantity, tx.product_id],
        );
        await client.query(
          `
         INSERT INTO "Inventory_movement" (product_id, quantity, created_at,reason,invoice_id)
        VALUES ($1, $2, NOW(), 'sale', $3)

          `,
          [tx.product_id, tx.quantity, invoiceId],
        );
        const productRes = await client.query(
          `SELECT condition, size FROM "Product" WHERE id = $1`,
          [tx.product_id],
        );
        if (productRes.rows[0].condition === "SET" && tx.quantity % 4 !== 0) {
          await handleTireSet(client, updatedInventoryRows[0]);
        }
      } else if (tx.category === "Service") {
        await client.query(
          `
          INSERT INTO "Transaction" (invoice_id, amount, description, created_at,type,category,created_by,payment_method,service_id,quantity,status)
          VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8,$9,$10)
          `,
          [
            invoiceId,
            tx.amount,
            tx.description,
            tx.type,
            tx.category,
            created_by,
            payment_method || null,
            tx.service_id,
            tx.quantity,
            status,
          ],
        );
      }
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
