import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:3000'

function DashboardPage() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalItems: 0,
  })
  const [sales, setSales] = useState([])

  const fetchSummary = async () => {
    const response = await fetch(`${API_BASE}/summary`)
    const data = await response.json()
    if (response.ok) setSummary(data)
  }

  const fetchSales = async () => {
    const response = await fetch(`${API_BASE}/sales`)
    const data = await response.json()
    if (response.ok) setSales(data)
  }

  useEffect(() => {
    fetchSummary()
    fetchSales()
  }, [])

  const groupedRows = useMemo(() => {
    const grouped = {}

    for (const sale of sales) {
      const key = `${sale.flavor}-${sale.size}`
      if (!grouped[key]) {
        grouped[key] = {
          flavor: sale.flavor,
          size: sale.size,
          qty: 0,
          revenue: 0,
        }
      }
      grouped[key].qty += sale.quantity
      grouped[key].revenue += sale.total_price
    }

    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue)
  }, [sales])

  const bestFlavor =
    Object.entries(
      sales.reduce((acc, sale) => {
        acc[sale.flavor] = (acc[sale.flavor] || 0) + sale.quantity
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  const bestSize =
    Object.entries(
      sales.reduce((acc, sale) => {
        acc[sale.size] = (acc[sale.size] || 0) + sale.quantity
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  return (
    <div className="content">
      <h2 className="section-title">Sales Dashboard</h2>
      <p className="section-subtitle">Today's performance at a glance</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-kicker">Total Sales Today</div>
          <div className="card-value">฿{summary.totalRevenue}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-kicker">Best Selling Flavor</div>
          <div className="card-value">{bestFlavor}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-kicker">Best Selling Size</div>
          <div className="card-value">{bestSize}</div>
        </div>
      </div>

      <div className="panel breakdown-panel">
        <h3 className="panel-title">Sales Breakdown</h3>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Size</th>
              <th>Qty Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.length > 0 ? (
              groupedRows.map((row, index) => (
                <tr key={`${row.flavor}-${row.size}-${index}`}>
                  <td>{row.flavor}</td>
                  <td>
                    <span className="size-badge">{row.size}</span>
                  </td>
                  <td>{row.qty}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 800 }}>
                    ฿{row.revenue}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-text">
                  No sales data
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