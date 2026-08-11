import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Checkout.css';
import api from '../services/api';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  MapPin,
  Truck,
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  Home,
  Building,
  ChevronRight,
  Package,
  DollarSign,
  Calendar,
  Clock,
  X
} from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Kenya'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch order data
  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Removed /api/v1/ from endpoint
      const response = await api.get(`/orders/${id}/`);
      const orderData = response.data;
      setOrder(orderData);
      
      // Pre-fill shipping address from user profile
      if (user) {
        setShippingAddress(prev => ({
          ...prev,
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address_line1: user.address_line1 || '',
          address_line2: user.address_line2 || '',
          city: user.city || '',
          state: user.state || '',
          postal_code: user.postal_code || '',
          country: user.country || 'Kenya'
        }));
      }
      
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order');
      
      if (err.response?.status === 404) {
        setError('Order not found');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handle payment method change
  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Update order with shipping and payment info
      const updateData = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: notes,
        billing_same_as_shipping: billingSameAsShipping
      };
      
      // ✅ FIXED: Removed /api/v1/ from endpoint
      await api.patch(`/orders/${id}/`, updateData);
      
      // Process payment (simulate)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ✅ FIXED: Removed /api/v1/ from endpoint
      await api.post(`/orders/${id}/pay/`, {
        payment_method: paymentMethod
      });
      
      setSuccess(true);
      setStep(3);
      
      // Clear cart
      localStorage.removeItem('cart');
      
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <Link 
              to="/cart"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">Order Placed Successfully! 🎉</h2>
            <p className="text-slate-500 mb-4">
              Your order #{order.id} has been confirmed and is being processed.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm text-left">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-primary-600">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment</span>
                <span className="font-medium text-green-600">Confirmed</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                to={`/orders/${order.id}`}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                View Order
              </Link>
              <Link 
                to="/marketplace"
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ====== HEADER ====== */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Checkout</h1>
            <p className="text-sm text-slate-500 mt-0.5">Complete your order</p>
          </div>
        </div>

        {/* ====== STEPS ====== */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { number: 1, label: 'Address' },
            { number: 2, label: 'Payment' },
            { number: 3, label: 'Confirm' }
          ].map((stepItem) => (
            <div key={stepItem.number} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                stepItem.number <= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {stepItem.number < step ? <CheckCircle className="w-4 h-4" /> : stepItem.number}
              </div>
              <span className={`text-sm font-medium ${
                stepItem.number <= step ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {stepItem.label}
              </span>
              {stepItem.number < 3 && (
                <ChevronRight className="w-4 h-4 text-slate-300" />
              )}
            </div>
          ))}
        </div>

        {/* ====== ERROR ====== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ====== CHECKOUT FORM ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder}>
              
              {/* Step 1: Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Shipping Address
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Kenya"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      value={shippingAddress.address_line1}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Street address, P.O. Box"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={shippingAddress.address_line2}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Apartment, suite, unit, etc. (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Nairobi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="00100"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Payment Method
                </h3>
                
                <div className="space-y-3">
                  {[
                    { id: 'mpesa', label: 'M-Pesa', icon: '📱', description: 'Pay with M-Pesa mobile money' },
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, American Express' },
                    { id: 'bank', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' }
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => handlePaymentChange(method.id)}
                        className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{method.icon}</span>
                          <span className="font-medium text-ink">{method.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Confirm */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary-500" />
                  Confirm Order
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting || !termsAccepted}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>
                
                <Link
                  to="/cart"
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Return to Cart
                </Link>
              </div>
            </form>
          </div>

          {/* ====== ORDER SUMMARY ====== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
              <h3 className="font-semibold text-ink mb-4">Order Summary</h3>
              
              {/* Items Preview */}
              <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-ink">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-ink">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-ink">
                    {order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (16% VAT)</span>
                  <span className="font-medium text-ink">{formatCurrency(order.tax_amount)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-ink">Total</span>
                    <span className="text-primary-600">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
