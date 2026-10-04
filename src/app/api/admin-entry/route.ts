import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

function keywordMatches(candidate: string, expected: string) {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  // Guessable secret on a public endpoint: throttle hard.
  const limited = rateLimitResponse(request, "admin-entry", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const configuredKeyword = process.env.BLOG_ADMIN_ENTRY_KEYWORD?.trim();

  if (!configuredKeyword) {
    return NextResponse.json(
      { error: "Admin entry keyword is not configured" },
      { status: 503 }
    );
  }

  let candidate: string | undefined;
  try {
    const body = (await request.json()) as { keyword?: string };
    candidate = typeof body.keyword === "string" ? body.keyword.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!candidate) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  if (!keywordMatches(candidate, configuredKeyword)) {
    return NextResponse.json({ error: "Invalid keyword" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
