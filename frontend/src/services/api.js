import axios from 'axios';

// API base URL is environment-driven so the same build works across
// local dev, staging, and production. Falls back to local backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Delete Content-Type for FormData so Axios and browser set multipart/form-data with proper boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and automatic cold-start retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Auto-retry transient cold-start / gateway errors once for GET requests
    const isGet = (config?.method || 'get').toLowerCase() === 'get';
    const isColdStartError =
      !error.response || [502, 503, 504].includes(error.response?.status);

    if (config && !config._retry && isGet && isColdStartError) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return api(config);
    }

    // Only force a logout/redirect when a 401 comes from an authenticated
    // request (i.e. an expired/invalid session). A 401 from the login or
    // register call is a failed attempt and must surface to the form so it
    // can show "Invalid email or password" instead of silently reloading.
    const requestUrl = config?.url || '';
    const isAuthAttempt =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Liveness APIs
export const livenessAPI = {
  // Ask the server for a single-use head-turn challenge. The server decides the
  // direction and verifies afterwards that the head really moved that way, so
  // the client cannot simply assert it passed.
  getChallenge: () => api.post('/liveness/challenge'),
};

// Face APIs
export const faceAPI = {
  registerFace: (files, challengeId = null) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (challengeId) {
      formData.append('challenge_id', challengeId);
    }
    return api.post('/face/register', formData);
  },
  registerFaceUpload: (files) => {
    const formData = new FormData();
    const imageList = Array.isArray(files) ? files : [files];
    imageList.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/face/register-upload', formData);
  },
};

// Attendance APIs
export const attendanceAPI = {
  markAttendance: (imageFiles, livenessVerified = false, challengeId = null) => {
    const formData = new FormData();
    // Accept a single File or an array of Files (multi-frame voting).
    const frames = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    frames.forEach((f) => formData.append('files', f));
    formData.append('liveness_verified', livenessVerified ? 'true' : 'false');
    if (challengeId) {
      formData.append('challenge_id', challengeId);
    }
    return api.post('/attendance/mark', formData);
  },
  markAttendanceUpload: (imageFiles, subjectCode = null, period = null) => {
    const formData = new FormData();
    const frames = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    frames.forEach((f) => formData.append('files', f));
    if (subjectCode) {
      formData.append('subject_code', subjectCode);
    }
    if (period !== null && period !== undefined) {
      formData.append('period', period);
    }
    return api.post('/attendance/mark-upload', formData);
  },
  getAttendanceRecords: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    
    return api.get(`/admin/attendance?${queryParams}`);
  },
  getUserAttendance: (userId) => {
    return api.get('/user/attendance');
  },
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  changePassword: (passwordData) => api.post('/user/change-password', passwordData),
  getAttendance: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    
    return api.get(`/user/attendance?${queryParams}`);
  },
  getAttendanceStats: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    
    return api.get(`/user/attendance/stats?${queryParams}`);
  },
  getTodayAttendance: () => {
    // Use the browser's LOCAL date (not UTC) so it matches the organization
    // timezone the backend records attendance in.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return api.get(`/user/attendance?start_date=${today}&end_date=${today}`);
  },
  getRegisteredFaces: () => api.get('/user/face/images'),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (userId) => api.delete(`/admin/user/${userId}`),
  markAbsentUsers: () => api.post('/admin/mark-absent'),
  updateAttendanceRecord: (record) => {
    const formData = new FormData();
    formData.append('status', record.status);
    if (record.time_in) {
      formData.append('time_in', record.time_in);
    }
    return api.put(`/admin/attendance/${record.id}`, formData);
  },
  bulkUpdateAttendance: (data) => {
    const formData = new FormData();
    data.record_ids.forEach(id => formData.append('record_ids', id));
    formData.append('status', data.status);
    if (data.time_in) {
      formData.append('time_in', data.time_in);
    }
    return api.post('/admin/attendance/bulk-update', formData);
  },
  markUserPresent: (userId, timeIn = null) => {
    const formData = new FormData();
    if (timeIn) {
      formData.append('time_in', timeIn);
    }
    return api.post(`/admin/attendance/mark-present/${userId}`, formData);
  },
  exportAttendance: (params) => api.get('/admin/attendance/export', { params }),
  
  // Face Management
  getUsersFaceStatus: () => api.get('/admin/users/face-status'),
  deleteUserFaceData: (userId) => api.delete(`/admin/user/${userId}/face`),
  registerUserFace: (userId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post(`/admin/user/${userId}/face/register`, formData);
  },
  getUserFaceDetails: (userId) => api.get(`/admin/user/${userId}/face/details`),
  getUserFaceImages: (userId) => api.get(`/admin/user/${userId}/face/images`),
  bulkDeleteFaceData: (userIds) => {
    const formData = new FormData();
    userIds.forEach(id => formData.append('user_ids', id));
    return api.post('/admin/faces/bulk-delete', formData);
  },

  // Cryptography Lab & Security Center APIs (VTU BCS703)
  cryptoEncrypt: (data) => api.post('/admin/crypto/encrypt', data),
  cryptoDecrypt: (data) => api.post('/admin/crypto/decrypt', data),
  cryptoHash: (data) => api.post('/admin/crypto/hash', data),
  cryptoVerifyIntegrity: (data) => api.post('/admin/crypto/verify-integrity', data),
  cryptoTamperTest: (data) => api.post('/admin/crypto/tamper-test', data),
  getSecurityStatus: () => api.get('/admin/security/status'),
  getSecurityLogs: () => api.get('/admin/security/logs'),

  // Students Management & Academic APIs
  getStudents: (params = {}) => {
    const q = new URLSearchParams();
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        q.append(k, params[k]);
      }
    });
    return api.get(`/admin/students?${q.toString()}`);
  },
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (studentId, data) => api.put(`/admin/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
  getStudentDetails: (studentId) => api.get(`/admin/students/${studentId}/details`),
  verifyStudentBiometric: (studentId) => api.post(`/admin/students/${studentId}/verify-biometric`),
  decryptStudentBiometric: (studentId) => api.post(`/admin/students/${studentId}/decrypt-biometric`),
  getAcademicOptions: () => api.get('/admin/academic-options'),
  getSubjects: (params = {}) => api.get('/admin/subjects', { params }),
  createSubject: (data) => api.post('/admin/subjects', data),
  recordStudentAttendance: (studentId, data) => api.post(`/admin/students/${studentId}/attendance/record`, data),
  seedMultiPeriodAttendance: (studentId) => api.post(`/admin/students/${studentId}/attendance/seed-multi-period`),
};

// Admin Cryptography Lab APIs (Live Inspection & Verification)
export const cryptoLabAPI = {
  getOverview: () => api.get('/admin/cryptography/overview'),
  getUsers: () => api.get('/admin/cryptography/users'),
  getUserDetails: (userId) => api.get(`/admin/cryptography/users/${userId}`),
  verifyIntegrity: (userId) => api.post(`/admin/cryptography/users/${userId}/verify-integrity`),
  getUserImageUrl: (userId, imageId) => `${API_BASE_URL}/admin/cryptography/users/${userId}/image/${imageId}`,
  getOperations: (limit = 50) => api.get(`/admin/cryptography/operations?limit=${limit}`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (period = 'week') => api.get(`/analytics/dashboard?period=${period}`),
  exportData: (format = 'json', period = 'week') => 
    api.get(`/analytics/export?format=${format}&period=${period}`),
  getAutomatedReport: (reportType = 'weekly') => 
    api.get(`/analytics/reports/automated?report_type=${reportType}`),
  getAnomalies: (days = 7, severity = 'all') => 
    api.get(`/analytics/anomalies?days=${days}&severity=${severity}`),
};

// Utility function to convert webcam capture to file with client-side optimization
export const webcamCaptureToFile = (imageSrc, filename = 'webcam-capture.jpg') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 640;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], filename, { type: 'image/jpeg' }));
          } else {
            fetch(imageSrc)
              .then((res) => res.blob())
              .then((b) => resolve(new File([b], filename, { type: 'image/jpeg' })))
              .catch(reject);
          }
        },
        'image/jpeg',
        0.82
      );
    };
    img.onerror = () => {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((b) => resolve(new File([b], filename, { type: 'image/jpeg' })))
        .catch(reject);
    };
    img.src = imageSrc;
  });
};

export default api; 