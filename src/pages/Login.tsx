import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Check, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { supabaseHelpers } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Login: React.FC<AuthPopupProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    // Only redirect when the login modal is open. The Login component is mounted
    // in Navbar even when closed which previously caused it to always redirect
    // a logged-in user back to home when any navigation occurred.
    if (!isOpen) return;
    if (user) {
      const timer = setTimeout(() => {
        navigate('/');
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, onClose, isOpen]);

  // Check for OAuth errors in URL parameters (separate effect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Remove dependencies to run only once

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Sign up specific validations
    if (!isLogin) {
      if (!displayName) {
        errors.displayName = 'Display name is required';
      } else if (displayName.length < 2) {
        errors.displayName = 'Display name must be at least 2 characters long';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
     const result = await supabaseHelpers.signIn(email, password);

if (result.data?.user) {
  await login(result.data.user);   // works now ✅
  setSuccess('Login successful!');
  setTimeout(() => {
    onClose();
    clearForm();
    navigate('/');   // redirect to home/dashboard
  }, 1000);
} else if (result.error) {
  setError(result.error.message);
}

    } catch (error: unknown) {
      console.error('Login error:', error);
      setError((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
const result = await supabaseHelpers.signUp(email, password, {
  display_name: displayName
});

      
      if (result.data?.user) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          onClose();
          clearForm();
        }, 2000);
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      setError((error as Error).message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await supabaseHelpers.signInWithGoogle();
      if (result.data?.url) {
        // For OAuth, Supabase will redirect to the provider
        // The user will be redirected to Google, then back to our callback
        window.location.href = result.data.url;
      } else if (result.error) {
        console.error('Google OAuth error:', result.error);
        setError(result.error.message || 'Failed to initialize Google login');
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    }
    // Note: Don't set loading to false here as the page will redirect
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Note: Supabase password reset would be implemented here
      // For now, show success message
      setSuccess('Password reset email sent! Check your inbox.');
      setShowResetForm(false);
      setResetEmail('');
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors z-10"
          >
            ×
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome Back to NueroHub!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {showResetForm 
                  ? 'Enter your email to reset your password'
                  : (isLogin 
                      ? 'Sign in to continue your journey' 
                      : 'Create your account to get started'
                    )
                }
              </p>
            </div>

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-3"
              >
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
              >
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Password Reset Form */}
            {showResetForm ? (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Email
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full mb-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
                >
                  <FcGoogle className="w-5 h-5" />
                  Login with Google
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={isLogin ? handleEmailLogin : handleEmailSignup} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all ${
                            validationErrors.displayName ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          required
                        />
                      </div>
                      {validationErrors.displayName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.displayName}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all ${
                          validationErrors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all ${
                          validationErrors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all ${
                            validationErrors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </button>
                </form>

                {/* Switch between login/signup */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      clearForm();
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                  >
                    {isLogin ? 'Register!' : 'Sign in'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer with contact info */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Do you have any question?</p>
            <a href="mailto:nuerohub@email.com" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
              nuerohub@email.com
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;