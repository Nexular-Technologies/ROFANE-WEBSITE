import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  adminBlogPostSelect,
  blogPostCreateSchema,
  formatZodError,
  isAdminAuthorized,
} from "@/lib/blog";
import { rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeBlogHtml } from "@/lib/sanitize";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "admin-api", 60, 15 * 60 * 1000);
  if (limited) return limited;

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
  const limited = rateLimitResponse(request, "admin-api", 60, 15 * 60 * 1000);
  if (limited) return limited;

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
      data: {
        ...parsed.data,
        // Stored HTML is injected with innerHTML on the public site.
        ...(parsed.data.content ? { content: sanitizeBlogHtml(parsed.data.content) } : {}),
      },
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
