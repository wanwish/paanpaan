import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const priceMap = {
  S: 79,
  M: 109,
  L: 129,
}

function OrderPage() {
  const [flavor, setFlavor] = useState('Salmon')
  const [size, setSize] = useState('S')
  const [quantity, setQuantity] = useState(1)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)

  const unitPrice = useMemo(() => priceMap[size], [size])
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity])

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false })

    if (error) {
      console.error('Fetch sales error:', error.message)
      return
    }

    setSales(data || [])
  }

  const addSale = async () => {
    if (quantity < 1) {
      alert('Quantity must be at least 1')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('sales').insert([
      {
        flavor,
        size,
        unit_price: unitPrice,
        quantity,
        total_price: totalPrice,
      },
    ])

    setLoading(false)

    if (error) {
      console.error('Insert error:', error.message)
      alert(error.message)
      return
    }

    await fetchSales()
    setQuantity(1)
    alert('Sale added successfully')
  }

  useEffect(() => {
    fetchSales()
  }, [])

  return (
    <div>
      <h1>Order Page</h1>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '420px',
          marginBottom: '24px',
          backgroundColor: '#fff',
        }}
      >
        <h2>Add Order</h2>

        <div style={{ marginBottom: '12px' }}>
          <label>Flavor</label>
          <br />
          <select
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="Salmon">Salmon</option>
            <option value="Tuna">Tuna</option>
            <option value="Tomyum">Tomyum</option>
            <option value="Spam">Spam</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Size</label>
          <br />
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="S">S - 79 THB</option>
            <option value="M">M - 109 THB</option>
            <option value="L">L - 129 THB</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Quantity</label>
          <br />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p>Unit Price: {unitPrice} THB</p>
          <p>
            <strong>Total: {totalPrice} THB</strong>
          </p>
        </div>

        <button
          onClick={addSale}
          disabled={loading}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Add Sale'}
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ddd',
        }}
      >
        <h2>Sales History</h2>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.flavor}</td>
                <td>{sale.size}</td>
                <td>{sale.unit_price}</td>
                <td>{sale.quantity}</td>
                <td>{sale.total_price}</td>
                <td>{new Date(sale.sold_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderPage