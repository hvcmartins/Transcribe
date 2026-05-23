import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const backendType = formData.get("backendType") as string;
    const colabUrl = formData.get("colabUrl") as string;
    const groqApiKey = formData.get("groqApiKey") as string;
    const language = formData.get("language") as string;
    const task = formData.get("task") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // --- Colab backend ---
    if (backendType === "colab") {
      if (!colabUrl) {
        return NextResponse.json(
          { error: "Colab URL not configured. Please open Settings and paste your ngrok URL." },
          { status: 400 }
        );
      }

      const cleanUrl = colabUrl.replace(/\/$/, "");
      const upstream = new FormData();
      upstream.append("file", file, file.name);
      if (language && language !== "auto") upstream.append("language", language);
      upstream.append("task", task || "transcribe");

      let response: Response;
      try {
        response = await fetch(`${cleanUrl}/transcribe`, {
          method: "POST",
          body: upstream,
          signal: AbortSignal.timeout(280_000),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            error: `Cannot reach Colab backend at ${cleanUrl}. Is the notebook running? (${msg})`,
          },
          { status: 502 }
        );
      }

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json(
          { error: `Colab backend error ${response.status}: ${text}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // --- Groq backend ---
    if (backendType === "groq") {
      if (!groqApiKey) {
        return NextResponse.json(
          { error: "Groq API key not configured. Please open Settings and add your key." },
          { status: 400 }
        );
      }

      const { default: Groq } = await import("groq-sdk");
      const groq = new Groq({ apiKey: groqApiKey });

      // Convert File to the format groq-sdk expects
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const blob = new Blob([buffer], { type: file.type });
      const groqFile = new File([blob], file.name, { type: file.type });

      const transcription = await (groq.audio.transcriptions.create as Function)({
        file: groqFile,
        model: "whisper-large-v3-turbo",
        language: language && language !== "auto" ? language : undefined,
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
      });

      // Normalize Groq response to match our format
      const segments = (transcription.segments || []).map(
        (seg: { id?: number; start: number; end: number; text: string }, i: number) => ({
          id: seg.id ?? i,
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
        })
      );

      return NextResponse.json({
        text: transcription.text,
        segments,
        language: transcription.language || language,
        duration: transcription.duration || 0,
      });
    }

    return NextResponse.json({ error: "Invalid backend type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[/api/transcribe] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
