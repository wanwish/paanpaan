import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import OrderPage from './pages/OrderPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
        <Navbar />

        <div style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<OrderPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App