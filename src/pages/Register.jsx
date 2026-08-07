import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Phone
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'buyer',
    businessName: '',
    phone: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectAccountType = (type) => {
    setFormData(prev => ({ ...prev, accountType: type }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }
    
    if (formData.accountType === 'supplier' && !formData.businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare registration data - try different field name variations
      const registrationData = {
        // Try with underscores (common Django/DRF format)
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        account_type: formData.accountType,
        ...(formData.accountType === 'supplier' && formData.businessName && {
          business_name: formData.businessName
        }),
        ...(formData.phone && { phone: formData.phone })
      };
      
      console.log('📤 Sending registration data:', registrationData);
      
      const result = await register(registrationData);
      
      console.log('📥 Registration result:', result);
      
      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setStep(3);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle field-specific errors
        if (result.data && typeof result.data === 'object') {
          const errors = {};
          let errorMessage = '';
          
          Object.entries(result.data).forEach(([field, value]) => {
            if (Array.isArray(value)) {
              errors[field] = value.join(', ');
              errorMessage += `${field}: ${value.join(', ')}\n`;
            } else if (typeof value === 'string') {
              errors[field] = value;
              errorMessage += `${field}: ${value}\n`;
            }
          });
          
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError(errorMessage || result.error || 'Please fix the errors below');
          } else {
            setError(result.error || 'Registration failed. Please try again.');
          }
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl blur opacity-50"></div>
              <div className="relative bg-white rounded-xl p-2 shadow-lg">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TradespaceX
            </span>
          </Link>
          <p className="text-slate-500 mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          
          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s === step
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : s < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 mx-1 ${
                    s < step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold text-ink">Choose Account Type</h3>
              <p className="text-center text-sm text-slate-500">Select how you want to use TradespaceX</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => selectAccountType('buyer')}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 transition-all group text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                    <ShoppingBag className="w-7 h-7 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-ink">Buyer</h4>
                  <p className="text-xs text-slate-500 mt-1">Find products & suppliers</p>
                </button>
                
                <button
                  onClick={() => selectAccountType('supplier')}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-secondary-400 hover:bg-secondary-50/30 transition-all group text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-secondary-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary-100 transition-colors">
                    <Building className="w-7 h-7 text-secondary-600" />
                  </div>
                  <h4 className="font-semibold text-ink">Supplier</h4>
                  <p className="text-xs text-slate-500 mt-1">Sell products & grow</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Account Type</span>
                <span className="flex items-center gap-1.5 text-sm font-medium capitalize">
                  {formData.accountType === 'buyer' ? (
                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Building className="w-4 h-4 text-secondary-600" />
                  )}
                  {formData.accountType}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Change
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      fieldErrors.full_name ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.full_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Business Name (Supplier only) */}
              {formData.accountType === 'supplier' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                        fieldErrors.business_name ? 'border-red-500' : 'border-slate-200'
                      } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                      placeholder="Your Business Name"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.business_name && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.business_name}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      fieldErrors.email ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={20}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      fieldErrors.phone ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="+254 700 000 000"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border ${
                      fieldErrors.password ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border ${
                      fieldErrors.confirm_password ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm_password}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-1"
                  disabled={loading}
                />
                <label className="text-sm text-slate-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-ink">Account Created! 🎉</h3>
              <p className="text-slate-500 mt-2">
                Your account has been successfully created. You'll be redirected to login shortly.
              </p>
              <div className="mt-4">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" />
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Redirecting to login...
              </p>
            </div>
          )}

          {/* Login Link */}
          {step < 3 && (
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
