'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
    setIsDragOver(false);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl transition-all duration-300 ${
        isDragActive
          ? 'border-2 border-blue-500 glow-blue'
          : 'border-2 border-dashed'
      }`}
      style={{
        borderColor: isDragActive ? 'var(--accent)' : 'var(--border-light)',
        background: isDragActive ? 'rgba(59,130,246,0.05)' : 'var(--bg-card)',
        padding: '60px 40px',
      }}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-5 text-center">
        {/* Icon */}
        <div
          className="relative flex items-center justify-center rounded-2xl"
          style={{
            width: 80, height: 80,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <p className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            {isDragActive ? 'Drop your bill here' : 'Upload a medical bill'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Drag & drop or click to browse — PDF, JPG, PNG supported
          </p>
        </div>

        {/* CTA button */}
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg font-mono text-sm transition-all duration-200"
          style={{
            background: 'var(--accent)',
            color: 'white',
            fontFamily: 'DM Mono, monospace',
            fontWeight: 500,
            letterSpacing: '0.03em',
          }}
        >
          Choose File
        </button>

        {/* Supported formats */}
        <div className="flex gap-2 flex-wrap justify-center">
          {['PDF', 'JPG', 'PNG', 'WEBP'].map(fmt => (
            <span key={fmt} className="badge badge-blue">{fmt}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
