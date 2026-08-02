import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  RefreshCw,
  ArrowRight,
  XCircle
} from 'lucide-react';

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationEmail, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email') || user?.email || '';
  
  // State
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, verifying, verified, failed

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle email verification
  const handleVerify = async (verificationToken) => {
    setVerifying(true);
    setError('');
    setStatus('verifying');
    
    try {
      const result = await verifyEmail(verificationToken);
      
      if (result.success) {
        setSuccess(true);
        setStatus('verified');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Email verification failed');
        setStatus('failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setStatus('failed');
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  // Handle resend verification email
  const handleResend = async () => {
    if (!email) {
      setError('No email address provided. Please enter your email.');
      return;
    }
    
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    setResendSuccess(false);
    
    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setResendSuccess(true);
        setCountdown(60); // 60 second cooldown
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle manual email input for resend
  const [manualEmail, setManualEmail] = useState(email);

  // If user is already verified, redirect to dashboard
  if (isAuthenticated && user?.isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">Email Already Verified</h3>
          <p className="text-slate-500 text-sm mb-6">
            Your email has already been verified. You can continue to your dashboard.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-500 mt-2">Email Verification</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          
          {/* ===== VERIFYING STATE ===== */}
          {status === 'verifying' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Verifying Your Email</h3>
              <p className="text-slate-500 text-sm">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* ===== VERIFIED STATE ===== */}
          {status === 'verified' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Email Verified! 🎉</h3>
              <p className="text-slate-500 text-sm">
                Your email has been successfully verified.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Redirecting to dashboard...
              </p>
              <div className="mt-4">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" />
              </div>
            </div>
          )}

          {/* ===== FAILED STATE ===== */}
          {status === 'failed' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Verification Failed</h3>
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-left flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error || 'The verification link is invalid or has expired.'}</span>
              </div>
              
              {/* Resend Section */}
              <div className="text-left mt-4">
                <p className="text-sm text-slate-600 mb-3">
                  Request a new verification link:
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={resendLoading || countdown > 0}
                  />
                  <button
                    onClick={handleResend}
                    disabled={resendLoading || countdown > 0 || !manualEmail}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {resendLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Resend
                      </>
                    )}
                  </button>
                </div>
                
                {resendSuccess && (
                  <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verification email sent! Please check your inbox.
                  </p>
                )}
              </div>

              <Link 
                to="/login" 
                className="mt-6 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {/* ===== IDLE STATE (No token provided) ===== */}
          {status === 'idle' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Verify Your Email</h3>
              <p className="text-slate-500 text-sm">
                We've sent a verification link to your email address.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Please check your inbox and click the link to verify your account.
              </p>
              
              {/* Resend Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-3">
                  Didn't receive the email?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={resendLoading || countdown > 0}
                  />
                  <button
                    onClick={handleResend}
                    disabled={resendLoading || countdown > 0 || !manualEmail}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend Link
                      </>
                    )}
                  </button>
                </div>
                
                {error && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
                
                {resendSuccess && (
                  <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verification email sent! Please check your inbox.
                  </p>
                )}
              </div>

              <Link 
                to="/login" 
                className="mt-6 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need help?{' '}
          <Link to="/contact" className="text-primary-500 hover:text-primary-600 transition-colors">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}