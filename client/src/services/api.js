import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const staffToken = localStorage.getItem('staff_token');
  const studentToken = localStorage.getItem('student_token');
  const token = staffToken || studentToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('student_token');
    }
    return Promise.reject(err);
  }
);

// ── Queue ──────────────────────────────────────────────
export const queueAPI = {
  getAll:           (params) => api.get('/queue', { params }),
  getStats:         ()       => api.get('/queue/stats'),
  getStudentQueues: (id)     => api.get(`/queue/student/${id}`),
  create:           (data)   => api.post('/queue', data),
  callNext:         ()       => api.put('/queue/next'),
  markDone:         (id)     => api.put(`/queue/done/${id}`),
  skip:             (id)     => api.put(`/queue/skip/${id}`),
  cancel:           (id)     => api.put(`/queue/cancel/${id}`),
  reset:            ()       => api.delete('/queue/reset'),
};

// ── Auth ───────────────────────────────────────────────
export const authAPI = {
  staffLogin:      (data) => api.post('/auth/login', data),
  studentLogin:    (data) => api.post('/auth/student/login', data),
  studentRegister: (data) => api.post('/auth/student/register', data),
};

// ── Reservations ───────────────────────────────────────
export const reservationAPI = {
  getAll:       (params)       => api.get('/reservations', { params }),
  getById:      (id)           => api.get(`/reservations/${id}`),
  updateStatus: (id, status)   => api.put(`/reservations/${id}/status`, { status }),
  getTodayCount:()             => api.get('/reservations/count/today'),
};

// ── Transactions ───────────────────────────────────────
export const transactionAPI = {
  getAll:   (params)   => api.get('/transactions', { params }),
  getStats: ()         => api.get('/transactions/stats'),
  create:   (data)     => api.post('/transactions', data),
  update:   (id, data) => api.put(`/transactions/${id}`, data),
  delete:   (id)       => api.delete(`/transactions/${id}`),
};

// ── Verifications ──────────────────────────────────────
export const verificationAPI = {
  getAll:          (params) => api.get('/verifications', { params }),
  getPendingCount: ()       => api.get('/verifications/pending/count'),
  getById:         (id)     => api.get(`/verifications/${id}`),
  verify:          (id)     => api.put(`/verifications/${id}/verify`),
  reject:          (id)     => api.put(`/verifications/${id}/reject`),
  submit:          (data)   => api.post('/verifications', data),
};

// ── Schedules ──────────────────────────────────────────
export const scheduleAPI = {
  getToday: ()          => api.get('/schedules'),
  create:   (data)      => api.post('/schedules', data),
  update:   (id, data)  => api.put(`/schedules/${id}`, data),
  delete:   (id)        => api.delete(`/schedules/${id}`),
};

// ── Reports ────────────────────────────────────────────
export const reportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
};

// ── Students ───────────────────────────────────────────
export const studentAPI = {
  getProfile:      (id)       => api.get(`/students/${id}`),
  updateProfile:   (id, data) => api.put(`/students/${id}`, data),
  changePassword:  (id, data) => api.put(`/students/${id}/change-password`, data),
  getTransactions: (id)       => api.get(`/students/${id}/transactions`),
};

export default api;