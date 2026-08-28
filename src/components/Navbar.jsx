import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, Search, ShoppingCart, Bell, MessageCircle, 
  User, ChevronDown, Globe, Shield, Truck, Package,
  LogOut, Settings, LayoutDashboard, Store, PlusCircle,
  Home
} from 'lucide-react';
import './Navbar.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = 0;
  const unreadMessages = 0;

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // ============================================================
  // CORE NAVIGATION - Focused on B2B trading journey
  // ============================================================
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Marketplace', path: '/marketplace', icon: Store },
    { name: 'Suppliers', path: '/suppliers', icon: Globe },
    { name: 'Orders', path: '/orders', icon: Package },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
  ];

  // User menu items (logged in)
  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { divider: true },
    { name: 'Logout', path: '#', icon: LogOut, action: 'logout' },
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar scrolled' : 'navbar'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* ===== LEFT: Logo & Brand ===== */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1.5 shadow-lg">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    TradespaceX
                  </span>
                  <span className="ml-1 text-xs font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                    B2B Trade
                  </span>
                </div>
              </Link>
            </div>

            {/* ===== CENTER: Navigation Links ===== */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center gap-2 group
                      ${isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ===== RIGHT: Actions ===== */}
            <div className="flex items-center gap-2 md:gap-3">
              
              {/* Search Toggle (Mobile) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Bar (Desktop) */}
              <div className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, suppliers..."
                  className="w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <kbd className="absolute right-3 text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white">
                  ⌘K
                </kbd>
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-secondary-500 w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* ===== User Section ===== */}
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-primary-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                          {/* User Info */}
                          <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100">
                            <p className="font-semibold text-gray-900">{user?.full_name || user?.fullName || 'User'}</p>
                            <p className="text-sm text-gray-500">{user?.email || ''}</p>
                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3" />
                              {user?.account_type || user?.accountType || 'Member'}
                            </span>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            {userMenuItems.map((item, index) => {
                              if (item.divider) {
                                return <div key={index} className="border-t border-gray-100 my-1"></div>;
                              }
                              
                              const Icon = item.icon;
                              const isActive = location.pathname === item.path;
                              
                              if (item.action === 'logout') {
                                return (
                                  <button
                                    key={index}
                                    onClick={async () => {
                                      setIsUserMenuOpen(false);
                                      await logout();
                                      navigate('/login');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                  </button>
                                );
                              }
                              
                              return (
                                <Link
                                  key={index}
                                  to={item.path}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className={`
                                    flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                    ${isActive 
                                      ? 'text-primary-600 bg-primary-50' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span>{item.name}</span>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Quick Action: List Product (for suppliers) */}
                          {(user?.account_type === 'supplier' || user?.accountType === 'supplier') && (
                            <div className="border-t border-gray-100 p-2">
                              <Link
                                to="/products/new"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <PlusCircle className="w-4 h-4" />
                                List New Product
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                // ===== Not Logged In =====
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Collapsible) */}
        <div className={`
          lg:hidden px-4 pb-3 transition-all duration-300 overflow-hidden
          ${isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, suppliers..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus={isSearchOpen}
            />
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU (Slide-in) ===== */}
      <div className={`
        lg:hidden fixed inset-0 z-40 transition-all duration-300
        ${isMobileMenuOpen ? 'visible' : 'invisible'}
      `}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        
        {/* Menu Panel */}
        <div className={`
          absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Shield className="w-6 h-6 text-primary-600" />
                <span className="text-lg font-bold text-gray-900">TradespaceX</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 mb-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-50 text-primary-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Actions */}
            {user ? (
              <div className="border-t border-gray-100 pt-4 space-y-1">
                {userMenuItems.map((item, index) => {
                  if (item.divider) return <div key={index} className="border-t border-gray-100 my-2"></div>;
                  
                  const Icon = item.icon;
                  if (item.action === 'logout') {
                    return (
                      <button
                        key={index}
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg hover:shadow-lg transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Navigation;
