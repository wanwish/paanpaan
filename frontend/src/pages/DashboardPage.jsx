import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function DashboardPage() {
  const [sales, setSales] = useState([])

  const fetchSales = async () => {
    const { data, error } = await supabase.from('sales').select('*')

    if (error) {
      console.error('Fetch sales error:', error.message)
      return
    }

    setSales(data || [])
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_price, 0)
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0)

  const flavorSummary = sales.reduce((acc, sale) => {
    acc[sale.flavor] = (acc[sale.flavor] || 0) + sale.quantity
    return acc
  }, {})

  const sizeSummary = sales.reduce((acc, sale) => {
    acc[sale.size] = (acc[sale.size] || 0) + sale.quantity
    return acc
  }, {})

  const bestFlavor =
    Object.entries(flavorSummary).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  const bestSize =
    Object.entries(sizeSummary).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '16px',
    minWidth: '220px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRevenue} THB</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Items Sold</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalItems}</p>
        </div>

        <div style={cardStyle}>
          <h3>Best Selling Flavor</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{bestFlavor}</p>
        </div>

        <div style={cardStyle}>
          <h3>Best Selling Size</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{bestSize}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #ddd',
          }}
        >
          <h2>Sales by Flavor</h2>
          <ul>
            {Object.entries(flavorSummary).map(([flavor, qty]) => (
              <li key={flavor}>
                {flavor}: {qty} pieces
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #ddd',
          }}
        >
          <h2>Sales by Size</h2>
          <ul>
            {Object.entries(sizeSummary).map(([size, qty]) => (
              <li key={size}>
                Size {size}: {qty} pieces
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage