import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { rows } = await db.query(
      `
SELECT
  i.id,
  i.invoice_no,
  i.customer_id,
  i.total_amount,
  i.created_at,
  i.subtotal,
  i.tax,
  i.payment_method,
  i.cash_amount,
  i.debit_amount,
  COALESCE(
    json_agg(
      jsonb_build_object(
        'id', t.id,
        'amount', t.amount,
        'description', t.description,
        'type', t.type,
        'category', t.category,
        'quantity', t.quantity,
        'product_name', p.name,
        'product_id', t.product_id,
        'service_name', s.name
   

      )
    )
    FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) AS transactions

FROM "Invoice" i
LEFT JOIN "Transaction" t
  ON t.invoice_id = i.id
  AND t.deleted_at IS NULL
LEFT JOIN "Service" s
  ON s.id = t.service_id
LEFT JOIN "Product" p
  ON p.id = t.product_id
WHERE i.id = $1
  AND i.deleted_at IS NULL
GROUP BY i.id;
    `,
      [id],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
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
   UPDATE "Invoice"
      SET  total_amount = $2, subtotal = $3, tax = $4, payment_method = $5, updated_at = NOW(),status = 'finished' ,cash_amount = $6, debit_amount = $7,check_amount=$8
      WHERE id = $1

      `,
      [
        id,
        body.total_amount,
        body.subtotal,
        body.tax,
        body.payment_method,
        body.cash_amount,
        body.debit_amount,
        body.check_amount,
      ],
    );
    await client.query(
      `
      UPDATE "Transaction"
      SET payment_method = $1, updated_at = NOW(), status = 'finished'
      WHERE invoice_id = $2
      `,
      [body.payment_method, id],
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Edit Invoice Payment Method error:", err);
    return NextResponse.json(
      { error: "Failed to update invoice payment method" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
export async function DELETE(
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
  UPDATE "Invoice"
  SET deleted_at = NOW()
  WHERE id = $1
    AND deleted_at IS NULL
  `,
      [id],
    );

    await client.query(
      `
  UPDATE "Transaction"
  SET deleted_at = NOW()
  WHERE invoice_id = $1
    AND deleted_at IS NULL
  `,
      [id],
    );
    for (const transaction of body.items) {
      if (transaction.product_id) {
        await client.query(
          `
          UPDATE "Inventory"
          SET quantity = quantity + $1, updated_at = NOW()
          WHERE product_id = $2
          `,
          [transaction.quantity, transaction.product_id],
        );
      }
      await client.query(
        `
         INSERT INTO "Inventory_movement" (product_id, quantity, created_at,reason,invoice_id)
        VALUES ($1, $2, NOW(), 'return', $3)

          `,
        [transaction.product_id, transaction.quantity, id],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Invoice deleted (soft)" },
      { status: 200 },
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
