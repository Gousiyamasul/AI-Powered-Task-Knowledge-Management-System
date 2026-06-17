import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['', 'pending', 'in_progress', 'completed']

export default function TasksPage() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('')
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '' })
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(() => {
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    api.get(`/tasks?${params}`).then(r => setTasks(r.data)).catch(() => {})
  }, [filter])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => {
    if (isAdmin) api.get('/users').then(r => setUsers(r.data)).catch(() => {})
  }, [isAdmin])

  const createTask = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/tasks', { ...form, assigned_to: form.assigned_to ? Number(form.assigned_to) : null })
      toast.success('Task created')
      setForm({ title: '', description: '', assigned_to: '' })
      setShowForm(false)
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}`, { status })
      toast.success('Status updated')
      fetchTasks()
    } catch { toast.error('Failed to update') }
  }

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      fetchTasks()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Tasks</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Create Task</h3>
          <form onSubmit={createTask}>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Assign to</label>
              <select value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            <button className="btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Task'}</button>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">No tasks found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</span>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                </div>
                {task.description && <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{task.description}</p>}
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Assigned to: <strong>{task.assignee?.username || 'Unassigned'}</strong>
                  {' · '}Created by: {task.creator?.username}
                  {' · '}{new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                {task.status !== 'completed' && (
                  <select
                    value={task.status}
                    onChange={e => updateStatus(task.id, e.target.value)}
                    style={{ width: 140, fontSize: '0.8rem' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                {isAdmin && (
                  <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => deleteTask(task.id)}>
                    Delete
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
