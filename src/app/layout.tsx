import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TurboScript – AI Audio & Video Transcription",
  description:
    "Transcribe audio and video files instantly with AI-powered Whisper. Supports 99+ languages. Free with Google Colab GPU.",
  keywords: ["transcription", "whisper", "audio to text", "video to text", "AI transcription"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
