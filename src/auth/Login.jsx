import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BASE_URL from '../config/Config'; // Adjust the path based on your config file location
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (token && isLoggedIn === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password: password.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;

      if (data.success && data.data && data.data.token) {
        // Store authentication data in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', data.data.Email);
        localStorage.setItem('userName', data.data.Username);
        localStorage.setItem('userRole', data.data.RoleName);
        localStorage.setItem('userId', data.data._id);
        localStorage.setItem('userRoleId', data.data.RoleID._id);

        // Store additional user data
        localStorage.setItem('userData', JSON.stringify(data.data));

        //Store employee data
        // localStorage.setItem("employeeId", response.data.employee._id);
        if (response.data.employee?._id) {
          localStorage.setItem("employeeId", response.data.employee._id);
        }

        // Set success message
        setSuccess('Login successful! Redirecting...');

        // Redirect to home page after a brief delay
        setTimeout(() => {
          navigate('/');
        }, 1000);

      } else {
        setError(data.message || 'Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);

      // Handle different types of errors
      if (err.response) {
        // Server responded with an error status (4xx, 5xx)
        const errorMessage = err.response.data?.message ||
          err.response.data?.error ||
          'Login failed. Please check your credentials and try again.';
        setError(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something else happened
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality will be implemented soon. Please contact system administrator.');
  };

  // Function to handle Enter key press for login
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl flex overflow-hidden shadow-2xl">

        {/* Left Column - Login Form */}
        <div className="w-full md:w-1/2 p-10 text-gray-800">
          <h2 className="text-2xl font-semibold mb-2">
            Login to Account
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Don't have an account?{" "}
            <Link to="/registration" className="text-orange-600 cursor-pointer font-medium hover:underline">
              Create Account
            </Link>
          </p>

          {/* Google Sign In Button (Optional) */}
          <button
            type="button"
            className="w-full bg-white text-gray-700 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 mb-6 text-sm font-medium hover:bg-gray-50 transition"
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-4 h-4"
            />
            Sign in with Google
          </button>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Email address"
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none mb-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              required
            />

            {/* Password Input */}
            <div className="relative mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Password"
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Forgot?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-orange-400' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'} transition rounded-md py-2 font-semibold text-sm mb-4 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Terms & Privacy */}
          <p className="text-xs text-gray-500 mt-8 text-center">
            By logging in, you agree to Suyash Enterprises's{" "}
            <span className="text-orange-600 font-medium">Privacy Policy</span> and{" "}
            <span className="text-orange-600 font-medium">Terms of Service</span>.
          </p>
        </div>

        {/* Right Column - Branding/Info */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-8">
          <div className="text-center max-w-md">
            {/* Dashboard Preview */}
            <div className="mb-8">
              <div className="w-full h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-100 border border-amber-200 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-4 gap-4 h-full p-4">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-amber-400 rounded"></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-48 h-32 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-300 p-4 shadow-sm">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-4 bg-amber-400/60 rounded"></div>
                        <div className="h-4 bg-amber-300/50 rounded"></div>
                        <div className="h-4 bg-orange-400/70 rounded"></div>
                        <div className="h-4 bg-amber-200/40 rounded"></div>
                        <div className="h-4 bg-orange-500/80 rounded"></div>
                        <div className="h-4 bg-amber-400/60 rounded"></div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <div className="w-8 h-2 bg-amber-600/50 rounded"></div>
                        <div className="w-8 h-2 bg-amber-600/50 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Enterprise Dashboard
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Access comprehensive business insights, manage operations, and drive growth with our advanced management system.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-200">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Secure & Encrypted Access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-200">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-200">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Complete Business Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;