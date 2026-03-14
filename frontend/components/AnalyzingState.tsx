'use client';

export default function AnalyzingState({ filename }: { filename: string }) {
  const steps = [
    { label: 'Reading document', icon: '📄' },
    { label: 'Extracting procedures & charges', icon: '🔍' },
    { label: 'Generating explanations', icon: '💬' },
    { label: 'Checking for anomalies', icon: '🔎' },
  ];

  return (
    <div className="flex flex-col items-center gap-8 py-16">
      {/* Animated scanner */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: 120, height: 150,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Document lines */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="absolute rounded"
            style={{
              left: 16, right: 16,
              top: 20 + i * 20,
              height: 2,
              background: i === 0 ? 'var(--border-light)' : 'var(--border)',
              width: i === 0 ? '60%' : ['85%', '70%', '90%', '65%', '80%'][i - 1],
            }}
          />
        ))}

        {/* Scanning line */}
        <div
          className="absolute left-0 right-0 scan-line"
          style={{
            top: 0, height: 3,
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            boxShadow: '0 0 12px var(--accent)',
          }}
        />
      </div>

      <div className="text-center">
        <p className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Analyzing your bill
        </p>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
          {filename}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 fade-in-up"
            style={{ animationDelay: `${i * 0.4}s`, opacity: 0 }}
          >
            <span style={{ fontSize: 16 }}>{step.icon}</span>
            <div
              className="flex-1 h-0.5 rounded overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded"
                style={{
                  background: 'var(--accent)',
                  animation: `expandWidth 1.5s ease forwards`,
                  animationDelay: `${i * 0.4 + 0.2}s`,
                  width: 0,
                }}
              />
            </div>
            <span
              className="text-xs font-mono"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                minWidth: 140,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
