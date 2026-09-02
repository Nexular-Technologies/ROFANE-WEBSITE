import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthorized } from "@/lib/blog";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
// Blog images never need to be wider than this; downscaling to it and
// re-encoding as WebP keeps the served files small and fast on mobile.
const MAX_IMAGE_WIDTH = 1600;

function extensionForMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return "";
}

function getUploadDir() {
  return process.env.BLOG_UPLOAD_DIR?.trim() || path.join(process.cwd(), "tmp", "uploads", "blog");
}

export async function POST(request: Request) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const original = Buffer.from(await file.arrayBuffer());

    // Compress + resize JPEG/PNG uploads to WebP so blog images load fast.
    // Animated/other formats (gif) and already-efficient webp pass through
    // untouched, and any sharp failure falls back to the original bytes so an
    // upload never fails just because optimisation did.
    let outputBuffer: Buffer = original;
    let extension = extensionForMimeType(file.type) || path.extname(file.name) || ".bin";

    if (file.type === "image/jpeg" || file.type === "image/png") {
      try {
        outputBuffer = await sharp(original)
          .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        extension = ".webp";
      } catch {
        outputBuffer = original;
      }
    }

    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDir, fileName), outputBuffer);

    return NextResponse.json({
      url: `/api/blog/uploads/${fileName}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
