import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import OrderPage from './pages/OrderPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <div className="page-shell">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App