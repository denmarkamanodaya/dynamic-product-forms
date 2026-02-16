import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export const CaseService = {
    list: (params) => apiClient.get('/case/v1/list', { params }),
    get: (id) => apiClient.get('/case/v1/get', { params: { id } }),
    create: (data) => apiClient.post('/case/v1/create', data),
    updateStatus: (data) => apiClient.put('/case/v1/status-update', data),
    deleteOld: () => apiClient.delete('/case/v1/delete-old'),
};

export const ClientService = {
    list: () => apiClient.get('/client/v1/list'),
    create: (data) => apiClient.post('/client/v1/create', data),
};

export const HistoryService = {
    list: () => apiClient.get('/history/v1/list'),
    getByCaseId: (caseId) => apiClient.get(`/history/v1/${caseId}`),
};

export const UserService = {
    create: (data) => apiClient.post('/user/v1/create', data),
    login: (data) => apiClient.post('/user/v1/login', data),
};

export const PostService = {
    list: () => apiClient.get('/post/v1/list'),
    create: (data) => apiClient.post('/post/v1/create', data),
};

export const ReportService = {
    topProducts: () => apiClient.get('/reports/v1/top-products'),
};

export default apiClient;
