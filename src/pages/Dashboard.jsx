import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Stamp from '../components/Stamp';
import './Dashboard.css';
import api from '../services/api';
import { 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  Truck, 
  Bell, 
  TrendingUp, 
  Users, 
  Star, 
  Shield,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  BarChart3,
  Settings,
  User,
  LogOut,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalShipments: 0,
    activeShipments: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0,
    verificationStatus: false,
    accountAge: '0 years',
    lastLogin: 'Just now'
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Calculate dashboard data from existing endpoints
      // Fetch orders
      const ordersRes = await api.get('/orders/', {
        params: { limit: 100 }
      });
      
      const ordersData = ordersRes.data;
      let orders = [];

      if (Array.isArray(ordersData)) {
        orders = ordersData;
      } else if (Array.isArray(ordersData.results)) {
        orders = ordersData.results;
      }

      // Calculate order statistics
      const orderStats = calculateOrderStats(orders);
      
      // Get total orders count
      const totalOrders = typeof ordersData.count === 'number' 
        ? ordersData.count 
        : orders.length;

      // Fetch notifications (optional - if endpoint exists)
      let unreadCount = 0;
      try {
        const notifRes = await api.get('/notifications/', {
          params: { unread_only: true, limit: 1 }
        });
        unreadCount = notifRes.data?.count || 0;
      } catch (notifErr) {
        // Notifications endpoint might not exist yet - that's fine
        console.debug('Notifications endpoint not available yet');
      }

      // Calculate additional stats from orders
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (Number(order.total_amount) || Number(order.amount) || 0);
      }, 0);

      // Count products from orders (approximate)
      const productSet = new Set();
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.product_id) productSet.add(item.product_id);
          });
        }
      });

      // Update stats
      setStats({
        totalOrders: totalOrders,
        pendingOrders: orderStats.pending,
        shippedOrders: orderStats.shipped,
        deliveredOrders: orderStats.delivered,
        totalProducts: productSet.size || 0,
        totalMessages: 0,
        unreadMessages: unreadCount,
        totalShipments: orderStats.shipped + orderStats.delivered,
        activeShipments: orderStats.shipped,
        totalRevenue: totalRevenue,
        totalReviews: 0,
        averageRating: 0,
        verificationStatus: user?.isBusinessVerified || false,
        accountAge: calculateAccountAge(user?.created_at),
        lastLogin: user?.last_login ? formatRelativeTime(user.last_login) : 'Just now'
      });
      
      setRecentOrders(orders.slice(0, 5));
      
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper: Calculate order statistics
  const calculateOrderStats = (orders) => {
    const stats = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(order => {
      const status = order.status?.toLowerCase() || '';
      if (status === 'pending' || status === 'awaiting_payment') stats.pending++;
      else if (status === 'shipped' || status === 'processing') stats.shipped++;
      else if (status === 'delivered' || status === 'completed') stats.delivered++;
      else if (status === 'cancelled' || status === 'refunded') stats.cancelled++;
    });
    return stats;
  };

  // Helper: Calculate account age
  const calculateAccountAge = (createdAt) => {
    if (!createdAt) return '0 years';
    const created = new Date(createdAt);
    const now = new Date();
    const years = now.getFullYear() - created.getFullYear();
    const months = now.getMonth() - created.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return 'Less than a month';
    }
  };

  // Helper: Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Quick actions based on user role
  const quickActions = user?.accountType === 'supplier' 
    ? [
        { label: 'List New Product', icon: PlusCircle, href: '/products/new', color: 'primary' },
        { label: 'View Products', icon: Package, href: '/products', color: 'secondary' },
        { label: 'Manage Orders', icon: ShoppingBag, href: '/orders', color: 'emerald' },
        { label: 'Shipping Dashboard', icon: Truck, href: '/shipments', color: 'purple' },
      ]
    : [
        { label: 'Browse Marketplace', icon: ShoppingBag, href: '/marketplace', color: 'primary' },
        { label: 'My Orders', icon: Package, href: '/orders', color: 'secondary' },
        { label: 'Wishlist', icon: Star, href: '/wishlist', color: 'emerald' },
        { label: 'Explore Suppliers', icon: Users, href: '/suppliers', color: 'purple' },
      ];

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
      'delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
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
      year: 'numeric'
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your dashboard...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
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
              onClick={fetchDashboardData}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ====== HEADER ====== */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
              <span className="uppercase tracking-wider text-[11px]">Dashboard</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-slate-400">Welcome back</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-bold text-ink">
              {user?.fullName || 'Welcome to TradespaceX'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="text-sm text-slate-600 capitalize">
                {user?.accountType || 'User'} Account
              </p>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${stats.verificationStatus ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <p className={`text-xs font-medium ${stats.verificationStatus ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {stats.verificationStatus ? 'Verified Business' : 'Verification Pending'}
                </p>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <p className="text-xs text-slate-400">Last login: {stats.lastLogin}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Stamp 
              label={stats.verificationStatus ? 'VERIFIED' : 'UNVERIFIED'} 
              active={stats.verificationStatus} 
            />
            <Link 
              to="/settings" 
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-200 hover:shadow-md transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* ====== STATS GRID ====== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-primary-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-ink mt-2">{stats.totalOrders}</p>
            <p className="text-[11px] text-slate-500">Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-amber-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Open</span>
            </div>
            <p className="text-2xl font-bold text-ink mt-2">{stats.pendingOrders}</p>
            <p className="text-[11px] text-slate-500">Pending Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-purple-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Truck className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-2xl font-bold text-ink mt-2">{stats.activeShipments}</p>
            <p className="text-[11px] text-slate-500">Active Shipments</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-ink mt-2">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-[11px] text-slate-500">Total Revenue</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-blue-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Unread</span>
            </div>
            <p className="text-2xl font-bold text-ink mt-2">{stats.unreadMessages}</p>
            <p className="text-[11px] text-slate-500">New Messages</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-rose-100">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rating</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <p className="text-2xl font-bold text-ink">{stats.averageRating}</p>
              <span className="text-sm text-slate-400">/5</span>
            </div>
            <p className="text-[11px] text-slate-500">{stats.totalReviews} Reviews</p>
          </div>
        </div>

        {/* ====== TWO COLUMN LAYOUT ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ====== LEFT COLUMN (2/3) ====== */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <h2 className="font-semibold text-ink">Recent Orders</h2>
                </div>
                <Link to="/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium">No orders yet</p>
                  <p className="text-sm text-slate-400 mt-1">Start exploring the marketplace</p>
                  <Link to="/marketplace" className="inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
                    Browse products →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3 hidden sm:table-cell">Product</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentOrders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const statusColor = getStatusColor(order.status);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <Link to={`/orders/${order.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 font-mono">
                                #{order.id?.slice(0, 8) || 'N/A'}
                              </Link>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                              {order.product_name || order.items?.[0]?.product_name || 'N/A'}
                            </td>
                            <td className="px-5 py-3.5 text-sm font-semibold text-ink">
                              {formatCurrency(order.total_amount || order.amount)}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                                <StatusIcon className="w-3 h-3" />
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                              {formatDate(order.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorMap = {
                    primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200',
                    secondary: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200',
                    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
                    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200'
                  };
                  return (
                    <Link
                      key={index}
                      to={action.href}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-transparent transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${colorMap[action.color]}`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ====== RIGHT COLUMN (1/3) ====== */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/25">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <h3 className="font-semibold text-ink mt-3">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {user?.accountType || 'User'}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    stats.verificationStatus 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {stats.verificationStatus ? '✓ Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Account Age</span>
                  <span className="font-medium text-ink">{stats.accountAge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Orders</span>
                  <span className="font-medium text-ink">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Products</span>
                  <span className="font-medium text-ink">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reviews</span>
                  <span className="font-medium text-ink flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {stats.averageRating} ({stats.totalReviews})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/profile" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Trust & Verification */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-ink">Trust & Verification</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Email Verified</p>
                      <p className="text-xs text-slate-500">Identity confirmed</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.verificationStatus ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {stats.verificationStatus ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Business Verified</p>
                      <p className="text-xs text-slate-500">
                        {stats.verificationStatus ? 'Business approved' : 'Under review'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${stats.verificationStatus ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stats.verificationStatus ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Trust Score</p>
                      <p className="text-xs text-slate-500">Based on reviews & history</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-ink">{stats.averageRating}/5</span>
                </div>
              </div>
              <Link to="/verification" className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                Learn more about verification
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
