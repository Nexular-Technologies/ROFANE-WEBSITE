import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  adminBlogPostSelect,
  blogPostUpdateSchema,
  formatZodError,
  isAdminAuthorized,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await Promise.resolve(context.params);
  const body: unknown = await request.json();
  const parsed = blogPostUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.blogPost.update({
      where: { slug },
      data: parsed.data,
      select: adminBlogPostSelect,
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

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

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await Promise.resolve(context.params);

  try {
    await prisma.blogPost.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    throw error;
  }
}
