import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { isAdmin } = useAuth()
  const [docs, setDocs] = useState([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchDocs = () => api.get('/documents').then(r => setDocs(r.data)).catch(() => {})
  useEffect(() => { fetchDocs() }, [])

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Select a file first')
    setUploading(true)
    const fd = new FormData()
    fd.append('title', title)
    fd.append('file', file)
    try {
      await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded & indexed!')
      setTitle('')
      setFile(null)
      e.target.reset()
      fetchDocs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Deleted')
      fetchDocs()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <h1 className="page-title">Documents</h1>

      {isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Upload Document</h3>
          <form onSubmit={upload}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Document title" />
              </div>
              <div className="form-group">
                <label>File (.txt or .pdf)</label>
                <input type="file" accept=".txt,.pdf" onChange={e => setFile(e.target.files[0])} required />
              </div>
            </div>
            <button className="btn-primary" disabled={uploading}>{uploading ? 'Uploading & indexing…' : 'Upload'}</button>
          </form>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="empty-state">No documents uploaded yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {docs.map(doc => (
            <div key={doc.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{doc.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{doc.filename}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                {isAdmin && (
                  <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => deleteDoc(doc.id)}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
