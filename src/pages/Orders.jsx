import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Orders.css';
import api from '../services/api';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pages: 1,
    limit: 10
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    sort_by: '-created_at' // Default: newest first
  });
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Status options
  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending', color: 'amber' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'emerald' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  // Sort options
  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: '-total_amount', label: 'Highest Amount' },
    { value: 'total_amount', label: 'Lowest Amount' }
  ];

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      // Filters
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.sort_by) params.append('ordering', filters.sort_by);
      
      const response = await api.get(`/api/v1/orders/?${params.toString()}`);
      
      // Handle paginated response
      const data = response.data;
      setOrders(data.results || data);
      setPagination({
        count: data.count || data.length || 0,
        next: data.next,
        previous: data.previous,
        page: pagination.page,
        pages: Math.ceil((data.count || data.length || 0) / pagination.limit),
        limit: pagination.limit
      });
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
      
      if (err.response?.status === 401) {
        // Handle unauthorized
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle status filter (quick filter buttons)
  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? '' : status);
    handleFilterChange('status', status === selectedStatus ? '' : status);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: '',
      sort_by: '-created_at'
    });
    setSelectedStatus('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Toggle order expansion
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
      'delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get status icon
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

  // Get status badge label
  const getStatusLabel = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your orders...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we fetch your order history</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && orders.length === 0) {
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
            <button 
              onClick={fetchOrders}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="flex items-center gap-3 mb-6">
              <Link to="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <h1 className="text-2xl font-bold text-ink">My Orders</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-2">No orders yet</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                You haven't placed any orders yet. Start exploring the marketplace and find products that match your needs.
              </p>
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
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
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-ink">My Orders</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {pagination.count} {pagination.count === 1 ? 'order' : 'orders'} found
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* ====== SEARCH & FILTERS ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, product, or customer..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  showFilters 
                    ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(filters.status || filters.date_from || filters.date_to) && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </button>
              
              {/* Sort */}
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Status Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map(status => {
              const isActive = selectedStatus === status.value;
              const colorClasses = {
                amber: isActive ? 'bg-amber-100 text-amber-700 border-amber-300' : 'border-slate-200 hover:border-amber-300',
                blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'border-slate-200 hover:border-blue-300',
                purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-slate-200 hover:border-purple-300',
                emerald: isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'border-slate-200 hover:border-emerald-300',
                green: isActive ? 'bg-green-100 text-green-700 border-green-300' : 'border-slate-200 hover:border-green-300',
                red: isActive ? 'bg-red-100 text-red-700 border-red-300' : 'border-slate-200 hover:border-red-300'
              };
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusFilter(status.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive ? colorClasses[status.color] : `bg-slate-50 text-slate-600 hover:bg-slate-100 ${colorClasses[status.color]}`
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== ORDERS LIST ====== */}
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);
            const isExpanded = expandedOrder === order.id;
            
            return (
              <div 
                key={order.id}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'shadow-md border-primary-200' : 'hover:shadow-md'
                }`}
              >
                {/* Order Header */}
                <div 
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-primary-600">
                        #{order.id?.slice(0, 12) || 'N/A'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{formatDate(order.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto sm:ml-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink">{formatCurrency(order.total_amount || order.amount)}</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-100">
                                <div className="flex items-center gap-3">
                                  {item.image_url ? (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.product_name}
                                      className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                      <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-ink">{item.product_name || 'Product'}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity || 1}</p>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-ink">
                                  {formatCurrency(item.price || item.unit_price)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No items details available</p>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Order Details
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-slate-100 space-y-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Order ID</span>
                            <span className="font-mono text-ink">{order.id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Date Placed</span>
                            <span className="text-ink">{formatDate(order.created_at)}</span>
                          </div>
                          {order.shipped_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Shipped Date</span>
                              <span className="text-ink">{formatDate(order.shipped_at)}</span>
                            </div>
                          )}
                          {order.delivered_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Delivered Date</span>
                              <span className="text-ink">{formatDate(order.delivered_at)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                            <span className="font-medium text-ink">Total</span>
                            <span className="font-bold text-primary-600">{formatCurrency(order.total_amount || order.amount)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          {order.status === 'shipped' && (
                            <Link
                              to={`/shipments/track/${order.tracking_number}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                            >
                              <Truck className="w-4 h-4" />
                              Track Shipment
                            </Link>
                          )}
                          {order.status === 'pending' && (
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                              <XCircle className="w-4 h-4" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        // In Orders.jsx, add track link
<Link 
  to={`/orders/${order.id}/track`}
  className="text-sm text-primary-600 hover:text-primary-700"
>
  Track Order
</Link>

// In Orders.jsx - Order Item Row
<div className="order-item">
  <div className="order-item-details">
    <p className="font-medium text-ink">{order.product_name}</p>
    <Link 
      to={`/suppliers/${order.supplier_id}`}
      className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
    >
      <Building className="w-3.5 h-3.5 inline mr-1" />
      {order.supplier_name}
    </Link>
  </div>
</div>

        {/* ====== PAGINATION ====== */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.count)} of {pagination.count} orders
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.previous}
                className={`p-2 rounded-lg border border-slate-200 transition-colors ${
                  pagination.previous 
                    ? 'hover:bg-slate-50 text-slate-600' 
                    : 'opacity-50 cursor-not-allowed text-slate-400'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.next}
                className={`p-2 rounded-lg border border-slate-200 transition-colors ${
                  pagination.next 
                    ? 'hover:bg-slate-50 text-slate-600' 
                    : 'opacity-50 cursor-not-allowed text-slate-400'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}