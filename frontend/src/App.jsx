import { BrowserRouter
  as Router, Routes, Route
 } from 'react-router-dom'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Navbar from './components/Navbar'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PrivateRouter from './components/PrivateRouter'
import RegisterPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer'
import { useEffect } from 'react'
import { getAccessToken, isTokenValid, refreshAccessToken } from './utils/auth'

function App() {
  // App.jsx or main layout component
useEffect(() => {
  // Check token validity every minute
  const interval = setInterval(() => {
    const token = getAccessToken();
    if (token && !isTokenValid(token)) {
      // Token is expired, try to refresh or logout
      refreshAccessToken().then(newToken => {
        if (!newToken) {
          // Refresh failed, update UI
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
      });
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
  return (
    <Router>
      <Navbar />
      <Toaster position='top-right' />

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path='/cart' element={<CartPage />} />
        <Route element={<PrivateRouter />}>
          <Route path='/checkout' element={<CheckoutPage />} />
        </Route>
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
