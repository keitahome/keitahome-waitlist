# KeitaHome waitlist

Soft beige email waitlist for KeitaHome — *Softness without borders*.

## Signup storage

- **Published (Cursor app):** Postgres via `cursor-app.json` (`waitlist_emails` table).
- **Local / this VM:** PGlite in-memory + append to `emails.md` (and the Project store `docs/waitlist/emails.md` when writable).
- Rows are deduped by email (case-insensitive). Timestamps use Asia/Jakarta (WIB).

## Develop

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000

## GitHub Pages

Static mirror of the landing (no server). For durable signup, use the Cursor-published app URL.
