import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Products.css';
import api from '../services/api';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Tag,
  Calendar,
  Star,
  MoreVertical,
  Copy,
  Archive,
  EyeOff,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Upload,
  X,
  ArrowLeft,
  Building
} from 'lucide-react';

export default function Products() {
  const { user, isSupplier } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pages: 1,
    limit: 12
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    status: '',
    sort_by: '-created_at'
  });
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [categories, setCategories] = useState([]);

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'red' },
    { value: 'archived', label: 'Archived', color: 'amber' }
  ];

  // Sort options
  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: '-price', label: 'Highest Price' },
    { value: 'price', label: 'Lowest Price' },
    { value: '-rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' }
  ];

  // Fetch products
  useEffect(() => {
    // Redirect if not supplier
    if (!isSupplier) {
      navigate('/dashboard');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      // Filters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort_by) params.append('ordering', filters.sort_by);
      
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.get(`/marketplace/products/?${params.toString()}`);
      
      const data = response.data;
      setProducts(data.results || data);
      setPagination({
        count: data.count || data.length || 0,
        next: data.next,
        previous: data.previous,
        page: pagination.page,
        pages: Math.ceil((data.count || data.length || 0) / pagination.limit),
        limit: pagination.limit
      });
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.get('/marketplace/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      status: '',
      sort_by: '-created_at'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      await api.delete(`/marketplace/products/${productToDelete.id}/`);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!productToUpdate) return;
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.patch(`/marketplace/products/${productToUpdate.id}/`, {
        status: productToUpdate.newStatus
      });
      
      setProducts(products.map(p => 
        p.id === productToUpdate.id ? response.data : p
      ));
      setShowStatusModal(false);
      setProductToUpdate(null);
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err.response?.data?.message || 'Failed to update product status');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'out_of_stock': 'bg-red-100 text-red-700 border-red-200',
      'archived': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'draft': 'Draft',
      'out_of_stock': 'Out of Stock',
      'archived': 'Archived'
    };
    return labels[status?.toLowerCase()] || status || 'Unknown';
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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle product selection
  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all products
  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  // Get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url || product.images[0].url;
    }
    return null;
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your products...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we fetch your inventory</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && products.length === 0) {
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
              onClick={fetchProducts}
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
              <h1 className="text-2xl font-bold text-ink">My Products</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {pagination.count} {pagination.count === 1 ? 'product' : 'products'} in your catalog
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link 
              to="/products/new" 
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* ====== SEARCH & FILTERS ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
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
                {(filters.category || filters.min_price || filters.max_price || filters.status) && (
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
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
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

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Archive className="w-4 h-4 inline mr-1" />
                  Archive
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====== PRODUCTS GRID ====== */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">No products yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Start listing your products to showcase them to buyers on the marketplace.
            </p>
            <Link 
              to="/products/new" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              List Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product) => {
                const imageUrl = getProductImage(product);
                const statusColor = getStatusColor(product.status);
                
                return (
                  <div 
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                        {getStatusLabel(product.status)}
                      </span>
                      
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex flex-col gap-1.5">
                          <button 
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteModal(true);
                            }}
                            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-ink text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-amber-500 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{product.rating || '0'}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {product.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {product.orders_count || 0} sold
                        </span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-slate-400">
                          {formatDate(product.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ====== PAGINATION ====== */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-slate-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.count)} of {pagination.count} products
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
          </>
        )}
      </div>

      {/* ====== DELETE CONFIRMATION MODAL ====== */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Delete Product</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
