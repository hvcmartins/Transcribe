"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Globe,
  Clock,
  Download,
  Zap,
  ArrowRight,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import SettingsPanel from "@/components/SettingsPanel";
import ProgressBar from "@/components/ProgressBar";
import TranscriptionResultComponent from "@/components/TranscriptionResult";
import { AppSettings, DEFAULT_SETTINGS, TranscriptionResult, SUPPORTED_LANGUAGES } from "@/lib/types";

const SETTINGS_KEY = "turboscript_settings";

export default function HomePage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("auto");
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppSettings;
        setSettings(parsed);
        setLanguage(parsed.defaultLanguage);
        setTask(parsed.defaultTask);
      }
    } catch {}
  }, []);

  const saveSettings = (s: AppSettings) => {
    setSettings(s);
    setLanguage(s.defaultLanguage);
    setTask(s.defaultTask);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {}
  };

  const isConfigured =
    (settings.backendType === "colab" && !!settings.colabUrl) ||
    (settings.backendType === "groq" && !!settings.groqApiKey);

  const handleTranscribe = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("backendType", settings.backendType);
      formData.append("colabUrl", settings.colabUrl);
      formData.append("groqApiKey", settings.groqApiKey);
      formData.append("language", language);
      formData.append("task", task);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      setResult(data as TranscriptionResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSettings={() => setSettingsOpen(true)} isConfigured={isConfigured} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900" />
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Whisper large-v3 on free GPU
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Transcribe Any Audio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
              in Seconds
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Upload your audio or video file and get an accurate transcription — free, using
            Google Colab&apos;s GPU or Groq&apos;s API. No credit card, no limits.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm">
            {[
              { icon: Globe, label: "99+ languages" },
              { icon: Clock, label: "Real-time timestamps" },
              { icon: Download, label: "TXT / SRT / VTT export" },
              { icon: Zap, label: "Free GPU via Colab" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main app area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Setup banner */}
        {!isConfigured && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              <span className="font-semibold">Setup required:</span> Add a free{" "}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Groq API key</a>{" "}
              to start transcribing.
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Configure <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload zone */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100 p-6 space-y-5">
          <UploadZone
            file={file}
            onFileSelect={(f) => {
              setFile(f);
              setResult(null);
              setError(null);
            }}
            disabled={isTranscribing}
          />

          {/* Options row */}
          <div className="flex flex-wrap gap-3">
            {/* Language selector */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isTranscribing}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Task selector */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Task
              </label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {(["transcribe", "translate"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTask(t)}
                    disabled={isTranscribing}
                    className={`flex-1 py-2 text-sm font-medium transition-all capitalize ${
                      task === t
                        ? "bg-violet-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    } disabled:opacity-60`}
                  >
                    {t === "transcribe" ? "Transcribe" : "→ English"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transcribe button */}
          <button
            onClick={handleTranscribe}
            disabled={!file || isTranscribing || !isConfigured}
            className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
              !file || !isConfigured
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 hover:shadow-violet-200 active:scale-[0.99]"
            }`}
          >
            {isTranscribing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Transcribing…
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {!isConfigured
                  ? "Configure backend first"
                  : !file
                  ? "Upload a file to start"
                  : "Transcribe Now"}
              </>
            )}
          </button>
        </div>

        {/* Progress */}
        <ProgressBar isVisible={isTranscribing} />

        {/* Error */}
        {error && !isTranscribing && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Transcription failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !isTranscribing && (
          <TranscriptionResultComponent result={result} filename={file?.name || "transcription"} />
        )}

        {/* Features section */}
        {!result && !isTranscribing && (
          <section id="features" className="pt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Everything you need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "🎙️",
                  title: "Whisper large-v3",
                  desc: "State-of-the-art speech recognition with near-human accuracy",
                },
                {
                  icon: "🌍",
                  title: "99+ Languages",
                  desc: "Auto-detect or specify the language for best results",
                },
                {
                  icon: "⏱️",
                  title: "Timestamps",
                  desc: "Word-level timing for subtitles and caption editing",
                },
                {
                  icon: "🔄",
                  title: "Translation",
                  desc: "Translate from any language to English in one step",
                },
                {
                  icon: "📤",
                  title: "Multiple Formats",
                  desc: "Export as TXT, SRT, or VTT — ready for any editor",
                },
                {
                  icon: "🔒",
                  title: "Private",
                  desc: "Your files go directly to your own Colab or Groq — we never store them",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        {!result && !isTranscribing && (
          <section id="how-it-works" className="pt-2 pb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Using Google Colab GPU (Free)
            </h2>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Open the Colab notebook",
                  desc: 'Click "Open in Colab" from the README. Set the runtime to T4 GPU (free).',
                },
                {
                  step: "2",
                  title: "Run all cells",
                  desc: "The notebook installs faster-whisper, starts a FastAPI server, and creates a public ngrok URL.",
                },
                {
                  step: "3",
                  title: "Paste the URL in Settings",
                  desc: 'Copy the ngrok URL from Colab output, paste it in Settings → Colab URL, click Test.',
                },
                {
                  step: "4",
                  title: "Upload & transcribe!",
                  desc: "Drop any audio/video file and get a full transcription with timestamps in seconds.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {step}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>TurboScript Clone — Open source, free forever. Powered by OpenAI Whisper.</p>
        </div>
      </footer>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </div>
  );
}
