import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/search', { query: query.trim(), top_k: 5 })
      setResults(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed')
    } finally { setLoading(false) }
  }

  const scoreColor = (score) => {
    if (score >= 0.7) return 'var(--success)'
    if (score >= 0.4) return 'var(--warning)'
    return 'var(--muted)'
  }

  return (
    <div>
      <h1 className="page-title">Semantic Search</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem', marginTop: '-1rem' }}>
        Search across all documents using AI-powered semantic understanding.
      </p>

      <form onSubmit={search} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask anything about the knowledge base…"
          style={{ flex: 1, fontSize: '1rem', padding: '0.75rem 1rem' }}
        />
        <button className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {results && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            {results.results.length} result{results.results.length !== 1 ? 's' : ''} for "{results.query}"
          </div>
          {results.results.length === 0 ? (
            <div className="empty-state">No relevant documents found. Try a different query.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.results.map((r, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.title}</span>
                    <span style={{ fontSize: '0.75rem', color: scoreColor(r.score), fontWeight: 600 }}>
                      {Math.round(r.score * 100)}% match
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                    Document #{r.document_id}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, background: 'var(--surface2)', padding: '0.75rem', borderRadius: 6 }}>
                    {r.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⌕</div>
          <div>Enter a query to search the knowledge base</div>
        </div>
      )}
    </div>
  )
}
