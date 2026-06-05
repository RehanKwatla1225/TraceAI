"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";
import { Badge } from "./badge";
import {
  Upload,
  X,
  Image,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
} from "lucide-react";

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  fileType?: "image" | "video" | "any";
  onUpload: (files: File[]) => void;
  onRemove?: (index: number) => void;
  className?: string;
  label?: string;
  description?: string;
  uploadedFiles?: { name: string; url?: string }[];
  disabled?: boolean;
}

export function FileUpload({
  accept,
  multiple = true,
  maxSizeMB = 50,
  fileType = "image",
  onUpload,
  onRemove,
  className,
  label,
  description,
  uploadedFiles = [],
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{ file: File; preview?: string; progress: number; status: "pending" | "uploading" | "done" | "error" }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const defaultAccept = accept || (fileType === "image"
    ? "image/jpeg,image/png,image/webp,image/gif"
    : fileType === "video"
    ? "video/mp4,video/webm,video/quicktime"
    : "*/*");

  const maxSize = maxSizeMB * 1024 * 1024;

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: { file: File; preview?: string; progress: number; status: "pending" | "uploading" | "done" | "error" }[] = [];
    
    Array.from(newFiles).forEach((file) => {
      // Validate size
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }

      // Validate type
      const allowed = defaultAccept.split(",");
      if (!allowed.includes(file.type) && !defaultAccept.includes("*/*")) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const imageExts = ["jpg", "jpeg", "png", "webp", "gif"];
        const videoExts = ["mp4", "webm", "mov"];
        if ((fileType === "image" && !imageExts.includes(ext || "")) ||
            (fileType === "video" && !videoExts.includes(ext || ""))) {
          alert(`File type ${file.type} not supported`);
          return;
        }
      }

      // Generate preview for images
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      validFiles.push({
        file,
        preview,
        progress: 0,
        status: "pending",
      });
    });

    // Simulate upload progress
    const newEntries = validFiles.map((entry) => {
      // Start simulated upload
      const interval = setInterval(() => {
        setFiles((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((f) => f.file === entry.file);
          if (idx >= 0) {
            if (updated[idx].progress >= 100) {
              clearInterval(interval);
              updated[idx] = { ...updated[idx], status: "done" };
            } else {
              updated[idx] = {
                ...updated[idx],
                progress: Math.min(updated[idx].progress + (10 + Math.random() * 20), 100),
                status: "uploading",
              };
            }
          }
          return updated;
        });
      }, 200);
      return entry;
    });

    setFiles((prev) => [...prev, ...newEntries]);
    onUpload(validFiles.map((f) => f.file));
  }, [defaultAccept, maxSize, maxSizeMB, fileType, onUpload]);

  const removeFile = (index: number) => {
    const removed = files[index];
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (onRemove) onRemove(index);
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const typeIcon = fileType === "image" ? Image : fileType === "video" ? Video : File;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block" id="file-upload-label">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500" id="file-upload-desc">{description}</p>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label || "Upload files"}
        aria-describedby={description ? "file-upload-desc" : undefined}
        aria-disabled={disabled}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-[12px] transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-[#1428A0] bg-blue-50 scale-[1.01]"
            : "border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={defaultAccept}
          multiple={multiple}
          className="hidden"
          aria-hidden="true"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        
        <div className={cn("flex flex-col items-center gap-2", isDragging && "text-[#1428A0]")}>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-[#1428A0]/10 text-[#1428A0]" : "bg-gray-100 text-gray-400"
          )}>
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? "Drop files here" : `Drag & drop ${fileType === "any" ? "files" : fileType + "s"} or click to browse`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileType === "image" ? "JPG, PNG, WebP up to " : fileType === "video" ? "MP4, WebM up to " : "Files up to "}
              {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploading files */}
      {files.length > 0 && (
        <ul className="space-y-2" role="list" aria-label="Uploading files">
          {files.map((entry, i) => (
            <li
              key={`${entry.file.name}-${i}`}
              className="flex items-center gap-3 p-3 rounded-[10px] bg-white border shadow-sm"
            >
              {entry.preview ? (
                <img src={entry.preview} alt="" className="h-10 w-10 rounded-[6px] object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-[6px] bg-gray-100 flex items-center justify-center">
                  {entry.file.type.startsWith("video") ? (
                    <Video className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 truncate">{entry.file.name}</span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {(entry.file.size / 1024).toFixed(0)}KB
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={entry.progress}
                    className={cn(
                      "h-1.5",
                      entry.status === "done" && "bg-green-100 [&>div]:bg-green-500",
                      entry.status === "error" && "bg-red-100 [&>div]:bg-red-500",
                    )}
                    aria-label={`Upload progress: ${entry.progress}%`}
                  />
                  <span className="text-[10px] font-bold w-8 text-right text-gray-500">{entry.progress}%</span>
                  {entry.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" aria-label="Upload complete" />}
                  {entry.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${entry.file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Previously uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Files</p>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((uf, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 py-1.5">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {uf.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
