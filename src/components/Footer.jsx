import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Heart,
  Truck,
  Package,
  ShoppingBag,
  Users,
  MessageCircle,
  Award,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
// Import social icons from react-icons
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Navigation links
  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Suppliers', path: '/suppliers' },
    { name: 'TradeSpace Express', path: '/tse' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const accountLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Orders', path: '/orders' },
        { name: 'My Products', path: '/products' },
        { name: 'Messages', path: '/messages' },
        { name: 'Profile', path: '/profile' },
        { name: 'Settings', path: '/settings' }
      ]
    : [
        { name: 'Sign In', path: '/login' },
        { name: 'Create Account', path: '/register' },
        { name: 'Forgot Password', path: '/forgot-password' }
      ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Return Policy', path: '/return-policy' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ];

  const quickLinks = [
    { name: 'Become a Supplier', path: '/supplier-register', icon: Users },
    { name: 'TradeSpace Verified', path: '/verification', icon: Shield },
    { name: 'Blog', path: '/blog', icon: Sparkles },
    { name: 'Partners', path: '/partners', icon: Award }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, url: 'https://facebook.com/tradespacex' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com/tradespacex' },
    { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com/tradespacex' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com/company/tradespacex' },
    { name: 'YouTube', icon: FaYoutube, url: 'https://youtube.com/tradespacex' }
  ];

  const contactInfo = [
    { icon: Phone, text: '+254 700 000 000', href: 'tel:+254700000000' },
    { icon: Mail, text: 'support@tradespacex.com', href: 'mailto:support@tradespacex.com' },
    { icon: MapPin, text: 'Nairobi, Kenya', href: '#' },
    { icon: Clock, text: '24/7 Support Available', href: '#' }
  ];

  return (
    <footer className="bg-slate-900 text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl blur opacity-50"></div>
                <div className="relative bg-white rounded-xl p-1.5 shadow-lg">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-white">TradespaceX</span>
            </Link>
            
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              The complete trade ecosystem for African businesses. From discovery to delivery, 
              on a single, trusted platform.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Main Links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Platform</h5>
            <ul className="space-y-2">
              {mainLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm hover:text-white transition-colors ${
                      location.pathname === link.path ? 'text-primary-400' : 'text-white/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Account</h5>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm hover:text-white transition-colors ${
                      location.pathname === link.path ? 'text-primary-400' : 'text-white/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Support</h5>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm hover:text-white transition-colors ${
                      location.pathname === link.path ? 'text-primary-400' : 'text-white/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Quick Links</h5>
            <ul className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`text-sm hover:text-white transition-colors flex items-center gap-1.5 ${
                        location.pathname === link.path ? 'text-primary-400' : 'text-white/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-all">
                  <Icon className="w-4 h-4 text-white/40 group-hover:text-primary-400 transition-colors" />
                </div>
                <span>{item.text}</span>
              </a>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} TradespaceX. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <span className="text-red-400">❤️</span>
              Made in Africa
            </span>
            <span className="w-px h-4 bg-white/10"></span>
            <span>v2.0.0</span>
            <span className="w-px h-4 bg-white/10"></span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}