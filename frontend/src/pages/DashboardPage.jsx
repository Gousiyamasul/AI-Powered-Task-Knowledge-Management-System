import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--accent)' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => {})
    if (isAdmin) api.get('/analytics').then(r => setAnalytics(r.data)).catch(() => {})
  }, [isAdmin])

  const completed = tasks.filter(t => t.status === 'completed').length
  const pending = tasks.filter(t => t.status === 'pending').length

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome, {user?.username} 👋</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 4 }}>Here's your workspace overview.</p>
      </div>

      {isAdmin && analytics ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Tasks" value={analytics.total_tasks} />
          <StatCard label="Completed" value={analytics.completed_tasks} color="var(--success)" />
          <StatCard label="Pending" value={analytics.pending_tasks} color="var(--warning)" />
          <StatCard label="In Progress" value={analytics.in_progress_tasks} color="var(--accent-light)" />
          <StatCard label="Documents" value={analytics.total_documents} />
          <StatCard label="Users" value={analytics.total_users} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="My Tasks" value={tasks.length} />
          <StatCard label="Completed" value={completed} color="var(--success)" />
          <StatCard label="Pending" value={pending} color="var(--warning)" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600 }}>Recent Tasks</h3>
          {tasks.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem' }}>{t.title}</span>
              <span className={`badge badge-${t.status}`}>{t.status}</span>
            </div>
          ))}
          {tasks.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No tasks yet.</p>}
          <Link to="/tasks" style={{ fontSize: '0.8rem', display: 'block', marginTop: '0.75rem' }}>View all →</Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/search"><button className="btn-secondary" style={{ width: '100%', textAlign: 'left' }}>⌕  Search Knowledge Base</button></Link>
            <Link to="/documents"><button className="btn-secondary" style={{ width: '100%', textAlign: 'left' }}>⬒  Browse Documents</button></Link>
            <Link to="/tasks"><button className="btn-secondary" style={{ width: '100%', textAlign: 'left' }}>✓  View My Tasks</button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
