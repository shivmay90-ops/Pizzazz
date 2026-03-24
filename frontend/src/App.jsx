import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenuManager from './pages/admin/AdminMenuManager';
import AdminSlots from './pages/admin/AdminSlots';

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  if (!token) return <Navigate to="/admin" state={{ from: location }} replace />;
  return children;
}

function CustomerLayout({ children }) {
  return (
    <CartProvider>
      <Navbar />
      <Cart />
      {children}
    </CartProvider>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Customer routes */}
      <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
      <Route path="/menu" element={<CustomerLayout><MenuPage /></CustomerLayout>} />
      <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
      <Route path="/order-confirmation" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/orders" element={<RequireAuth><AdminOrders /></RequireAuth>} />
      <Route path="/admin/menu" element={<RequireAuth><AdminMenuManager /></RequireAuth>} />
      <Route path="/admin/slots" element={<RequireAuth><AdminSlots /></RequireAuth>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
