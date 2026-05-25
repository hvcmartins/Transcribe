"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react";
import { AppSettings, DEFAULT_SETTINGS } from "@/lib/types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSave }: SettingsPanelProps) {
  const [local, setLocal] = useState<AppSettings>(settings);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    setLocal(settings);
    setTestStatus("idle");
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const testColabConnection = async () => {
    setTestStatus("testing");
    setTestMessage("");
    const url = local.colabUrl.replace(/\/$/, "");
    try {
      const res = await fetch(`/api/health-check?url=${encodeURIComponent(url + "/health")}`);
      const data = await res.json();
      if (data.ok) {
        setTestStatus("ok");
        setTestMessage(`Connected! Model: ${data.model || "whisper"}`);
      } else {
        setTestStatus("fail");
        setTestMessage(data.error || "Connection failed");
      }
    } catch {
      setTestStatus("fail");
      setTestMessage("Could not reach the backend");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Backend Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
          {/* Backend type selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transcription Backend
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["groq", "colab"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setLocal({ ...local, backendType: type })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    local.backendType === type
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-xl">{type === "groq" ? "⚡" : "🔬"}</span>
                  <span>{type === "groq" ? "Groq API" : "Google Colab"}</span>
                  <span className="text-xs font-normal opacity-70">
                    {type === "groq" ? "Free · Recommended" : "Free GPU"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Colab settings */}
          {local.backendType === "colab" && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                <p className="font-semibold text-blue-800 mb-2">📓 How to use Google Colab GPU:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Open the Colab notebook (link in README)</li>
                  <li>Set runtime to <strong>T4 GPU</strong> (free)</li>
                  <li>Run all cells — you&apos;ll get a public ngrok URL</li>
                  <li>Paste the URL below and click Test</li>
                </ol>
                <a
                  href="https://colab.research.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Open Google Colab <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ngrok URL
                </label>
                <input
                  type="url"
                  value={local.colabUrl}
                  onChange={(e) => {
                    setLocal({ ...local, colabUrl: e.target.value });
                    setTestStatus("idle");
                  }}
                  placeholder="https://xxxx-xx-xx-xxx-xx.ngrok-free.app"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                />
              </div>

              {/* Test button */}
              <button
                onClick={testColabConnection}
                disabled={!local.colabUrl || testStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testStatus === "testing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : testStatus === "ok" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : testStatus === "fail" ? (
                  <AlertCircle className="w-4 h-4" />
                ) : null}
                Test Connection
              </button>

              {testMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    testStatus === "ok"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {testStatus === "ok" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {testMessage}
                </div>
              )}
            </div>
          )}

          {/* Groq settings */}
          {local.backendType === "groq" && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                <p className="font-semibold text-orange-800 mb-1">⚡ Groq — Free whisper-large-v3</p>
                <p className="text-orange-700">
                  Get a free API key at{" "}
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    console.groq.com
                  </a>
                  . Free tier: generous daily limits.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={local.groqApiKey}
                  onChange={(e) => setLocal({ ...local, groqApiKey: e.target.value })}
                  placeholder="gsk_..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your key is never stored on a server — it stays in your browser.
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Default language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Default Language
            </label>
            <select
              value={local.defaultLanguage}
              onChange={(e) => setLocal({ ...local, defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          {/* Default task */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Task</label>
            <div className="grid grid-cols-2 gap-2">
              {(["transcribe", "translate"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLocal({ ...local, defaultTask: t })}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                    local.defaultTask === t
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {t === "transcribe" ? "🎙️ Transcribe" : "🌐 Translate to EN"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
