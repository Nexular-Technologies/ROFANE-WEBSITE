import { NextResponse } from "next/server";
import { z } from "zod";

// Version-proof email check: validate a plain string, then normalise + regex.
const bodySchema = z.object({
  email: z.string().min(3).max(254),
  name: z.string().max(200).optional(),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Brevo's default contact attributes, so automations can greet people by name.
function nameAttributes(fullName: string) {
  const [first, ...rest] = fullName.split(/\s+/).filter(Boolean);
  if (!first) return undefined;
  return rest.length ? { FIRSTNAME: first, LASTNAME: rest.join(" ") } : { FIRSTNAME: first };
}

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
  let name: string;
  try {
    const parsed = bodySchema.parse(await request.json());
    email = parsed.email.trim().toLowerCase();
    name = (parsed.name ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const attributes = nameAttributes(name);

  const addContact = (withAttributes: boolean) =>
    fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      // updateEnabled lets an existing contact simply be (re)added to the list
      // instead of erroring, so re-subscribes are treated as success.
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        ...(withAttributes && attributes ? { attributes } : {}),
      }),
    });

  try {
    let res = await addContact(true);

    // If the account rejects the name attributes, still subscribe the email.
    if (!res.ok && res.status === 400 && attributes) {
      res = await addContact(false);
    }

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
