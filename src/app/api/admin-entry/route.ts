import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const configuredKeyword = process.env.BLOG_ADMIN_ENTRY_KEYWORD?.trim();

  if (!configuredKeyword) {
    return NextResponse.json(
      { error: "Admin entry keyword is not configured" },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { keyword?: string };
  const candidate = body.keyword?.trim();

  if (!candidate) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  if (candidate !== configuredKeyword) {
    return NextResponse.json({ error: "Invalid keyword" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
