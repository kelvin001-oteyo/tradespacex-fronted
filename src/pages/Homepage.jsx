import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Homepage.css';
import api from '../services/api';
import Footer from '../components/Footer';
import placeholderImage from '../assets/product-placeholder.svg';
import {
  Search,
  ShoppingBag,
  Truck,
  Shield,
  Star,
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  Globe,
  MessageCircle,
  CheckCircle,
  Clock,
  Award,
  Building,
  MapPin,
  Phone,
  Mail,
  Play,
  ChevronRight,
  Sparkles,
  Rocket,
  Zap,
  Heart,
  Eye,
  BarChart3,
  Headphones,
  Lock,
  CreditCard,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function Homepage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalOrders: 0,
    totalUsers: 0
  });

  // Mock data for fallback
  const placeholderImageUrl = placeholderImage;

  const mockProducts = [
    { id: 1, name: 'Industrial Sensors Kit', price: 24500, images: [{ url: placeholderImageUrl }], rating: 4.8, supplier: { business_name: 'TechCorp Ltd' } },
    { id: 2, name: 'Solar Panel System', price: 67500, images: [{ url: placeholderImageUrl }], rating: 4.9, supplier: { business_name: 'GreenEnergy Solutions' } },
    { id: 3, name: 'Irrigation Equipment', price: 12300, images: [{ url: placeholderImageUrl }], rating: 4.7, supplier: { business_name: 'AgriTech Ventures' } },
    { id: 4, name: 'Fleet Management System', price: 8900, images: [{ url: placeholderImageUrl }], rating: 4.6, supplier: { business_name: 'BlueWave Logistics' } },
    { id: 5, name: 'Smart Home System', price: 34500, images: [{ url: placeholderImageUrl }], rating: 4.8, supplier: { business_name: 'TechCorp Ltd' } },
    { id: 6, name: 'Solar Inverter', price: 45000, images: [{ url: placeholderImageUrl }], rating: 4.9, supplier: { business_name: 'GreenEnergy Solutions' } },
    { id: 7, name: 'Water Pump System', price: 8700, images: [{ url: placeholderImageUrl }], rating: 4.5, supplier: { business_name: 'AgriTech Ventures' } },
    { id: 8, name: 'GPS Tracking Device', price: 5600, images: [{ url: placeholderImageUrl }], rating: 4.4, supplier: { business_name: 'BlueWave Logistics' } },
  ];

  const mockSuppliers = [
    { id: 1, business_name: 'TechCorp Ltd', location: 'Nairobi, Kenya', rating: 4.8, total_products: 23 },
    { id: 2, business_name: 'GreenEnergy Solutions', location: 'Mombasa, Kenya', rating: 4.9, total_products: 18 },
    { id: 3, business_name: 'AgriTech Ventures', location: 'Kisumu, Kenya', rating: 4.7, total_products: 15 },
    { id: 4, business_name: 'BlueWave Logistics', location: 'Eldoret, Kenya', rating: 4.6, total_products: 12 },
    { id: 5, business_name: 'SmartBuild Ltd', location: 'Nairobi, Kenya', rating: 4.5, total_products: 20 },
    { id: 6, business_name: 'HealthPlus Medical', location: 'Mombasa, Kenya', rating: 4.8, total_products: 10 },
  ];

  const mockCategories = [
    { id: 1, name: 'Electronics', icon: '💻' },
    { id: 2, name: 'Agriculture', icon: '🌾' },
    { id: 3, name: 'Construction', icon: '🏗️' },
    { id: 4, name: 'Healthcare', icon: '🏥' },
    { id: 5, name: 'Transport', icon: '🚛' },
    { id: 6, name: 'Manufacturing', icon: '🏭' },
    { id: 7, name: 'Energy', icon: '⚡' },
    { id: 8, name: 'Education', icon: '📚' },
  ];

  // Fetch homepage data
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    setLoading(true);
    
    try {
      // Try to fetch from API, but don't fail if endpoints don't exist
      let productsData = [];
      let suppliersData = [];
      let categoriesData = [];
      let statsData = {};

      // Fetch featured products
      try {
        const productsRes = await api.get('/api/marketplace/products/', {
          params: { featured: true, limit: 8 }
        });
        const rawProducts = productsRes.data?.results || productsRes.data || [];
        productsData = Array.isArray(rawProducts) ? rawProducts : [];
      } catch (err) {
        console.warn('Products API error, using mock data:', err.message);
        productsData = mockProducts;
      }

      // Fetch top suppliers
      try {
        const suppliersRes = await api.get('/api/suppliers/', {
          params: { top: true, limit: 6 }
        });
        const rawSuppliers = suppliersRes.data?.results || suppliersRes.data || [];
        suppliersData = Array.isArray(rawSuppliers) ? rawSuppliers : [];
      } catch (err) {
        console.warn('Suppliers API error, using mock data:', err.message);
        suppliersData = mockSuppliers;
      }

      // Fetch categories
      try {
        const categoriesRes = await api.get('/api/marketplace/categories/');
        const rawCategories = categoriesRes.data?.results || categoriesRes.data || [];
        categoriesData = Array.isArray(rawCategories) ? rawCategories : [];
      } catch (err) {
        console.warn('Categories API error, using mock data:', err.message);
        categoriesData = mockCategories;
      }

      // Fetch stats
      try {
        const statsRes = await api.get('/api/stats/');
        statsData = statsRes.data || {};
      } catch (err) {
        console.warn('Stats API error, using default values:', err.message);
        statsData = {
          total_products: productsData.length || 1247,
          total_suppliers: suppliersData.length || 356,
          total_orders: 8921,
          total_users: 2456
        };
      }

      // Set state with data (or fallback to mock)
      setFeaturedProducts(productsData.length > 0 ? productsData : mockProducts);
      setTopSuppliers(suppliersData.length > 0 ? suppliersData : mockSuppliers);
      setCategories(categoriesData.length > 0 ? categoriesData : mockCategories);
      setStats({
        totalProducts: statsData.total_products || statsData.totalProducts || 1247,
        totalSuppliers: statsData.total_suppliers || statsData.totalSuppliers || 356,
        totalOrders: statsData.total_orders || statsData.totalOrders || 8921,
        totalUsers: statsData.total_users || statsData.totalUsers || 2456
      });
      
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      // Use all mock data
      setFeaturedProducts(mockProducts);
      setTopSuppliers(mockSuppliers);
      setCategories(mockCategories);
      setStats({
        totalProducts: 1247,
        totalSuppliers: 356,
        totalOrders: 8921,
        totalUsers: 2456
      });
    } finally {
      setLoading(false);
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

  // Quick links for navigation
  const quickLinks = [
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag, color: 'primary' },
    { label: 'Messages', path: '/messages', icon: MessageCircle, color: 'secondary' },
    { label: 'Orders', path: '/orders', icon: Package, color: 'emerald' },
    { label: 'Suppliers', path: '/suppliers', icon: Building, color: 'purple' },
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3, color: 'blue' },
    { label: 'TradeSpace Express', path: '/tse', icon: Truck, color: 'orange' },
  ];

  // Features
  const features = [
    {
      icon: Shield,
      title: 'TradeSpace Verified™',
      description: 'All suppliers and products are verified for quality and authenticity.',
      color: 'primary'
    },
    {
      icon: Truck,
      title: 'TradeSpace Express',
      description: 'Fast, tracked delivery across Africa with real-time shipping updates.',
      color: 'secondary'
    },
    {
      icon: Star,
      title: 'Quality Assurance',
      description: 'Curated products from trusted suppliers with verified reviews.',
      color: 'amber'
    },
    {
      icon: Users,
      title: 'B2B Network',
      description: 'Connect with thousands of businesses across the continent.',
      color: 'emerald'
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'Protected payments and dispute resolution for peace of mind.',
      color: 'blue'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated support team to help you every step of the way.',
      color: 'purple'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mwangi',
      company: 'GreenEnergy Solutions',
      avatar: 'S',
      rating: 5,
      text: 'TradespaceX has transformed how we source our products. The verification system gives us confidence in every transaction.'
    },
    {
      id: 2,
      name: 'James Ochieng',
      company: 'AgriTech Ventures',
      avatar: 'J',
      rating: 5,
      text: 'The TradeSpace Express shipping has been a game-changer for our business. We can now deliver to our customers faster than ever.'
    },
    {
      id: 3,
      name: 'Mary Akinyi',
      company: 'BlueWave Logistics',
      avatar: 'M',
      rating: 4,
      text: 'I love how easy it is to connect with suppliers. The messaging system makes communication seamless.'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading TradespaceX...</p>
          <p className="text-sm text-slate-400 mt-1">Your trade ecosystem is coming together</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        {/* ====== HERO SECTION ====== */}
        <section className="hero-section relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern-light -z-10" style={{ opacity: 0.05 }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="relative text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/90 rounded-full border border-slate-200 mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">The Complete Trade Ecosystem for Africa</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Trade Smarter,{' '}
                <span className="bg-gradient-to-r from-primary-300 via-secondary-300 to-pink-300 bg-clip-text text-transparent">
                  Grow Faster
                </span>
              </h1>
              
              <p className="mt-4 text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto">
                From discovery to delivery, manage your entire B2B trade journey on a single, trusted platform.
                Connect with verified suppliers, list your products, and grow your business across Africa.
              </p>
              
              {/* Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for products, suppliers, or categories..."
                      className="w-full pl-12 pr-4 py-4 text-slate-800 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          navigate(`/marketplace?search=${encodeURIComponent(e.target.value)}`);
                        }
                      }}
                    />
                  </div>
                  <Link
                    to="/marketplace"
                    className="px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all"
                  >
                    Search
                  </Link>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalProducts.toLocaleString()}</p>
                  <p className="text-sm text-slate-200/80">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalSuppliers.toLocaleString()}</p>
                  <p className="text-sm text-slate-200/80">Suppliers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalOrders.toLocaleString()}</p>
                  <p className="text-sm text-slate-200/80">Orders Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-slate-200/80">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== QUICK LINKS ====== */}
        <section className="py-8 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const colorClasses = {
                  primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
                  secondary: 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100',
                  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                };
                
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 ${colorClasses[link.color]}`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium mt-1.5">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====== FEATURED PRODUCTS ====== */}
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">Featured Products</h2>
                <p className="text-slate-500 text-sm mt-1">Handpicked products from verified suppliers</p>
              </div>
              <Link to="/marketplace" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url || product.images[0].image_url || placeholderImageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholderImageUrl;
                        }}
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
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500">{product.rating || 0}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{product.supplier?.business_name || 'Supplier'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ====== FEATURES ====== */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-ink">Why Choose TradespaceX?</h2>
              <p className="text-slate-500 mt-2">Built for African businesses, by African businesses</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                const colorMap = {
                  primary: 'bg-primary-50 text-primary-600',
                  secondary: 'bg-secondary-50 text-secondary-600',
                  amber: 'bg-amber-50 text-amber-600',
                  emerald: 'bg-emerald-50 text-emerald-600',
                  blue: 'bg-blue-50 text-blue-600',
                  purple: 'bg-purple-50 text-purple-600'
                };
                
                return (
                  <div key={feature.title} className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-ink">{feature.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====== TOP SUPPLIERS ====== */}
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">Top Suppliers</h2>
                <p className="text-slate-500 text-sm mt-1">Verified and trusted businesses</p>
              </div>
              <Link to="/suppliers" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSuppliers.slice(0, 6).map((supplier) => (
                <Link
                  key={supplier.id}
                  to={`/suppliers/${supplier.id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {supplier.business_name?.charAt(0) || supplier.full_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-ink truncate">{supplier.business_name || supplier.full_name || 'Supplier'}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{supplier.location || 'Kenya'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {supplier.rating || 'New'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{supplier.total_products || 0} products</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CATEGORIES ====== */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">Browse Categories</h2>
                <p className="text-slate-500 text-sm mt-1">Find products by category</p>
              </div>
              <Link to="/categories" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="group flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-primary-50 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-4xl mb-2">{category.icon || '📦'}</span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600 text-center">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ====== TESTIMONIALS ====== */}
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-ink">What Our Users Say</h2>
              <p className="text-slate-500 mt-2">Real stories from real businesses</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= testimonial.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CTA SECTION ====== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800">
          <div className="absolute inset-0 bg-grid-pattern-light opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Transform Your Trade?</h2>
            <p className="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
              Join thousands of businesses already using TradespaceX to source, sell, and ship across Africa.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/marketplace" : "/register"}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-slate-50 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                {isAuthenticated ? 'Explore Marketplace' : 'Get Started Free'}
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
            
            <p className="mt-6 text-white/50 text-sm">
              No credit card required · Free to join · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}