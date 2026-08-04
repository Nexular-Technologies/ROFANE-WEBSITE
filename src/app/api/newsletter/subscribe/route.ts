import { NextResponse } from "next/server";
import { z } from "zod";

// Version-proof email check: validate a plain string, then normalise + regex.
const bodySchema = z.object({ email: z.string().min(3).max(254) });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !Number.isFinite(listId) || listId <= 0) {
    // Env vars not set yet (e.g. local dev or before Coolify config).
    return NextResponse.json(
      { error: "The newsletter isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  let email: string;
  try {
    const json = await request.json();
    email = bodySchema.parse(json).email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      // updateEnabled lets an existing contact simply be (re)added to the list
      // instead of erroring, so re-subscribes are treated as success.
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    });

    if (res.ok) {
      return NextResponse.json({ message: "You're on the list — watch your inbox." });
    }

    const data = (await res.json().catch(() => null)) as { code?: string } | null;
    if (res.status === 400 && data?.code === "duplicate_parameter") {
      return NextResponse.json({ message: "You're already subscribed — thank you!" });
    }

    return NextResponse.json(
      { error: "Couldn't subscribe you right now. Please try again later." },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach the newsletter service. Please try again later." },
      { status: 502 }
    );
  }
}
