"use client";

import { Download, File } from "lucide-react";
import { PdfViewer } from "./PdfViewer";
import { ImageViewer } from "./ImageViewer";

export interface ViewableFile {
  url: string;
  name: string;
  mimeType: string;
}

export function FileViewer({ file, height = 600 }: { file: ViewableFile; height?: number }) {
  if (file.mimeType === "application/pdf") {
    return (
      <div style={{ height }}>
        <PdfViewer url={file.url} />
      </div>
    );
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      <div style={{ height }}>
        <ImageViewer url={file.url} alt={file.name} />
      </div>
    );
  }

  // Generic fallback for types without a dedicated preview yet
  // (docx, xlsx, video, zip, etc.) — a clean download card rather than a broken viewer.
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
        <File className="h-6 w-6" />
      </span>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{file.name}</p>
        <p className="text-xs text-slate-400">Preview not available for this file type</p>
      </div>
      <a
        href={file.url}
        download={file.name}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </a>
    </div>
  );
}
