import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

const initialState = {
  user: null,
  token: localStorage.getItem('cp_token') || null,
  loading: true,
  error: null,
};

const AuthContext = createContext();

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'AUTH_FAIL':
      return { ...state, user: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, check if token exists and validate
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('cp_token');
      if (!token) {
        dispatch({ type: 'AUTH_FAIL', payload: null });
        return;
      }
      try {
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: res.data.data, token } });
      } catch {
        localStorage.removeItem('cp_token');
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };
    checkAuth();
  }, []);

  const register = async (formData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await axios.post(`${API}/register`, formData);
      localStorage.setItem('cp_token', res.data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: res.data.data, token: res.data.token } });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: msg });
      return { success: false, message: msg };
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      localStorage.setItem('cp_token', res.data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: res.data.data, token: res.data.token } });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: msg });
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('cp_token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
