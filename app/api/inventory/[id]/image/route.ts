import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import supabase from "@/lib/supabase";
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const client = await db.connect();
  try {
    const { id } = await context.params;

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];
    const allowedExtensions = ["png", "jpg", "jpeg", "webp"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      !allowedMimeTypes.includes(file.type) ||
      !extension ||
      !allowedExtensions.includes(extension)
    ) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await client.query("BEGIN");
    const productResult = await client.query(
      `
      SELECT id
      FROM "Product"
      WHERE id = $1
        AND deleted_at IS NULL
      `,
      [id],
    );
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const existingImage = await client.query(
      `
      SELECT id
      FROM "ProductImage"
      WHERE product_id = $1
      LIMIT 1
      `,
      [id],
    );
    if (existingImage && existingImage.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Product already has an image. Delete it first before adding a new one.",
        },
        { status: 409 },
      );
    }
    let ext = extension;
    if (ext === "jpeg") ext = "jpg";

    const fileName = `${Date.now()}.${ext}`;
    const imagePath = `${id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || "product")
      .upload(imagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      await client.query("ROLLBACK");
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to Supabase" },
        { status: 500 },
      );
    }
    await client.query(
      `
      INSERT INTO "ProductImage"
        (product_id, image_path, created_at, updated_at)
      VALUES
        ($1, $2, NOW(), NOW())
      RETURNING *
      `,
      [id, imagePath],
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding product image:", err);
    return NextResponse.json(
      { error: "Failed to add product image" },
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

    const imageResult = await client.query(
      `
      SELECT id, image_path
      FROM "ProductImage"
      WHERE product_id = $1
      LIMIT 1
      `,
      [id],
    );

    if (imageResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const image = imageResult.rows[0];
    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || "product")
      .remove([image.image_path]);

    if (storageError) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error: "Failed to delete image from storage",
          details: storageError.message,
        },
        { status: 500 },
      );
    }
    await client.query(
      `
      DELETE FROM "ProductImage"
      WHERE id = $1
      `,
      [image.id],
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");

    return NextResponse.json(
      { error: "Failed to delete product image" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
