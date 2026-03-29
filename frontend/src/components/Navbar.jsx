import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <div className="hero">
      <h1 className="brand-script">PaanPaan</h1>
      <div className="brand-subtitle">Handcrafted Rice Ball</div>
      <div className="brand-tagline">Fresh | Balanced | Grab &amp; Go</div>

      <div className="top-nav">
        <Link to="/">
          <button className={`nav-pill ${location.pathname === '/' ? 'active' : ''}`}>
            Order
          </button>
        </Link>

        <Link to="/dashboard">
          <button
            className={`nav-pill ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Navbar