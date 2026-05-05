import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { blogPostDetailSelect } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await Promise.resolve(context.params);

  try {
    const post = await prisma.blogPost.findFirstOrThrow({
      where: { slug, status: "published" },
      select: blogPostDetailSelect,
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}
