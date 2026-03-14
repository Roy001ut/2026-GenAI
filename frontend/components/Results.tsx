'use client';

import { AnalysisResult, Flag } from '@/app/types';

interface ResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function FlagIcon({ type }: { type: Flag['type'] }) {
  if (type === 'duplicate') return <span>⚠️</span>;
  if (type === 'high_cost') return <span>💰</span>;
  if (type === 'math_error') return <span>🔢</span>;
  return <span>🔎</span>;
}

function SeverityBadge({ severity }: { severity: Flag['severity'] }) {
  const cls = severity === 'warning' ? 'badge-amber' : severity === 'error' ? 'badge-red' : 'badge-blue';
  return <span className={`badge ${cls}`}>{severity}</span>;
}

export default function Results({ result, onReset }: ResultsProps) {
  const { medical_data, explanations, flags } = result;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
            Analysis Complete
          </h2>
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            {result.filename}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4" />
          </svg>
          New bill
        </button>
      </div>

      {/* Summary card */}
      <div className="card p-5" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="flex items-start gap-3">
          <span style={{ fontSize: 20 }}>💬</span>
          <div>
            <p className="text-xs font-mono mb-2" style={{ color: 'var(--green)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Summary
            </p>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
              {explanations.overall_summary}
            </p>
            {explanations.billing_tip && (
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                💡 {explanations.billing_tip}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Provider', value: medical_data.provider || '—' },
          { label: 'Date of Service', value: medical_data.date_of_service || '—' },
          { label: 'Total Billed', value: formatCurrency(medical_data.total_amount) },
          { label: 'Amount Due', value: formatCurrency(medical_data.amount_due), highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="card p-4"
            style={highlight ? { border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' } : {}}
          >
            <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <p className={`font-display text-lg ${highlight ? '' : ''}`} style={{ color: highlight ? 'var(--accent)' : 'var(--text-primary)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="card p-5 space-y-3" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--amber)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ⚠ {flags.length} Flag{flags.length !== 1 ? 's' : ''} Detected
          </p>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <FlagIcon type={flag.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{flag.message}</p>
                </div>
                <SeverityBadge severity={flag.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No flags */}
      {flags.length === 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.03)' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <p className="text-sm" style={{ color: 'var(--green)' }}>No anomalies or suspicious charges detected.</p>
        </div>
      )}

      {/* Procedures table */}
      {medical_data.procedures?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Line Items — {medical_data.procedures.length} procedures
            </p>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Procedure', 'Code', 'Category', 'Qty', 'Charge'].map(col => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-mono"
                      style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medical_data.procedures.map((proc, i) => {
                  const isFlagged = flags.some(f => f.procedure === proc.name);
                  const explanation = explanations.procedure_explanations?.[proc.name];
                  return (
                    <>
                      <tr
                        key={`row-${i}`}
                        style={{
                          borderBottom: explanation ? 'none' : '1px solid var(--border)',
                          background: isFlagged ? 'rgba(245,158,11,0.04)' : 'transparent',
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {isFlagged && <span style={{ color: 'var(--amber)', fontSize: 14 }}>⚠</span>}
                            <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>{proc.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {proc.code ? (
                            <span className="badge badge-blue font-mono">{proc.code}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{proc.category || '—'}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span style={{ color: 'var(--text-secondary)' }}>{proc.quantity || 1}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono" style={{ color: proc.charge ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                            {formatCurrency(proc.charge)}
                          </span>
                        </td>
                      </tr>
                      {explanation && (
                        <tr key={`exp-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td colSpan={5} className="px-5 pb-3">
                            <p className="text-xs italic" style={{ color: 'var(--text-muted)', paddingLeft: 22 }}>
                              {explanation}
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {medical_data.diagnoses?.length > 0 && (
        <div className="card p-5">
          <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Diagnoses
          </p>
          <div className="flex flex-wrap gap-2">
            {medical_data.diagnoses.map((d, i) => (
              <div key={i}>
                <span className="badge badge-blue">{d}</span>
                {explanations.diagnosis_explanations?.[d] && (
                  <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 2 }}>
                    {explanations.diagnosis_explanations[d]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {medical_data.medications?.length > 0 && (
        <div className="card p-5">
          <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Medications
          </p>
          <div className="flex flex-wrap gap-2">
            {medical_data.medications.map((m, i) => (
              <span key={i} className="badge badge-green">{m}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
