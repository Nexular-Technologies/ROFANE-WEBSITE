import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/blog";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

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

    const extension = extensionForMimeType(file.type) || path.extname(file.name) || ".bin";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const diskPath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();

    await writeFile(diskPath, Buffer.from(bytes));

    return NextResponse.json({
      url: `/api/blog/uploads/${fileName}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
