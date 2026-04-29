import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  adminBlogPostSelect,
  blogPostCreateSchema,
  formatZodError,
  isAdminAuthorized,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { published_at: "desc" },
    select: adminBlogPostSelect,
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = blogPostCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.blogPost.create({
      data: parsed.data,
      select: adminBlogPostSelect,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    throw error;
  }
}
