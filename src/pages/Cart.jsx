import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Carts.css';
import api from '../services/api';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  Shield,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ChevronRight,
  X,
  Percent,
  Gift,
  Save
} from 'lucide-react';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  // Load cart from localStorage or API
  useEffect(() => {
    // Check if product was added from product detail
    if (location.state?.product) {
      addToCart(location.state.product, location.state.quantity || 1);
      // Clear location state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    }
    
    loadCart();
  }, []);

  // Load cart data
  const loadCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // If logged in, try to fetch from API
        try {
          const response = await api.get('/api/v1/cart/');
          const cartData = response.data;
          if (cartData.items && cartData.items.length > 0) {
            setCartItems(cartData.items);
            setSelectedItems(cartData.items.map(item => item.id));
            return;
          }
        } catch (apiErr) {
          // If API fails, fall back to localStorage
          console.log('API cart not available, using localStorage');
        }
      }
      
      // Load from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
        setSelectedItems(parsed.map(item => item.id));
      }
      
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product_id === product.id);
      
      let newCart;
      if (existingIndex >= 0) {
        // Update existing item
        newCart = prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newCart = [...prev, {
          id: Date.now(), // Temporary ID for UI
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: quantity,
          image_url: product.images?.[0]?.image_url || product.images?.[0]?.url || null,
          supplier_name: product.supplier?.business_name || product.supplier?.full_name || 'Supplier',
          in_stock: product.stock_quantity > 0,
          max_quantity: product.stock_quantity || 999
        }];
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(id => id === product.id);
      if (existingIndex < 0) {
        return [...prev, product.id];
      }
      return prev;
    });
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const maxQty = item.max_quantity || 999;
          return { 
            ...item, 
            quantity: Math.min(newQuantity, maxQty) 
          };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    setShowRemoveConfirm(null);
  };

  // Toggle item selection
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setApplyingPromo(true);
    setError(null);
    
    try {
      // Simulate promo validation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock promo validation
      if (promoCode.toUpperCase() === 'SAVE10') {
        setDiscount(10);
        setPromoApplied(true);
      } else if (promoCode.toUpperCase() === 'SAVE20') {
        setDiscount(20);
        setPromoApplied(true);
      } else {
        setError('Invalid promo code');
        setPromoApplied(false);
      }
      
    } catch (err) {
      setError('Failed to apply promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    
    const subtotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    const shipping = subtotal > 0 ? (subtotal >= 100000 ? 0 : 1500) : 0;
    const tax = subtotal * 0.16; // 16% VAT
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal + shipping + tax - discountAmount;
    
    return {
      subtotal,
      shipping,
      tax,
      discount: discountAmount,
      total,
      itemCount: selectedCartItems.reduce((sum, item) => sum + item.quantity, 0),
      items: selectedCartItems
    };
  };

  const totals = calculateTotals();

  // Handle checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }
    
    setCheckoutLoading(true);
    setError(null);
    
    try {
      // Prepare order data
      const orderData = {
        items: totals.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        promo_code: promoApplied ? promoCode : null
      };
      
      // Create order
      const response = await api.post('/api/v1/orders/', orderData);
      const order = response.data;
      
      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      setSelectedItems([]);
      
      // Navigate to checkout
      navigate(`/checkout/${order.id}`);
      
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to proceed to checkout');
    } finally {
      setCheckoutLoading(false);
    }
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

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">Your cart is empty</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Looks like you haven't added any items to your cart yet. Start exploring the marketplace and find products that match your needs.
              </p>
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <ArrowLeft className="w-5 h-5" />
                Browse Marketplace
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ====== HEADER ====== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-ink">Shopping Cart</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          {selectedItems.length > 0 && (
            <button
              onClick={() => {
                setCartItems([]);
                localStorage.removeItem('cart');
                setSelectedItems([]);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
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

        {/* ====== CART GRID ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Header with select all */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={selectAllItems}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Select All ({cartItems.length})
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {selectedItems.length} selected
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const totalPrice = item.price * item.quantity;
                  
                  return (
                    <div 
                      key={item.id}
                      className={`p-4 transition-colors ${
                        isSelected ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                        
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/products/${item.product_id}`}
                            className="font-medium text-ink hover:text-primary-600 transition-colors line-clamp-1"
                          >
                            {item.product_name}
                          </Link>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                            <span>{item.supplier_name}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className={item.in_stock ? 'text-green-600' : 'text-red-500'}>
                              {item.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-ink">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.max_quantity || 999)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <span className="text-sm font-semibold text-primary-600 ml-auto">
                              {formatCurrency(totalPrice)}
                            </span>
                            
                            <button
                              onClick={() => setShowRemoveConfirm(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <Link 
              to="/marketplace"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* ====== ORDER SUMMARY ====== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
              <h2 className="font-semibold text-ink text-lg mb-4">Order Summary</h2>
              
              {/* Selected Items Count */}
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                <span>Selected Items</span>
                <span className="font-medium text-ink">
                  {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-ink">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-ink">
                    {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (16% VAT)</span>
                  <span className="font-medium text-ink">{formatCurrency(totals.tax)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-ink">Total</span>
                    <span className="text-primary-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    disabled={promoApplied}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={applyingPromo || promoApplied || !promoCode.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                
                {promoApplied && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Promo code applied! You saved {discount}%
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || checkoutLoading}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary-500" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== REMOVE CONFIRMATION MODAL ====== */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Remove Item</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to remove this item from your cart?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removeItem(showRemoveConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}