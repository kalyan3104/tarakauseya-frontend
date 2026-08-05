const API_BASE = '/api';

const TOKEN_KEY = 'tara_kauseya_access_token';
const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function request(path, options = /** @type {any} */ ({})) {
  const { method = 'GET', body, headers } = options;
  const fetchOptions = {
    method,
    headers: {
      ...jsonHeaders,
      ...headers,
    },
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) fetchOptions.headers.Authorization = `Bearer ${token}`;

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
      delete fetchOptions.headers['Content-Type'];
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const body = JSON.parse(errorText);
      message = body.error || body.message || errorText;
    } catch {
      // Some proxies return plain-text error responses.
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

const buildEntityClient = (entityName) => {
  const singular = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const resourcePath = `/entities/${entityName}`;

  return {
    list: async (sort = '-created_date', limit = 100) => {
      const result = await request(`${resourcePath}?sort=${encodeURIComponent(sort)}&limit=${limit}`);
      return Array.isArray(result) ? result : [];
    },
    filter: async (query = {}, sort = '-created_date', limit = 100) => {
      const result = await request(`${resourcePath}/filter`, {
        method: 'POST',
        body: { query, sort, limit },
      });
      return Array.isArray(result) ? result : [];
    },
    create: async (payload) => request(resourcePath, { method: 'POST', body: payload }),
    update: async (id, payload) => request(`${resourcePath}/${id}`, { method: 'PATCH', body: payload }),
    delete: async (id) => request(`${resourcePath}/${id}`, { method: 'DELETE' }),
    bulkCreate: async (records) => request(`${resourcePath}/bulk`, { method: 'POST', body: records }),
  };
};

const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      if (!file) throw new Error('No file provided');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/integrations/core/upload-file`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
  },
};

const auth = {
  me: async () => request('/auth/me'),
  register: async (payload) => request('/auth/register', { method: 'POST', body: payload }),
  verifyOtp: async (payload) => request('/auth/verify-otp', { method: 'POST', body: payload }),
  resendOtp: async (email) => request('/auth/resend-otp', { method: 'POST', body: { email } }),
  loginViaEmailPassword: async (email, password) => {
    const result = await request('/auth/login', { method: 'POST', body: { email, password } });
    if (result?.access_token) localStorage.setItem(TOKEN_KEY, result.access_token);
    return result;
  },
  resetPasswordRequest: async (email) => request('/auth/reset-password-request', { method: 'POST', body: { email } }),
  resetPassword: async ({ resetToken, newPassword }) => request('/auth/reset-password', { method: 'POST', body: { resetToken, newPassword } }),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  logout: async () => {
    try { await request('/auth/logout', { method: 'POST' }); } finally { localStorage.removeItem(TOKEN_KEY); }
  },
  redirectToLogin: () => {
    window.location.href = '/login';
  },
  loginWithProvider: (..._args) => { throw new Error('Google sign-in is not configured yet. Please use email and password.'); },
};

export const base44 = {
  entities: {
    Product: buildEntityClient('products'),
    Collection: buildEntityClient('collections'),
    Inventory: buildEntityClient('inventory'),
    MediaAsset: buildEntityClient('media-assets'),
    TrialRequest: buildEntityClient('trial-requests'),
    ServiceArea: buildEntityClient('service-areas'),
    InventoryLog: buildEntityClient('inventory-logs'),
  },
  integrations,
  auth,
  functions: {
    invoke: async (name, body) => ({ data: await request(`/functions/${encodeURIComponent(name)}`, { method: 'POST', body }) }),
  },
};
