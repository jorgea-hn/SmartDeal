// Necessary imports for the component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);
export const authService = {
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('Searching for user:', email);
      
      // Get all users and filter manually
      const allUsersResponse = await api.get('/users');
      const allUsers = allUsersResponse.data;
      console.log('All users:', allUsers);
      
      // Filter by email manually
      const users = allUsers.filter(user => user.email === email);
      console.log('Filtered users:', users);
      
      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

      const token = this.generateSimpleToken(user);
      
      const authData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: token,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('authData', JSON.stringify(authData));

      return {
        success: true,
        data: authData,
        message: 'Successful login'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    }
  },

  generateSimpleToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(payload));
  },

  isAuthenticated() {
    const authData = localStorage.getItem('authData');
    if (!authData) return false;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.token && parsed.user;
    } catch {
      return false;
    }
  },

  getCurrentUser() {
    const authData = localStorage.getItem('authData');
    if (!authData) return null;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.user;
    } catch {
      return null;
    }
  },

  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === requiredRole;
  },

  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roles.includes(user.role);
  },

  logout() {
    localStorage.removeItem('authData');
    return { success: true, message: 'Session closed' };
  },

  getToken() {
    const authData = localStorage.getItem('authData');
    if (!authData) return null;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch {
      return null;
    }
  }
};

// Function to check if user is already logged in and redirect to appropriate route
export const checkAuthAndRedirect = (navigate) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    const user = authService.getCurrentUser();
    
    if (user && user.role) {
      switch (user.role) {
        case 'admin':
          navigate('/adminviews');
          return true;
        case 'user':
          navigate('/dashboard');
          return true;
        default:
          navigate('/dashboard');
          return true;
      }
    }
  }
  
  return false;
};

// Custom hook for React
export const useAuth = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    hasRole: authService.hasRole,
    hasAnyRole: authService.hasAnyRole,
    checkAuthAndRedirect: checkAuthAndRedirect
  };
};

// Login component adapted to your template
export default function Form() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkAuthAndRedirect(navigate);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const userRole = result.data.user.role;
        
        switch (userRole) {
          case 'admin':
            navigate('/adminviews');
            break;
          case 'user':
            navigate('/dashboard');
            break;
        
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Need an account?
            <br />
            <a href="/register" className="text-indigo-600 hover:text-indigo-500"> Sign up </a>
          </p>
        </div>
      </div>
    </>
  );
}

// Protected route component
export const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles.length > 0 && !authService.hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);