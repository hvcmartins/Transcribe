"use client";

import { Settings, Zap } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  isConfigured: boolean;
}

export default function Header({ onOpenSettings, isConfigured }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-violet-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight gradient-text">TurboScript</span>
              <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                Free AI
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-violet-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-violet-600 transition-colors">
              How it works
            </a>
            <a
              href="https://colab.research.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600 transition-colors"
            >
              Colab Notebook ↗
            </a>
          </nav>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isConfigured
                ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-300 animate-pulse"
            }`}
          >
            <Settings className="w-4 h-4" />
            {isConfigured ? "Settings" : "Setup Required"}
          </button>
        </div>
      </div>
    </header>
  );
}
