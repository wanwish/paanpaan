require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const salesRoutes = require('./routes/sales')
const summaryRoutes = require('./routes/summary')

app.use('/sales', salesRoutes)
app.use('/summary', summaryRoutes)

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000')
})