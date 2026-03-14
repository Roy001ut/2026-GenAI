'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import AnalyzingState from '@/components/AnalyzingState';
import Results from '@/components/Results';
import { AnalysisResult } from './types';

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleUpload = async (file: File) => {
    setFilename(file.name);
    setState('loading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setState('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Is the backend running?');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(15,17,23,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>MedAudit</span>
          <span className="badge badge-blue">Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            Powered by Claude
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero — only show when idle */}
        {state === 'idle' && (
          <div className="text-center mb-12 fade-in-up">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{
                background: 'var(--accent-glow)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AI Medical Bill Auditor
              </span>
            </div>

            <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)', lineHeight: 1.15 }}>
              Understand your<br />
              <em style={{ color: 'var(--accent)' }}>medical bill</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
              Upload any medical bill or report. Claude extracts, explains, and flags suspicious charges — in seconds.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: '🔍', label: 'Entity Extraction' },
                { icon: '💬', label: 'Plain-language Explanations' },
                { icon: '⚠️', label: 'Anomaly Detection' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload zone */}
        {state === 'idle' && (
          <div className="fade-in-up delay-2">
            <UploadZone onUpload={handleUpload} isLoading={false} />
            <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Your documents are processed privately and never stored.
            </p>
          </div>
        )}

        {/* Loading state */}
        {state === 'loading' && <AnalyzingState filename={filename} />}

        {/* Error state */}
        {state === 'error' && (
          <div className="card p-8 text-center fade-in-up" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontSize: 40 }} className="mb-4">⚠️</div>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Analysis failed</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg text-sm transition-all duration-200"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {state === 'results' && result && (
          <Results result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
