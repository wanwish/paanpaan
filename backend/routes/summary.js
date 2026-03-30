const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// helper
const getOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*')
  if (error) throw new Error(error.message)
  return data || []
}

const getOrderItems = async () => {
  const { data, error } = await supabase.from('order_items').select('*')
  if (error) throw new Error(error.message)
  return data || []
}

// GET /summary
router.get('/', async (req, res) => {
  try {
    const orders = await getOrders()

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
    const totalItems = orders.reduce((sum, order) => sum + order.total_pieces, 0)

    res.json({
      totalRevenue,
      totalItems,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /summary/flavor
router.get('/flavor', async (req, res) => {
  try {
    const orderItems = await getOrderItems()
    const orders = await getOrders()

    const orderMap = {}
    for (const order of orders) {
      orderMap[order.id] = order
    }

    const flavorSummary = {}

    for (const item of orderItems) {
      if (!flavorSummary[item.flavor]) {
        flavorSummary[item.flavor] = {
          flavor: item.flavor,
          quantity: 0,
          revenue: 0,
        }
      }

      flavorSummary[item.flavor].quantity += item.quantity

      const order = orderMap[item.order_id]
      if (order && order.total_pieces > 0) {
        const revenueShare = (item.quantity / order.total_pieces) * order.total_price
        flavorSummary[item.flavor].revenue += revenueShare
      }
    }

    res.json(
      Object.values(flavorSummary).map((item) => ({
        ...item,
        revenue: Math.round(item.revenue),
      }))
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /summary/size
router.get('/size', async (req, res) => {
  try {
    const orders = await getOrders()

    const sizeSummary = {}

    for (const order of orders) {
      if (!sizeSummary[order.size]) {
        sizeSummary[order.size] = {
          size: order.size,
          quantity: 0,
          revenue: 0,
        }
      }

      sizeSummary[order.size].quantity += order.set_count || 1
      sizeSummary[order.size].revenue += order.total_price
    }

    res.json(Object.values(sizeSummary))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /summary/best-sellers
router.get('/best-sellers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // รวมยอดแต่ละ flavor
    const flavorMap = {}

    data.forEach((item) => {
      if (!flavorMap[item.flavor]) {
        flavorMap[item.flavor] = 0
      }
      flavorMap[item.flavor] += item.quantity
    })

    const sortedFlavors = Object.entries(flavorMap)
      .map(([flavor, quantity]) => ({ flavor, quantity }))
      .sort((a, b) => b.quantity - a.quantity)

    // size
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')

    if (orderError) {
      return res.status(500).json({ error: orderError.message })
    }

    const sizeMap = {}

    orders.forEach((order) => {
        if (!sizeMap[order.size]) {
            sizeMap[order.size] = 0
        }
    sizeMap[order.size] += order.set_count || 1
    })

    const sortedSizes = Object.entries(sizeMap)
      .map(([size, quantity]) => ({ size, quantity }))
      .sort((a, b) => b.quantity - a.quantity)

    res.json({
      best_flavor: sortedFlavors[0] || null,
      best_size: sortedSizes[0] || null,
    })
  } catch (err) {
    res.status(500).json({ error: 'Error getting best sellers' })
  }
})

// GET /summary/flavor/:name
router.get('/flavor/:name', async (req, res) => {
  try {
    const flavorName = req.params.name

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('flavor', flavorName)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.json({
        flavor: flavorName,
        quantity: 0,
        revenue: 0,
      })
    }

    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0)

    // หา revenue โดย join orders
    const orderIds = data.map((item) => item.order_id)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .in('id', orderIds)

    let totalRevenue = 0

    orders.forEach((order) => {
      totalRevenue += order.total_price
    })

    res.json({
      flavor: flavorName,
      quantity: totalQuantity,
      revenue: totalRevenue,
    })
  } catch (err) {
    res.status(500).json({ error: 'Error getting flavor detail' })
  }
})

module.exports = router