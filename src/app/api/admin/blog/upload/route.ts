import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthorized } from "@/lib/blog";
import { rateLimitResponse } from "@/lib/rate-limit";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
// Blog images never need to be wider than this; downscaling to it and
// re-encoding as WebP keeps the served files small and fast on mobile.
const MAX_IMAGE_WIDTH = 1600;
// Formats we can confirm by decoding the bytes, never by trusting the browser.
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

function getUploadDir() {
  return process.env.BLOG_UPLOAD_DIR?.trim() || path.join(process.cwd(), "tmp", "uploads", "blog");
}

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "blog-upload", 20, 60 * 60 * 1000);
  if (limited) return limited;

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const original = Buffer.from(await file.arrayBuffer());

    // The declared content type and the filename are attacker-controlled, so
    // the format comes from decoding the bytes instead.
    let format: string | undefined;
    try {
      format = (await sharp(original).metadata()).format;
    } catch {
      format = undefined;
    }

    if (!format || !ALLOWED_FORMATS.has(format)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP or GIF images are allowed" },
        { status: 400 }
      );
    }

    // Re-encoding strips any non-image payload. GIFs are kept as-is so
    // animation survives, after being verified above.
    let outputBuffer: Buffer = original;
    let extension = ".gif";

    if (format !== "gif") {
      outputBuffer = await sharp(original)
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      extension = ".webp";
    }

    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDir, fileName), outputBuffer);

    return NextResponse.json({ url: `/api/blog/uploads/${fileName}` });
  } catch (error) {
    // Details stay in the server log; the client gets a generic message.
    console.error("Blog upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
