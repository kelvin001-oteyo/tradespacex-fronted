import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  RefreshCw,
  ChevronRight,
  Home,
  Navigation,
  Users,
  Award,
  Shield,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Tracking statuses
  const statuses = [
    { key: 'order_placed', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'picked_up', label: 'Picked Up', icon: Users },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  // Fetch order and tracking data
  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch order details
      const orderRes = await api.get(`/api/v1/orders/${id}/`);
      const orderData = orderRes.data;
      setOrder(orderData);
      
      // Fetch tracking info (if available)
      try {
        const trackingRes = await api.get(`/api/v1/orders/${id}/tracking/`);
        const trackingData = trackingRes.data;
        setTracking(trackingData);
        setTrackingHistory(trackingData.history || []);
      } catch (trackingErr) {
        // If tracking not available, use order status
        console.log('Tracking not available, using order status');
        setTracking({
          status: orderData.status,
          tracking_number: orderData.tracking_number || 'Not available',
          carrier: orderData.carrier || 'TradeSpace Express',
          estimated_delivery: orderData.estimated_delivery || null,
          current_location: orderData.current_location || 'Processing center'
        });
        setTrackingHistory([
          {
            status: 'order_placed',
            timestamp: orderData.created_at,
            location: 'Online',
            description: 'Order confirmed'
          },
          {
            status: orderData.status === 'processing' ? 'processing' : 
                    orderData.status === 'shipped' ? 'in_transit' :
                    orderData.status === 'delivered' ? 'delivered' : 'processing',
            timestamp: orderData.updated_at || orderData.created_at,
            location: orderData.current_location || 'Processing center',
            description: orderData.status_message || `Order is ${orderData.status}`
          }
        ]);
      }
      
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
      
      if (err.response?.status === 404) {
        setError('Order not found');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh tracking data
  const refreshTracking = async () => {
    setRefreshing(true);
    try {
      const trackingRes = await api.get(`/api/v1/orders/${id}/tracking/refresh/`);
      setTracking(trackingRes.data);
      setTrackingHistory(trackingRes.data.history || []);
    } catch (err) {
      console.error('Error refreshing tracking:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Copy tracking number
  const copyTrackingNumber = () => {
    if (tracking?.tracking_number) {
      navigator.clipboard.writeText(tracking.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get current status index
  const getCurrentStatusIndex = () => {
    if (!tracking) return 0;
    const currentStatus = tracking.status || order?.status || 'order_placed';
    const index = statuses.findIndex(s => s.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'order_placed': 'text-blue-600 bg-blue-50 border-blue-200',
      'processing': 'text-amber-600 bg-amber-50 border-amber-200',
      'picked_up': 'text-purple-600 bg-purple-50 border-purple-200',
      'in_transit': 'text-indigo-600 bg-indigo-50 border-indigo-200',
      'out_for_delivery': 'text-orange-600 bg-orange-50 border-orange-200',
      'delivered': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'order_placed': Package,
      'processing': Clock,
      'picked_up': Users,
      'in_transit': Truck,
      'out_for_delivery': Navigation,
      'delivered': CheckCircle,
      'cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'order_placed': 'Order Placed',
      'processing': 'Processing',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status || 'Unknown';
  };

  // Get tracking status emoji/icon
  const getTrackingIcon = (status) => {
    const icons = {
      'order_placed': '📦',
      'processing': '⚙️',
      'picked_up': '📋',
      'in_transit': '🚚',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return icons[status] || '📦';
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading tracking information...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we fetch your shipment details</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Tracking Not Available</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <Link 
              to="/orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </>
    );
  }

  const currentIndex = getCurrentStatusIndex();
  const StatusIcon = getStatusIcon(tracking?.status || order?.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ====== HEADER ====== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-ink">Track Order</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Order #{order.id?.slice(0, 12)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshTracking}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>

        {/* ====== TRACKING STATUS CARD ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${getStatusColor(tracking?.status || order?.status)}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {getStatusLabel(tracking?.status || order?.status)}
                </h2>
                <p className="text-sm text-slate-500">
                  {tracking?.current_location || order?.current_location || 'Processing'}
                </p>
              </div>
            </div>
            
            {tracking?.estimated_delivery && (
              <div className="text-right">
                <p className="text-sm text-slate-500">Estimated Delivery</p>
                <p className="font-semibold text-ink">{formatDate(tracking.estimated_delivery)}</p>
              </div>
            )}
          </div>

          {/* Tracking Number */}
          {tracking?.tracking_number && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Tracking Number:</span>
                <span className="font-mono font-medium text-ink">{tracking.tracking_number}</span>
              </div>
              <button
                onClick={copyTrackingNumber}
                className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <span className="text-xs text-slate-400">{tracking.carrier || 'TradeSpace Express'}</span>
            </div>
          )}
        </div>

        {/* ====== TRACKING TIMELINE ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="font-semibold text-ink mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Tracking History
          </h3>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {trackingHistory.length > 0 ? (
                trackingHistory.map((event, index) => {
                  const isCurrent = index === trackingHistory.length - 1;
                  const isCompleted = index < trackingHistory.length - 1;
                  const EventIcon = getStatusIcon(event.status);
                  
                  return (
                    <div key={index} className="relative pl-12">
                      {/* Timeline Dot */}
                      <div className={`absolute left-3 top-1 w-4 h-4 rounded-full border-2 ${
                        isCurrent 
                          ? 'border-primary-500 bg-primary-500 animate-pulse' 
                          : isCompleted 
                            ? 'border-emerald-500 bg-emerald-500' 
                            : 'border-slate-300 bg-slate-300'
                      }`}>
                        {isCompleted && (
                          <CheckCircle className="absolute -top-0.5 -left-0.5 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      
                      {/* Event Content */}
                      <div className={`p-4 rounded-xl border ${
                        isCurrent 
                          ? 'bg-primary-50/30 border-primary-200' 
                          : 'bg-slate-50/50 border-slate-100'
                      }`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTrackingIcon(event.status)}</span>
                              <span className={`font-semibold ${
                                isCurrent ? 'text-primary-600' : 'text-ink'
                              }`}>
                                {getStatusLabel(event.status)}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                            )}
                            {event.location && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-slate-500">{formatDate(event.timestamp)}</p>
                            <p className="text-xs text-slate-400">{formatRelativeTime(event.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No tracking history available yet</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== ORDER SUMMARY ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono text-ink">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Placed</span>
                <span className="text-ink">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-primary-600">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Items</span>
                <span className="text-ink">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="text-ink">{order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shipping Information
            </h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-ink">{order.shipping_address?.full_name || 'N/A'}</p>
              <p className="text-slate-600">{order.shipping_address?.address_line1}</p>
              {order.shipping_address?.address_line2 && (
                <p className="text-slate-600">{order.shipping_address.address_line2}</p>
              )}
              <p className="text-slate-600">
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
              </p>
              <p className="text-slate-600">{order.shipping_address?.country}</p>
              <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-100">
                <Phone className="w-3.5 h-3.5" />
                <span>{order.shipping_address?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====== ACTIONS ====== */}
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/orders/${order.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            View Full Order
          </Link>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* ====== CONTACT SUPPORT MODAL ====== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-600" />
                Contact Support
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone Support</p>
                    <p className="font-semibold text-ink">+254 700 000 000</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email Support</p>
                    <p className="font-semibold text-ink">support@tradespacex.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Live Chat</p>
                    <p className="font-semibold text-ink">Available 24/7</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-slate-500">
                  Reference your order number <span className="font-mono font-medium text-ink">#{order.id}</span> when contacting support.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}