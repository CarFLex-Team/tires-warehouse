import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import handleTireSet from "@/lib/handleTireSet";

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
  i.check_amount,
  i.down_amount,
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
        'service_name', s.name,
        'service_id', t.service_id

   

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

  const { id } = await context.params;

  try {
    const {
      customer_id,
      total_amount,
      subtotal,
      tax,
      payment_method,
      cash_amount,
      debit_amount,
      check_amount,
      status,
      transactions,
      created_at,
    } = await req.json();

    const invoiceCreatedAt = created_at ? new Date(created_at) : new Date();

    if (Number.isNaN(invoiceCreatedAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid invoice_date" },
        { status: 400 },
      );
    }
    if (
      !customer_id ||
      subtotal == null ||
      !status ||
      !Array.isArray(transactions)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await client.query("BEGIN");
    const invoiceRes = await client.query(
      `
            SELECT *
            FROM "Invoice"
            WHERE id = $1
              AND deleted_at IS NULL
            `,
      [id],
    );

    if (invoiceRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const oldTransactionsRes = await client.query(
      `
    SELECT
        product_id,
        service_id,
        amount,
        type,
        category,
        quantity,
        description
    FROM "Transaction"
    WHERE invoice_id = $1
      AND deleted_at IS NULL
    ORDER BY id
    `,
      [id],
    );

    const oldTransactions = oldTransactionsRes.rows;

    // Normalize transactions for comparison
    const normalizeTx = (tx: any) => ({
      product_id: tx.product_id || null,
      service_id: tx.service_id || null,
      amount: Number(tx.amount),
      type: tx.type,
      category: tx.category,
      quantity: Number(tx.quantity),
      description: tx.description || null,
    });

    const existingTx = oldTransactions.map(normalizeTx);

    const incomingTx = transactions
      .map(normalizeTx)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

    const currentTx = existingTx.sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    );

    const transactionsAreSame =
      JSON.stringify(currentTx) === JSON.stringify(incomingTx);
    console.log(
      "Transactions are the same:",
      transactionsAreSame,
      currentTx,
      incomingTx,
    );
    if (transactionsAreSame) {
      const updatedInvoiceRes = await client.query(
        `
        UPDATE "Invoice"
        SET
            payment_method = $2,
            status = $3,
            total_amount = $4,
            subtotal = $5,
            tax = $6,
            cash_amount = $7,
            debit_amount = $8,
            check_amount = $9,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [
          id,
          payment_method ?? null,
          status,
          total_amount ?? null,
          subtotal,
          tax ?? null,
          cash_amount ?? null,
          debit_amount ?? null,
          check_amount ?? null,
        ],
      );
      await client.query(
        `
      UPDATE "Transaction"
      SET payment_method = $1, updated_at = NOW(), status = 'finished'
      WHERE invoice_id = $2
      `,
        [payment_method, id],
      );
      await client.query("COMMIT");

      return NextResponse.json(updatedInvoiceRes.rows[0]);
    }

    for (const oldTx of oldTransactions) {
      if (oldTx.product_id && oldTx.quantity) {
        await client.query(
          `
                    UPDATE "Inventory"
                    SET
                        quantity = quantity + $1,
                        updated_at = NOW()
                    WHERE product_id = $2
                    `,
          [oldTx.quantity, oldTx.product_id],
        );

        await client.query(
          `
                    INSERT INTO "Inventory_movement" (
                        product_id,
                        quantity,
                        created_at,
                        reason,
                        invoice_id
                    )
                    VALUES ($1, $2, $3, 'return', $4)
                    `,
          [oldTx.product_id, oldTx.quantity, invoiceCreatedAt, id],
        );
      }
    }

    await client.query(
      `
            UPDATE "Transaction"
            SET
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE invoice_id = $1
              AND deleted_at IS NULL
            `,
      [id],
    );

    const updatedInvoiceRes = await client.query(
      `
            UPDATE "Invoice"
            SET
                customer_id = $2,
                total_amount = $3,
                subtotal = $4,
                tax = $5,
                payment_method = $6,
                cash_amount = $7,
                debit_amount = $8,
                check_amount = $9,
                status = $10,
                created_at = $11,
                updated_at = NOW()
            WHERE id = $1
              AND deleted_at IS NULL
            RETURNING *
            `,
      [
        id,
        customer_id,
        total_amount ?? null,
        subtotal,
        tax ?? null,
        payment_method ?? null,
        cash_amount ?? null,
        debit_amount ?? null,
        check_amount ?? null,
        status,
        invoiceCreatedAt,
      ],
    );

    for (const tx of transactions) {
      if (
        tx.amount == null ||
        !tx.type ||
        !tx.category ||
        tx.quantity == null
      ) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Invalid transaction data" },
          { status: 400 },
        );
      }

      if (tx.category === "Tire") {
        if (!tx.product_id) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Product ID is required for tire transactions" },
            { status: 400 },
          );
        }

        const inventoryRes = await client.query(
          `
                    UPDATE "Inventory" i
                    SET
                        quantity = i.quantity - $1,
                        updated_at = NOW()
                    FROM "Product" p
                    WHERE p.id = $2
                      AND i.product_id = p.id
                      AND p.deleted_at IS NULL
                      AND i.quantity >= $1
                    RETURNING
                        p.id,
                        i.quantity,
                        p.price,
                        p.cost,
                        p.size,
                        p.condition
                    `,
          [tx.quantity, tx.product_id],
        );

        if (inventoryRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Insufficient inventory" },
            { status: 400 },
          );
        }

        await client.query(
          `
                    INSERT INTO "Transaction" (
                        invoice_id,
                        amount,
                        description,
                        created_at,
                        type,
                        category,
                     
                        payment_method,
                        product_id,
                        quantity,
                        status
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    `,
          [
            id,
            tx.amount,
            tx.description || null,
            invoiceCreatedAt,
            tx.type,
            tx.category,

            payment_method || null,
            tx.product_id,
            tx.quantity,
            status,
          ],
        );

        await client.query(
          `
                    INSERT INTO "Inventory_movement" (
                        product_id,
                        quantity,
                        created_at,
                        reason,
                        invoice_id
                    )
                    VALUES ($1, $2, $3, 'sale', $4)
                    `,
          [tx.product_id, tx.quantity, invoiceCreatedAt, id],
        );

        if (
          inventoryRes.rows[0]?.condition === "SET" &&
          tx.quantity % 4 !== 0 &&
          typeof handleTireSet === "function"
        ) {
          await handleTireSet(client, inventoryRes.rows[0]);
        }
      } else if (tx.category === "Service") {
        if (!tx.service_id) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Service ID is required for service transactions" },
            { status: 400 },
          );
        }

        await client.query(
          `
                    INSERT INTO "Transaction" (
                        invoice_id,
                        amount,
                        description,
                        created_at,
                        type,
                        category,
                       
                        payment_method,
                        service_id,
                        quantity,
                        status
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    `,
          [
            id,
            tx.amount,
            tx.description || null,
            invoiceCreatedAt,
            tx.type,
            tx.category,

            payment_method || null,
            tx.service_id,
            tx.quantity,
            status,
          ],
        );
      } else {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Unsupported transaction category: ${tx.category}` },
          { status: 400 },
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Invoice updated successfully",
        invoice: updatedInvoiceRes.rows[0],
      },
      { status: 200 },
    );
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
