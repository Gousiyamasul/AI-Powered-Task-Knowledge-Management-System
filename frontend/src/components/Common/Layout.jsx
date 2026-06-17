import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', label: '⬡  Dashboard', exact: true },
  { to: '/tasks', label: '✓  Tasks' },
  { to: '/documents', label: '⬒  Documents' },
  { to: '/search', label: '⌕  Search' },
]

const adminItems = [
  { to: '/analytics', label: '◈  Analytics' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'fixed',
        height: '100vh',
      }}>
        <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>TaskFlow</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>AI Knowledge System</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                color: isActive ? 'var(--accent-light)' : 'var(--muted)',
                background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', padding: '1rem 1.25rem 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin</div>
              {adminItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.85rem',
                    color: isActive ? 'var(--accent-light)' : 'var(--muted)',
                    background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>{user?.username}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>{user?.role}</div>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
