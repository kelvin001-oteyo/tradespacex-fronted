import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './OrderDetail.css'
import api from '../services/api';
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Printer,
  MessageCircle,
  ShoppingBag,
  DollarSign,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/v1/orders/${id}/`);
      setOrder(response.data);
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-700',
      'processing': 'bg-blue-100 text-blue-700',
      'shipped': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': Clock,
      'processing': AlertCircle,
      'shipped': Truck,
      'delivered': CheckCircle,
      'completed': CheckCircle,
      'cancelled': XCircle
    };
    return icons[status?.toLowerCase()] || Clock;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading order details...</p>
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
            <h2 className="text-xl font-bold text-ink mb-2">Order Not Found</h2>
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

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Order #{order.id?.slice(0, 12)}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`p-6 rounded-2xl border mb-6 ${getStatusColor(order.status)}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className="w-8 h-8" />
            <div>
              <p className="font-semibold text-lg">
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </p>
              <p className="text-sm opacity-80">
                {order.status === 'pending' && 'Your order is being processed'}
                {order.status === 'processing' && 'We\'re preparing your order'}
                {order.status === 'shipped' && 'Your order is on the way!'}
                {order.status === 'delivered' && 'Your order has been delivered'}
                {order.status === 'completed' && 'Order completed successfully'}
                {order.status === 'cancelled' && 'This order was cancelled'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Items</span>
            </div>
            <p className="text-lg font-bold text-ink">{order.items?.length || 0}</p>
            <p className="text-xs text-slate-500">Products in this order</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            </div>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.total_amount || order.amount)}</p>
            <p className="text-xs text-slate-500">Includes taxes & shipping</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Order Date</span>
            </div>
            <p className="text-sm font-medium text-ink">{formatDate(order.created_at)}</p>
            <p className="text-xs text-slate-500">Order ID: {order.id}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-ink">Order Items</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item, index) => (
              <div key={index} className="px-5 py-4 flex items-center gap-4">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.product_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{item.product_name || 'Product'}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity || 1}</p>
                </div>
                <p className="font-semibold text-ink">{formatCurrency(item.price || item.unit_price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              <Truck className="w-4 h-4 inline mr-2" />
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
          
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Payment Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-ink">{order.payment_method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-medium ${
                  order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-ink">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="text-ink">{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span className="text-ink">{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-bold text-primary-600">{formatCurrency(order.total_amount || order.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print Order
          </button>
          <Link 
            to="/messages/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}