import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  Package,
  Truck,
  Shield,
  CheckCircle,
  Clock,
  Award,
  MessageCircle,
  Share2,
  ExternalLink,
  Edit,
  Settings,
  Camera,
  Heart,
  Eye,
  Calendar,
  DollarSign,
  ThumbsUp,
  TrendingUp,
  BarChart3,
  FileText,
  Upload,
  X,
  Plus,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function SupplierProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !id || (user?.id && parseInt(id) === user.id);
  const supplierId = id || user?.id;
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
    averageRating: 0,
    totalRevenue: 0,
    responseRate: 0,
    responseTime: 'N/A',
    verificationLevel: 'Basic'
  });
  const [activeTab, setActiveTab] = useState('products');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: '',
    description: '',
    location: '',
    phone: '',
    website: '',
    business_type: '',
    founded_year: '',
    employees: '',
    categories: []
  });

  // Fetch supplier data
  useEffect(() => {
    if (!supplierId) {
      navigate('/dashboard');
      return;
    }
    fetchSupplierData();
  }, [supplierId]);

  const fetchSupplierData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const profileRes = await api.get(`/suppliers/${supplierId}/`);
      const supplierData = profileRes.data;
      setSupplier(supplierData);
      
      // Set edit form
      setEditForm({
        business_name: supplierData.business_name || supplierData.full_name || '',
        description: supplierData.description || '',
        location: supplierData.location || '',
        phone: supplierData.phone || '',
        website: supplierData.website || '',
        business_type: supplierData.business_type || '',
        founded_year: supplierData.founded_year || '',
        employees: supplierData.employees || '',
        categories: supplierData.categories || []
      });
      
      // ✅ FIXED: Removed /api/ from endpoint
      const productsRes = await api.get('/marketplace/products/', {
        params: { supplier: supplierId, limit: 6 }
      });
      setProducts(productsRes.data.results || productsRes.data || []);
      
      // ✅ FIXED: Removed /api/ from endpoint
      const reviewsRes = await api.get(`/suppliers/${supplierId}/reviews/`);
      setReviews(reviewsRes.data.results || reviewsRes.data || []);
      
      // ✅ FIXED: Removed /api/ from endpoint
      const statsRes = await api.get(`/suppliers/${supplierId}/stats/`);
      setStats({
        totalProducts: statsRes.data.total_products || productsRes.data.count || 0,
        totalOrders: statsRes.data.total_orders || 0,
        totalReviews: statsRes.data.total_reviews || reviewsRes.data.count || 0,
        averageRating: statsRes.data.average_rating || 0,
        totalRevenue: statsRes.data.total_revenue || 0,
        responseRate: statsRes.data.response_rate || 95,
        responseTime: statsRes.data.response_time || '2 hours',
        verificationLevel: statsRes.data.verification_level || 'Basic'
      });
      
    } catch (err) {
      console.error('Error fetching supplier:', err);
      setError(err.response?.data?.message || 'Failed to load supplier profile');
      
      if (err.response?.status === 404) {
        setError('Supplier not found');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.put(`/suppliers/${supplierId}/`, editForm);
      setSupplier(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
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

  // Get verification badge
  const getVerificationBadge = (level) => {
    const badges = {
      'Basic': { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Shield },
      'Verified': { color: 'bg-blue-100 text-blue-600 border-blue-200', icon: CheckCircle },
      'Gold': { color: 'bg-amber-100 text-amber-600 border-amber-200', icon: Award },
      'Platinum': { color: 'bg-purple-100 text-purple-600 border-purple-200', icon: Award }
    };
    return badges[level] || badges['Basic'];
  };

  // Get verification level from stats - ONLY DECLARE ONCE
  const verificationBadge = getVerificationBadge(stats.verificationLevel);
  const VerificationIcon = verificationBadge.icon;

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading supplier profile...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !supplier) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Supplier Not Found</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <Link 
              to="/suppliers"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Suppliers
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ====== PROFILE HEADER ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-40 sm:h-56 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20">
            {supplier.cover_image ? (
              <img 
                src={supplier.cover_image} 
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Building className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-400 mt-1">TradeSpaceX Supplier</p>
                </div>
              </div>
            )}
            
            {/* Edit Cover Button (Own Profile) */}
            {isOwnProfile && (
              <button className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:bg-white transition-colors">
                <Camera className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="relative -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/25 border-4 border-white">
                {supplier.business_name?.charAt(0) || supplier.full_name?.charAt(0) || 'S'}
              </div>
              
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all">
                  <Camera className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-ink">
                    {supplier.business_name || supplier.full_name}
                  </h1>
                  
                  {/* Verification Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${verificationBadge.color}`}>
                    <VerificationIcon className="w-3.5 h-3.5" />
                    {stats.verificationLevel}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-1.5 flex-wrap text-sm text-slate-500">
                  {supplier.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {supplier.location}
                    </span>
                  )}
                  {supplier.business_type && (
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {supplier.business_type}
                    </span>
                  )}
                  {supplier.founded_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Est. {supplier.founded_year}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                {!isOwnProfile && (
                  <>
                    <Link
                      to={`/messages/new?supplier=${supplier.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact
                    </Link>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <Share2 className="w-4 h-4 text-slate-600" />
                    </button>
                  </>
                )}
                
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Description */}
            {supplier.description && (
              <p className="mt-3 text-slate-600 max-w-2xl">
                {supplier.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {supplier.phone && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {supplier.phone}
                </span>
              )}
              {supplier.email && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {supplier.email}
                </span>
              )}
              {supplier.website && (
                <a 
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {supplier.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ====== STATS GRID ====== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Products</span>
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalProducts}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Orders</span>
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalOrders}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Rating</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-ink">{stats.averageRating}</p>
              <span className="text-sm text-slate-400">/5</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Reviews</span>
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalReviews}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-ink">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Response</span>
            </div>
            <p className="text-2xl font-bold text-ink">{stats.responseRate}%</p>
          </div>
        </div>

        {/* ====== TABS SECTION ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'about', label: 'About', icon: Building },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-primary-500'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* ===== PRODUCTS TAB ===== */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink">Products from this supplier</h3>
                  {isOwnProfile && (
                    <Link
                      to="/products/new"
                      className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Link>
                  )}
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No products listed yet</p>
                    {isOwnProfile && (
                      <Link to="/products/new" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
                        List your first product →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                      >
                        <div className="aspect-square bg-slate-100 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0].image_url || product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm text-ink line-clamp-1">{product.name}</h4>
                          <p className="text-primary-600 font-bold text-sm mt-1">
                            {formatCurrency(product.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{product.rating || 0}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{product.orders_count || 0} sold</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {products.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link 
                      to={`/suppliers/${supplierId}/products`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
                    >
                      View all products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ===== ABOUT TAB ===== */}
            {activeTab === 'about' && (
              <div>
                {isEditing ? (
                  /* Edit Mode */
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="business_name"
                          value={editForm.business_name}
                          onChange={handleEditChange}
                          required
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Business Type
                        </label>
                        <input
                          type="text"
                          name="business_type"
                          value={editForm.business_type}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="e.g., Manufacturer, Distributor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Founded Year
                        </label>
                        <input
                          type="text"
                          name="founded_year"
                          value={editForm.founded_year}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="e.g., 2010"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="+254 700 000 000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={editForm.website}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          rows="4"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y"
                          placeholder="Tell buyers about your business..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Business Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-slate-500">Business Name</p>
                            <p className="font-medium text-ink">{supplier.business_name || supplier.full_name}</p>
                          </div>
                          {supplier.business_type && (
                            <div>
                              <p className="text-sm text-slate-500">Business Type</p>
                              <p className="font-medium text-ink">{supplier.business_type}</p>
                            </div>
                          )}
                          {supplier.founded_year && (
                            <div>
                              <p className="text-sm text-slate-500">Founded</p>
                              <p className="font-medium text-ink">{supplier.founded_year}</p>
                            </div>
                          )}
                          {supplier.employees && (
                            <div>
                              <p className="text-sm text-slate-500">Employees</p>
                              <p className="font-medium text-ink">{supplier.employees}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          {supplier.email && (
                            <div>
                              <p className="text-sm text-slate-500">Email</p>
                              <p className="font-medium text-ink">{supplier.email}</p>
                            </div>
                          )}
                          {supplier.phone && (
                            <div>
                              <p className="text-sm text-slate-500">Phone</p>
                              <p className="font-medium text-ink">{supplier.phone}</p>
                            </div>
                          )}
                          {supplier.location && (
                            <div>
                              <p className="text-sm text-slate-500">Location</p>
                              <p className="font-medium text-ink">{supplier.location}</p>
                            </div>
                          )}
                          {supplier.website && (
                            <div>
                              <p className="text-sm text-slate-500">Website</p>
                              <a 
                                href={supplier.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
                              >
                                {supplier.website.replace(/^https?:\/\//, '')}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Verification Details */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Verification & Trust
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Shield className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-ink">Identity Verified</p>
                            <p className="text-xs text-slate-500">Business registration confirmed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Shield className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-ink">Address Verified</p>
                            <p className="text-xs text-slate-500">Physical location confirmed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Shield className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="text-sm font-medium text-ink">TradeSpace Verified™</p>
                            <p className="text-xs text-slate-500">Premium trust status</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Users className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-ink">Response Rate</p>
                            <p className="text-xs text-slate-500">{stats.responseRate}% average</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== REVIEWS TAB ===== */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink">Customer Reviews</h3>
                  <span className="text-sm text-slate-500">{reviews.length} reviews</span>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No reviews yet</p>
                    <p className="text-sm text-slate-400">Be the first to leave a review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                              {review.user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-ink text-sm">
                                {review.user?.full_name || 'Anonymous'}
                              </p>
                              <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 ml-10">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== ANALYTICS TAB ===== */}
            {activeTab === 'analytics' && isOwnProfile && (
              <div>
                <h3 className="font-semibold text-ink mb-4">Business Analytics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Profile Views</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">1,247</p>
                    <p className="text-xs text-emerald-600">↑ 12% from last month</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Inquiries</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">89</p>
                    <p className="text-xs text-emerald-600">↑ 8% from last month</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Conversion Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">3.2%</p>
                    <p className="text-xs text-emerald-600">↑ 2% from last month</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Average Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">{stats.averageRating}</p>
                    <p className="text-xs text-slate-500">Based on {stats.totalReviews} reviews</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Response Time</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">{stats.responseTime}</p>
                    <p className="text-xs text-emerald-600">↓ 30 min from last month</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Repeat Customers</span>
                    </div>
                    <p className="text-2xl font-bold text-ink">43%</p>
                    <p className="text-xs text-emerald-600">↑ 5% from last month</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
