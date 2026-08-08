import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Lock,
  Palette,
  Moon,
  Sun,
  Monitor,
  Mail,
  MessageCircle,
  ShoppingBag,
  Truck,
  Star,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  X,
  ChevronRight,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  LogOut,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  Calendar,
  FileText,
  CreditCard,
  Gift,
  Heart,
  Share2,
  Zap
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'en',
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    currency: 'KES'
  });
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    messages: true,
    promotions: false,
    marketingEmails: false,
    productAlerts: true,
    shipmentUpdates: true,
    reviewNotifications: true
  });
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showActivityStatus: true,
    allowMessages: true,
    allowReviews: true
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
    deviceManagement: true
  });
  
  // Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    theme: 'system', // light, dark, system
    compactView: false,
    reducedMotion: false,
    highContrast: false
  });

  // Load settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/settings/');
      const data = response.data;
      
      // Update settings from API response
      if (data.general) setGeneralSettings(data.general);
      if (data.notifications) setNotificationSettings(data.notifications);
      if (data.privacy) setPrivacySettings(data.privacy);
      if (data.security) setSecuritySettings(data.security);
      if (data.theme) setThemeSettings(data.theme);
      
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  // Save all settings
  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const settingsData = {
        general: generalSettings,
        notifications: notificationSettings,
        privacy: privacySettings,
        security: securitySettings,
        theme: themeSettings
      };
      
      await api.put('/api/settings/', settingsData);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle changes
  const handleToggle = (section, key) => {
    const setters = {
      general: setGeneralSettings,
      notifications: setNotificationSettings,
      privacy: setPrivacySettings,
      security: setSecuritySettings,
      theme: setThemeSettings
    };
    
    const setter = setters[section];
    if (!setter) return;
    
    setter(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle select changes
  const handleSelect = (section, key, value) => {
    const setters = {
      general: setGeneralSettings,
      notifications: setNotificationSettings,
      privacy: setPrivacySettings,
      security: setSecuritySettings,
      theme: setThemeSettings
    };
    
    const setter = setters[section];
    if (!setter) return;
    
    setter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      setError('Please enter your email to confirm');
      return;
    }
    
    setDeleting(true);
    try {
      await api.delete('/api/accounts/delete/');
      await logout();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account');
      console.error('Error deleting account:', err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'theme', label: 'Appearance', icon: Palette },
  ];

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading settings...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 w-full">
        
        {/* ====== HEADER ====== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-ink">Settings</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences</p>
            </div>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* ====== MESSAGES ====== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ====== TABS ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {tabs.map((tab) => {
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
            
            {/* ===== GENERAL TAB ===== */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-ink text-lg">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => handleSelect('general', 'language', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="fr">French</option>
                      <option value="pt">Portuguese</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => handleSelect('general', 'timezone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Date Format
                    </label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) => handleSelect('general', 'dateFormat', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => handleSelect('general', 'currency', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ===== NOTIFICATIONS TAB ===== */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink text-lg">Notification Preferences</h3>
                  <button
                    onClick={() => {
                      const allTrue = Object.values(notificationSettings).every(v => v === true);
                      const newSettings = {};
                      Object.keys(notificationSettings).forEach(key => {
                        newSettings[key] = !allTrue;
                      });
                      setNotificationSettings(newSettings);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {Object.values(notificationSettings).every(v => v === true) 
                      ? 'Deselect All' 
                      : 'Select All'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleToggle('notifications', 'emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Push Notifications</p>
                      <p className="text-sm text-slate-500">Receive push notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleToggle('notifications', 'pushNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-medium text-ink text-sm mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'orderUpdates', label: 'Order Updates', desc: 'Order confirmation, shipping, delivery' },
                      { key: 'messages', label: 'Messages', desc: 'New messages from buyers/suppliers' },
                      { key: 'productAlerts', label: 'Product Alerts', desc: 'Price drops, back in stock' },
                      { key: 'shipmentUpdates', label: 'Shipment Updates', desc: 'Tracking and delivery updates' },
                      { key: 'reviewNotifications', label: 'Reviews', desc: 'New reviews on your products' },
                      { key: 'promotions', label: 'Promotions', desc: 'Special offers and discounts' },
                      { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Newsletter and marketing content' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                        <div>
                          <p className="font-medium text-ink text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key]}
                            onChange={() => handleToggle('notifications', item.key)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== PRIVACY TAB ===== */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-ink text-lg">Privacy Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Profile Visibility
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handleSelect('privacy', 'profileVisibility', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="registered">Registered Users Only</option>
                    <option value="private">Private - Only connections</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Show Email</p>
                      <p className="text-sm text-slate-500">Display email on your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={() => handleToggle('privacy', 'showEmail')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Show Phone Number</p>
                      <p className="text-sm text-slate-500">Display phone on your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={() => handleToggle('privacy', 'showPhone')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Show Location</p>
                      <p className="text-sm text-slate-500">Display your location on profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showLocation}
                        onChange={() => handleToggle('privacy', 'showLocation')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Show Activity Status</p>
                      <p className="text-sm text-slate-500">Display when you're online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showActivityStatus}
                        onChange={() => handleToggle('privacy', 'showActivityStatus')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-medium text-ink text-sm mb-3">Communication Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-ink">Allow Messages</p>
                        <p className="text-sm text-slate-500">Allow other users to message you</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowMessages}
                          onChange={() => handleToggle('privacy', 'allowMessages')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-ink">Allow Reviews</p>
                        <p className="text-sm text-slate-500">Allow users to review your products</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowReviews}
                          onChange={() => handleToggle('privacy', 'allowReviews')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SECURITY TAB ===== */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-ink text-lg">Security Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={() => handleToggle('security', 'twoFactorAuth')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Login Alerts</p>
                      <p className="text-sm text-slate-500">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.loginAlerts}
                        onChange={() => handleToggle('security', 'loginAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Device Management</p>
                      <p className="text-sm text-slate-500">Manage devices logged into your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.deviceManagement}
                        onChange={() => handleToggle('security', 'deviceManagement')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSelect('security', 'sessionTimeout', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-medium text-ink text-sm mb-3">Password</h4>
                  <Link
                    to="/change-password"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-ink">Change Password</p>
                        <p className="text-sm text-slate-500">Update your password regularly</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                </div>
              </div>
            )}

            {/* ===== APPEARANCE TAB ===== */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-ink text-lg">Appearance Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isActive = themeSettings.theme === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect('theme', 'theme', option.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isActive 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-1 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                          <p className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-slate-600'}`}>
                            {option.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Compact View</p>
                      <p className="text-sm text-slate-500">Reduce spacing for more content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeSettings.compactView}
                        onChange={() => handleToggle('theme', 'compactView')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">Reduced Motion</p>
                      <p className="text-sm text-slate-500">Minimize animations and transitions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeSettings.reducedMotion}
                        onChange={() => handleToggle('theme', 'reducedMotion')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink">High Contrast</p>
                      <p className="text-sm text-slate-500">Increase color contrast for accessibility</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeSettings.highContrast}
                        onChange={() => handleToggle('theme', 'highContrast')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====== DANGER ZONE ====== */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Danger Zone</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              These actions are permanent and cannot be undone. Please proceed with caution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('Download your data? This may take a few moments.')) {
                    window.location.href = '/api/accounts/export-data/';
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* ====== DELETE ACCOUNT MODAL ====== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Delete Account</h3>
              <p className="text-slate-500 text-sm mb-4">
                Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, products, orders, and reviews will be permanently removed.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                <strong>Warning:</strong> This will delete all your data.
              </div>
              
              <div className="text-left mb-4">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Type <strong>{user?.email}</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirm !== user?.email}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}