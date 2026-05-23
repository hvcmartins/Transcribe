import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ ok: false, error: "No URL provided" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `HTTP ${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg });
  }
}
