// API configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || localStorage.getItem('auth_token') || '';

// Helper function to make authenticated API calls
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized - token might be invalid
    localStorage.removeItem('auth_token');
    window.location.reload();
  }

  return response;
}

export default apiCall;

// Helper to set auth token
export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
  window.location.reload();
}

// Helper to check if authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('auth_token');
}
