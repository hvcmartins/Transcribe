"use client";

import { Loader2, Zap } from "lucide-react";

interface ProgressBarProps {
  isVisible: boolean;
  message?: string;
}

export default function ProgressBar({ isVisible, message }: ProgressBarProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-violet-100 shadow-lg p-6">
      <div className="flex items-center gap-4">
        {/* Animated icon */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-violet-400 animate-ping opacity-20" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 mb-1">
            {message || "Transcribing your audio…"}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            This may take a moment depending on file length
          </p>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          💡 Tip: For longer files, the Colab GPU (large-v3 model) gives the best accuracy
        </p>
      </div>
    </div>
  );
}
