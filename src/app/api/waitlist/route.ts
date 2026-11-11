import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { appendEmailMarkdown, wibTimestamp } from "@/lib/emails-md";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim()
      : "";

  const email = emailRaw.toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const wib = wibTimestamp();

  try {
    const existing = await sql<{ email: string }>(
      "select email from waitlist_emails where email = $1",
      [email],
    );

    if (existing.length === 0) {
      await sql(
        "insert into waitlist_emails (email, signed_up_wib) values ($1, $2)",
        [email, wib],
      );
      await appendEmailMarkdown(email, wib);
    } else {
      // Still mirror if md is missing the row (dedupe in append).
      await appendEmailMarkdown(email, existing[0] ? wib : wib);
    }

    return NextResponse.json({ ok: true, duplicate: existing.length > 0 });
  } catch (error) {
    console.error("waitlist signup failed", error);
    return NextResponse.json(
      { error: "Could not save your email. Please try again." },
      { status: 500 },
    );
  }
}
