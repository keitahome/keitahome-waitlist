import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HEADER = `# KeitaHome waitlist emails

| Signed up (WIB) | Email |
| --- | --- |
`;

function formatRow(wib: string, email: string): string {
  return `| ${wib} | ${email} |\n`;
}

export function wibTimestamp(date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" ", " ");
}

/** Best-effort append to emails.md mirrors (repo + project store). */
export async function appendEmailMarkdown(
  email: string,
  wib: string,
): Promise<void> {
  const targets = [
    path.join(process.cwd(), "emails.md"),
    "/cursor/stores/bc-4fd8b147-2902-4f02-9ffd-c4e72d6a95d1/docs/waitlist/emails.md",
  ];

  for (const target of targets) {
    try {
      let existing = "";
      try {
        existing = await readFile(target, "utf8");
      } catch {
        await mkdir(path.dirname(target), { recursive: true });
        existing = HEADER;
      }
      if (!existing.includes("| --- | --- |")) {
        existing = HEADER + existing.replace(/^#.*\n*/, "");
      }
      const lower = email.toLowerCase();
      if (existing.toLowerCase().includes(`| ${lower} |`)) {
        continue;
      }
      const needsNewline = existing.length > 0 && !existing.endsWith("\n");
      await writeFile(
        target,
        `${existing}${needsNewline ? "\n" : ""}${formatRow(wib, email)}`,
        "utf8",
      );
    } catch {
      // Published runtime may not have a writable filesystem path — DB is source of truth.
    }
  }
}

export async function renderEmailsMarkdown(
  rows: { signed_up_wib: string; email: string }[],
): Promise<string> {
  return HEADER + rows.map((r) => formatRow(r.signed_up_wib, r.email)).join("");
}
