import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:3000'

const sizes = [
  { code: 'S', pieces: 4, price: 79 },
  { code: 'M', pieces: 6, price: 109 },
  { code: 'L', pieces: 8, price: 129 },
]

const flavors = [
  {
    key: 'Salmon',
    label: 'Salmon Spicy Mayo',
    image: '/Salmon.png',
  },
  {
    key: 'Tuna',
    label: 'Tuna Mayo Kimchi',
    image: '/Tuna.png',
  },
  {
    key: 'Tomyum',
    label: 'Tom Yum Kung',
    image: '/TomYumKung.png',
  },
  {
    key: 'Spam',
    label: 'Spam Egg',
    image: '/Spam.png',
  },
]

const emptyCounts = {
  Salmon: 0,
  Tuna: 0,
  Tomyum: 0,
  Spam: 0,
}

function OrderPage() {
  const [selectedSize, setSelectedSize] = useState('M')
  const [counts, setCounts] = useState(emptyCounts)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const activeSize = useMemo(
    () => sizes.find((size) => size.code === selectedSize) || sizes[1],
    [selectedSize]
  )

  const totalPieces = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts]
  )

  const setCount = useMemo(() => {
    if (activeSize.pieces === 0) return 0
    return totalPieces / activeSize.pieces
  }, [totalPieces, activeSize.pieces])

  const isValidMultiple =
    totalPieces > 0 && totalPieces % activeSize.pieces === 0

  const totalPrice = isValidMultiple ? setCount * activeSize.price : 0

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales`)
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Unable to fetch orders')
        return
      }

      setOrders(data || [])
    } catch (error) {
      console.error('Fetch orders error:', error)
      alert('Cannot connect to backend')
    }
  }

  const updateCount = (flavor, delta) => {
    setCounts((prev) => {
      const nextValue = Math.max(0, prev[flavor] + delta)
      return {
        ...prev,
        [flavor]: nextValue,
      }
    })
  }

  const resetCounts = () => {
    setCounts({
      Salmon: 0,
      Tuna: 0,
      Tomyum: 0,
      Spam: 0,
    })
  }

  const addOrder = async () => {
    if (!isValidMultiple) {
      alert(
        `Size ${selectedSize} must have pieces in multiples of ${activeSize.pieces}`
      )
      return
    }

    const items = Object.entries(counts)
      .filter(([, quantity]) => quantity > 0)
      .map(([flavor, quantity]) => ({
        flavor,
        quantity,
      }))

    if (items.length === 0) {
      alert('Please add at least one flavor')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: selectedSize,
          items,
        }),
      })

      const data = await response.json()
      setLoading(false)

      if (!response.ok) {
        alert(data.error || 'Unable to add order')
        return
      }

      resetCounts()
      await fetchOrders()
    } catch (error) {
      setLoading(false)
      console.error('Add order error:', error)
      alert('Cannot connect to backend')
    }
  }

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(`Delete order #${orderId}?`)
    if (!confirmed) return

    setDeletingId(orderId)

    try {
      const response = await fetch(`${API_BASE}/sales/${orderId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      setDeletingId(null)

      if (!response.ok) {
        alert(data.error || 'Unable to delete order')
        return
      }

      await fetchOrders()
    } catch (error) {
      setDeletingId(null)
      console.error('Delete order error:', error)
      alert('Cannot connect to backend')
    }
  }

  useEffect(() => {
    fetchOrders()
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
                <div className="size-pieces">{size.pieces} pieces / set</div>
                <div className="size-price">฿{size.price}</div>
              </div>
            ))}
          </div>

          <h2 className="section-title">Pick Your Flavor</h2>
          <div className="flavor-grid">
            {flavors.map((flavor) => (
              <div key={flavor.key} className="flavor-card">
                <img src={flavor.image} alt={flavor.label} className="flavor-image" />
                <div className="flavor-content">
                  <h3 className="flavor-name">{flavor.label}</h3>

                  <div
                    style={{
                      marginTop: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Pieces</span>

                    <div className="qty-row">
                      <button
                        className="qty-btn"
                        type="button"
                        onClick={() => updateCount(flavor.key, -1)}
                      >
                        −
                      </button>
                      <div className="qty-value">{counts[flavor.key]}</div>
                      <button
                        className="qty-btn"
                        type="button"
                        onClick={() => updateCount(flavor.key, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <h3 className="summary-title">Your Order</h3>

          <div className="summary-row">
            <span>Size</span>
            <strong>{selectedSize}</strong>
          </div>

          <div className="summary-row">
            <span>Pieces per Set</span>
            <strong>{activeSize.pieces}</strong>
          </div>

          <div className="summary-row">
            <span>Current Pieces</span>
            <strong>{totalPieces}</strong>
          </div>

          <div className="summary-row">
            <span>Number of Sets</span>
            <strong>{isValidMultiple ? setCount : '-'}</strong>
          </div>

          <div className="summary-divider" />

          {Object.entries(counts).some(([, quantity]) => quantity > 0) ? (
            Object.entries(counts)
              .filter(([, quantity]) => quantity > 0)
              .map(([flavor, quantity]) => (
                <div className="summary-row" key={flavor}>
                  <span>{flavor}</span>
                  <strong>{quantity}</strong>
                </div>
              ))
          ) : (
            <div className="summary-row">
              <span className="empty-text">No flavor selected</span>
            </div>
          )}

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Total</span>
            <div className="total-price">฿{totalPrice}</div>
          </div>

          {!isValidMultiple && totalPieces > 0 && (
            <p className="empty-text" style={{ marginTop: '10px' }}>
              Total pieces must be a multiple of {activeSize.pieces} for size {selectedSize}
            </p>
          )}

          <button
            onClick={addOrder}
            disabled={loading || !isValidMultiple}
            className={`primary-btn ${isValidMultiple ? 'enabled' : ''}`}
          >
            {loading ? 'Saving...' : 'Add to Order'}
          </button>
        </div>
      </div>

      <div className="panel sales-history-panel">
        <h3 className="panel-title">Order History</h3>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Size</th>
              <th>Items</th>
              <th>Total Pieces</th>
              <th>Total Price</th>
              <th>Sold At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.size}</td>
                  <td>
                    {(order.items || [])
                      .map((item) => `${item.flavor} x${item.quantity}`)
                      .join(', ')}
                  </td>
                  <td>{order.total_pieces}</td>
                  <td>฿{order.total_price}</td>
                  <td>{new Date(order.sold_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      style={{
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: '#f3d8cf',
                        color: '#8f3f1b',
                        fontWeight: 700,
                      }}
                    >
                      {deletingId === order.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-text">
                  No orders yet
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