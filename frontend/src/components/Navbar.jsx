import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#ffffff' : '#333333',
    backgroundColor: location.pathname === path ? '#111827' : '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontWeight: 'bold',
  })

  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h2 style={{ margin: 0 }}>Rice Ball POS</h2>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/" style={linkStyle('/')}>
          Order Page
        </Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>
          Dashboard
        </Link>
      </div>
    </nav>
  )
}

export default Navbar