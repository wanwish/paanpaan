import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:3000'

const sizes = [
  { code: 'S', pieces: 4, price: 79 },
  { code: 'M', pieces: 6, price: 109 },
  { code: 'L', pieces: 8, price: 129 },
]

const flavors = [
  {
    name: 'Salmon',
    label: 'Salmon Spicy Mayo',
    desc: 'With Ebiko',
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tuna',
    label: 'Tuna Mayo Kimchi',
    desc: 'Spicy & Tangy',
    image:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tomyum',
    label: 'Tom Yum Kung',
    desc: 'Thai Classic',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Spam',
    label: 'Spam Egg',
    desc: 'Savory Comfort',
    image:
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  },
]

function OrderPage() {
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)

  const activeSize = useMemo(
    () => sizes.find((size) => size.code === selectedSize) || sizes[1],
    [selectedSize]
  )

  const totalPrice = activeSize.price * quantity

  const fetchSales = async () => {
    const res = await fetch(`${API_BASE}/sales`)
    const data = await res.json()
    if (res.ok) setSales(data)
  }

  const addSale = async () => {
    if (!selectedFlavor) {
      alert('Please select a flavor')
      return
    }

    setLoading(true)

    const response = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flavor: selectedFlavor,
        size: selectedSize,
        unit_price: activeSize.price,
        quantity,
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      alert(data.error || 'Unable to add sale')
      return
    }

    await fetchSales()
    setQuantity(1)
  }

  useEffect(() => {
    fetchSales()
  }, [])

  return (
    <div className="content">
      <div className="order-layout">
        <div>
          <h2 className="section-title">Pick Your Size</h2>
          <div className="size-grid">
            {sizes.map((size) => (
              <div
                key={size.code}
                className={`size-card ${selectedSize === size.code ? 'active' : ''}`}
                onClick={() => setSelectedSize(size.code)}
              >
                <div className="size-letter">{size.code}</div>
                <div className="size-pieces">{size.pieces} pieces</div>
                <div className="size-price">฿{size.price}</div>
              </div>
            ))}
          </div>

          <h2 className="section-title">Pick Your Flavor</h2>
          <div className="flavor-grid">
            {flavors.map((flavor) => (
              <div
                key={flavor.name}
                className={`flavor-card ${
                  selectedFlavor === flavor.name ? 'active' : ''
                }`}
                onClick={() => setSelectedFlavor(flavor.name)}
              >
                <img
                  src={flavor.image}
                  alt={flavor.label}
                  className="flavor-image"
                />
                <div className="flavor-content">
                  <h3 className="flavor-name">{flavor.label}</h3>
                  <p className="flavor-desc">{flavor.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <h3 className="summary-title">Your Order</h3>

          <div className="summary-row">
            <span>Size</span>
            <strong>{selectedSize || '—'}</strong>
          </div>

          <div className="summary-row">
            <span>Flavor</span>
            <strong>{selectedFlavor || '—'}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Quantity</span>
            <div className="qty-row">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div className="qty-value">{quantity}</div>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Total</span>
            <div className="total-price">฿{totalPrice}</div>
          </div>

          <button
            onClick={addSale}
            disabled={loading}
            className={`primary-btn ${selectedFlavor ? 'enabled' : ''}`}
          >
            {loading ? 'Saving...' : 'Add to Order'}
          </button>
        </div>
      </div>

      <div className="panel sales-history-panel">
        <h3 className="panel-title">Sales History</h3>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Flavor</th>
              <th>Size</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Sold At</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.flavor}</td>
                  <td>{sale.size}</td>
                  <td>฿{sale.unit_price}</td>
                  <td>{sale.quantity}</td>
                  <td>฿{sale.total_price}</td>
                  <td>{new Date(sale.sold_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-text">
                  No sales yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderPage