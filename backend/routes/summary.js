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

      sizeSummary[order.size].quantity += 1
      sizeSummary[order.size].revenue += order.total_price
    }

    res.json(Object.values(sizeSummary))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router