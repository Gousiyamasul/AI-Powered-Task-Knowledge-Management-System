import { useEffect, useState } from 'react'
import api from '../api/client'

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
        <span>{label}</span><span style={{ color: 'var(--muted)' }}>{value}</span>
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 8 }}>
        <div style={{ width: `${pct}%`, background: color || 'var(--accent)', borderRadius: 4, height: '100%', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/analytics').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div style={{ padding: '2rem', color: 'var(--muted)' }}>Loading analytics…</div>

  return (
    <div>
      <h1 className="page-title">Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Tasks', value: data.total_tasks, color: 'var(--accent)' },
          { label: 'Documents', value: data.total_documents, color: 'var(--accent-light)' },
          { label: 'Users', value: data.total_users, color: 'var(--muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', fontWeight: 600 }}>Task Status Breakdown</h3>
          <Bar label="Completed" value={data.completed_tasks} max={data.total_tasks} color="var(--success)" />
          <Bar label="In Progress" value={data.in_progress_tasks} max={data.total_tasks} color="var(--accent)" />
          <Bar label="Pending" value={data.pending_tasks} max={data.total_tasks} color="var(--warning)" />
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', fontWeight: 600 }}>Top Searches</h3>
          {data.top_searches.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No searches yet.</p>
          ) : (
            data.top_searches.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text)' }}>{s.query?.replace('Query: ', '').replace(/ → \d+ results$/, '') || '—'}</span>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{s.count}×</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
