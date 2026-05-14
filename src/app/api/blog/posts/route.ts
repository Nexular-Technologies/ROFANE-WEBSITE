import { NextResponse } from "next/server";
import { blogPostListSelect } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { published_at: "desc" },
    select: blogPostListSelect,
  });

  return NextResponse.json(
    { posts },
    {
      headers: {
        "access-control-allow-origin": "*",
      },
    }
  );
}
