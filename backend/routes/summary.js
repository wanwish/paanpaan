const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// GET /summary
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('sales').select('*')

  if (error) return res.status(500).json({ error: error.message })

  const totalRevenue = data.reduce((sum, s) => sum + s.total_price, 0)
  const totalItems = data.reduce((sum, s) => sum + s.quantity, 0)

  res.json({
    totalRevenue,
    totalItems,
  })
})

module.exports = router