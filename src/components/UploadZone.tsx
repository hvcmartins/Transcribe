"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileAudio, FileVideo, X, AlertCircle } from "lucide-react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE_MB } from "@/lib/types";
import { formatFileSize, getFileExtension } from "@/lib/utils";

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export default function UploadZone({ file, onFileSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = getFileExtension(f.name);
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return `Unsupported format "${ext}". Supported: ${SUPPORTED_FORMATS.join(", ")}`;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large (${formatFileSize(f.size)}). Max: ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  };

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [disabled, handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const isAudio = file && file.type.startsWith("audio/");
  const isVideo = file && file.type.startsWith("video/");

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          ${
            isDragging
              ? "border-violet-500 bg-violet-50 scale-[1.01]"
              : file
              ? "border-violet-300 bg-violet-50/50"
              : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={SUPPORTED_FORMATS.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center p-10 text-center">
          {file ? (
            <>
              {/* File selected state */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-200 mb-4">
                {isAudio ? (
                  <FileAudio className="w-8 h-8 text-white" />
                ) : (
                  <FileVideo className="w-8 h-8 text-white" />
                )}
              </div>
              <p className="font-semibold text-gray-900 text-lg mb-1 max-w-sm truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} · {file.type || "unknown type"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                  setError(null);
                }}
                className="mt-4 flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove file
              </button>
            </>
          ) : (
            <>
              {/* Empty state */}
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all ${
                  isDragging
                    ? "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-200"
                    : "bg-gray-100"
                }`}
              >
                <Upload
                  className={`w-8 h-8 transition-colors ${
                    isDragging ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-1">
                {isDragging ? "Drop your file here!" : "Drop your audio or video file"}
              </p>
              <p className="text-sm text-gray-500 mb-3">or click to browse files</p>
              <div className="flex flex-wrap gap-1 justify-center max-w-md">
                {SUPPORTED_FORMATS.map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-mono"
                  >
                    {fmt.replace(".", "")}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Max {MAX_FILE_SIZE_MB} MB</p>
            </>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-500 bg-violet-100/20 pointer-events-none" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}
