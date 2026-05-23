"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Globe,
} from "lucide-react";
import { TranscriptionResult as TResult } from "@/lib/types";
import {
  formatTime,
  generateSRT,
  generateVTT,
  downloadFile,
} from "@/lib/utils";

interface TranscriptionResultProps {
  result: TResult;
  filename: string;
}

type ViewMode = "full" | "segments";

export default function TranscriptionResultComponent({
  result,
  filename,
}: TranscriptionResultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const baseName = filename.replace(/\.[^.]+$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "srt" | "vtt") => {
    setDownloadOpen(false);
    if (format === "txt") {
      downloadFile(result.text, `${baseName}.txt`, "text/plain");
    } else if (format === "srt") {
      downloadFile(generateSRT(result.segments), `${baseName}.srt`, "text/plain");
    } else if (format === "vtt") {
      downloadFile(generateVTT(result.segments), `${baseName}.vtt`, "text/vtt");
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100 overflow-hidden">
      {/* Result header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Transcription Complete</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              {result.language && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {result.language.toUpperCase()}
                </span>
              )}
              {result.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(result.duration)}
                </span>
              )}
              {result.segments.length > 0 && (
                <span>{result.segments.length} segments</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? "bg-green-50 text-green-700"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {/* Download */}
          <div className="relative">
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              <Download className="w-3 h-3" />
              Download
              {downloadOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {downloadOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                {[
                  { format: "txt" as const, label: "📄 Plain Text (.txt)" },
                  { format: "srt" as const, label: "🎬 Subtitles (.srt)" },
                  { format: "vtt" as const, label: "🌐 WebVTT (.vtt)" },
                ].map(({ format, label }) => (
                  <button
                    key={format}
                    onClick={() => handleDownload(format)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View mode tabs */}
      {result.segments.length > 0 && (
        <div className="flex border-b border-gray-100 px-5">
          {(["full", "segments"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-all capitalize ${
                viewMode === mode
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "full" ? "Full Text" : "With Timestamps"}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 max-h-[480px] overflow-y-auto scrollbar-thin">
        {viewMode === "full" || result.segments.length === 0 ? (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
            {result.text || "(No text returned)"}
          </p>
        ) : (
          <div className="space-y-2">
            {result.segments.map((seg) => (
              <div
                key={seg.id}
                className="flex gap-3 group hover:bg-violet-50/50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <span className="flex-shrink-0 text-xs text-violet-500 font-mono mt-0.5 w-20 pt-0.5">
                  {formatTime(seg.start)} →
                </span>
                <p className="text-sm text-gray-800 leading-relaxed">{seg.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
