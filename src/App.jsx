// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// ===== AUTH PAGES =====
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// ===== MAIN PAGES =====
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import SupplierProfile from './pages/SupplierProfile';
import Settings from './pages/Settings';

// ===== MARKETPLACE PAGES =====
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import ProductDetail from './pages/ProductDetail';

// ===== ORDERS & CART PAGES =====
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderTracking from './pages/OrderTracking';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// ===== MESSAGES PAGES =====
import Messages from './pages/Messages';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      {/* ✅ All routes wrapped in Layout */}
      <Route element={<Layout />}>
        
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ===== MARKETPLACE ===== */}
        <Route path="/marketplace" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route 
          path="/products/new" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/:id/edit" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />

        {/* ===== SUPPLIER ROUTES ===== */}
        <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" description="Browse trusted suppliers across Africa." />} />
        <Route path="/suppliers/:id" element={<SupplierProfile />} />
        <Route path="/profile" element={<SupplierProfile />} />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Wishlist" description="Your saved products and favorites." />
            </ProtectedRoute>
          } 
        />

        {/* ===== TSE ROUTE ===== */}
        <Route path="/tse" element={<PlaceholderPage title="TradeSpace Express" description="TradeSpace Express - fast and reliable delivery service." />} />

        {/* ===== CART & CHECKOUT ===== */}
        <Route path="/cart" element={<Cart />} />
        <Route 
          path="/checkout/:id" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />

        {/* ===== STATIC PAGES ===== */}
        <Route path="/about" element={<PlaceholderPage title="About Us" description="Learn about TradeSpaceX, our mission, and our values." />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" description="Reach out to the TradeSpaceX support team or send us a message." />} />
        <Route path="/help" element={<PlaceholderPage title="Help Center" description="Find answers to common questions and get support information." />} />
        <Route path="/faq" element={<PlaceholderPage title="FAQ" description="Frequently asked questions about using TradeSpaceX." />} />
        <Route path="/shipping-policy" element={<PlaceholderPage title="Shipping Policy" description="Read about our shipping processes and delivery policy." />} />
        <Route path="/return-policy" element={<PlaceholderPage title="Return Policy" description="See how returns and refunds are handled." />} />
        <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="View the TradeSpaceX privacy policy and data handling practices." />} />
        <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Review the terms and conditions for using TradeSpaceX." />} />
        <Route path="/verification" element={<PlaceholderPage title="Verification" description="Learn about supplier verification and trust badges." />} />
        <Route path="/supplier-register" element={<PlaceholderPage title="Become a Supplier" description="Register as a supplier and start listing products." />} />
        <Route path="/blog" element={<PlaceholderPage title="Blog" description="Read the latest TradeSpaceX news and updates." />} />
        <Route path="/partners" element={<PlaceholderPage title="Partners" description="Discover our partner network and collaborations." />} />

        {/* ===== ORDERS ===== */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id/track" 
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          } 
        />

        {/* ===== MESSAGES ===== */}
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages/:id" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />

        {/* ===== PROTECTED USER ROUTES ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* ===== CATCH-ALL ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Route>
    </Routes>
  );
}
