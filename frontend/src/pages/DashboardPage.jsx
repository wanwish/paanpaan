import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:3000'

function DashboardPage() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalItems: 0,
  })
  const [flavorSummary, setFlavorSummary] = useState([])
  const [sizeSummary, setSizeSummary] = useState([])

  const fetchAll = async () => {
    try {
      const [summaryRes, flavorRes, sizeRes] = await Promise.all([
        fetch(`${API_BASE}/summary`),
        fetch(`${API_BASE}/summary/flavor`),
        fetch(`${API_BASE}/summary/size`),
      ])

      const summaryData = await summaryRes.json()
      const flavorData = await flavorRes.json()
      const sizeData = await sizeRes.json()

      if (summaryRes.ok) setSummary(summaryData)
      if (flavorRes.ok) setFlavorSummary(flavorData)
      if (sizeRes.ok) setSizeSummary(sizeData)
    } catch (error) {
      console.error('Fetch dashboard error:', error)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const bestFlavor = useMemo(() => {
    return [...flavorSummary].sort((a, b) => b.quantity - a.quantity)[0]?.flavor || '-'
  }, [flavorSummary])

  const bestSize = useMemo(() => {
    return [...sizeSummary].sort((a, b) => b.quantity - a.quantity)[0]?.size || '-'
  }, [sizeSummary])

  return (
    <div className="content">
      <h2 className="section-title">Sales Dashboard</h2>
      <p className="section-subtitle">Overview of sales performance by flavor</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-kicker">Total Revenue</div>
          <div className="card-value">฿{summary.totalRevenue}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-kicker">Total Pieces Sold</div>
          <div className="card-value">{summary.totalItems}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-kicker">Best Selling Flavor</div>
          <div className="card-value">{bestFlavor}</div>
        </div>
      </div>

      <div
        className="panel breakdown-panel"
        style={{ marginBottom: '24px' }}
      >
        <h3 className="panel-title">Flavor Totals</h3>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Pieces Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {flavorSummary.length > 0 ? (
              [...flavorSummary]
                .sort((a, b) => b.quantity - a.quantity)
                .map((item) => (
                  <tr key={item.flavor}>
                    <td>{item.flavor}</td>
                    <td>{item.quantity}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      ฿{item.revenue}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-text">
                  No flavor data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel breakdown-panel">
        <h3 className="panel-title">Size Totals</h3>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sizeSummary.length > 0 ? (
              [...sizeSummary]
                .sort((a, b) => a.size.localeCompare(b.size))
                .map((item) => (
                  <tr key={item.size}>
                    <td>
                      <span className="size-badge">{item.size}</span>
                    </td>
                    <td>{item.quantity}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      ฿{item.revenue}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-text">
                  No size data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="floating-chat">◌</button>
    </div>
  )
}

export default DashboardPage