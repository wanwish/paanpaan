const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

const priceMap = {
  S: 79,
  M: 109,
  L: 129,
}

const pieceMap = {
  S: 4,
  M: 6,
  L: 8,
}

// GET /sales
router.get('/', async (req, res) => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('sold_at', { ascending: false })

    if (ordersError) {
      return res.status(500).json({ error: ordersError.message })
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message })
    }

    const result = orders.map((order) => {
      const orderItems = items.filter((item) => item.order_id === order.id)
      return {
        ...order,
        items: orderItems,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching orders' })
  }
})

// POST /sales
router.post('/', async (req, res) => {
  try {
    const { size, setCount, items } = req.body

    if (!size || !setCount || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'size, setCount and items are required',
      })
    }

    if (setCount < 1) {
      return res.status(400).json({
        error: 'setCount must be at least 1',
      })
    }

    const validItems = items.filter((item) => item.quantity > 0)

    if (validItems.length === 0) {
      return res.status(400).json({
        error: 'At least one flavor quantity must be greater than 0',
      })
    }

    const piecesPerSet = pieceMap[size]

    if (!piecesPerSet) {
      return res.status(400).json({ error: 'Invalid size' })
    }

    const totalPieces = validItems.reduce((sum, item) => sum + item.quantity, 0)
    const requiredPieces = piecesPerSet * setCount

    if (totalPieces !== requiredPieces) {
      return res.status(400).json({
        error: `Size ${size} with ${setCount} set(s) must have exactly ${requiredPieces} pieces`,
      })
    }

    const totalPrice = priceMap[size] * setCount

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          size,
          set_count: setCount,
          total_pieces: totalPieces,
          total_price: totalPrice,
        },
      ])
      .select()
      .single()

    if (orderError) {
      return res.status(500).json({ error: orderError.message })
    }

    const orderItemsToInsert = validItems.map((item) => ({
      order_id: orderData.id,
      flavor: item.flavor,
      quantity: item.quantity,
    }))

    const { data: itemData, error: itemError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)
      .select()

    if (itemError) {
      return res.status(500).json({ error: itemError.message })
    }

    res.status(201).json({
      order: orderData,
      items: itemData,
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating order' })
  }
})

// DELETE /sales/reset
// ต้องอยู่ก่อน /:id
router.delete('/reset', async (req, res) => {
  try {
    const { error: itemError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', 0)

    if (itemError) {
      return res.status(500).json({ error: itemError.message })
    }

    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 0)

    if (orderError) {
      return res.status(500).json({ error: orderError.message })
    }

    res.json({ message: 'All data reset successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Error resetting database' })
  }
})

// DELETE /sales/:id
router.delete('/:id', async (req, res) => {
  try {
    const orderId = Number(req.params.id)

    if (!orderId) {
      return res.status(400).json({ error: 'Invalid order id' })
    }

    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({
      message: 'Order deleted successfully',
      deletedOrder: data[0],
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting order' })
  }
})

module.exports = router