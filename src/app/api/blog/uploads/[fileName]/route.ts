import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

function getUploadDir() {
  return process.env.BLOG_UPLOAD_DIR?.trim() || path.join(process.cwd(), "tmp", "uploads", "blog");
}

function contentTypeForExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await context.params;

    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return new NextResponse("Invalid file name", { status: 400 });
    }

    const diskPath = path.join(getUploadDir(), fileName);
    const buffer = await readFile(diskPath);
    const extension = path.extname(fileName);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeForExtension(extension),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}