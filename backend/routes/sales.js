const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// GET /sales
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sold_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /sales
router.post('/', async (req, res) => {
  const { flavor, size, unit_price, quantity } = req.body

  const total_price = unit_price * quantity

  const { data, error } = await supabase
    .from('sales')
    .insert([{ flavor, size, unit_price, quantity, total_price }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router