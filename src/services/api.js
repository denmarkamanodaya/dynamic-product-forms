import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
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
    list: () => apiClient.get('/user/v1/list'),
    create: (data) => apiClient.post('/user/v1/create', data),
    login: (data) => apiClient.post('/user/v1/login', data),
};

export const PostService = {
    list: () => apiClient.get('/post/v1/list'),
    create: (data) => apiClient.post('/post/v1/create', data),
    createComment: (data) => apiClient.post('/post/v1/comment/create', data),
    listComments: (postId) => apiClient.get('/post/v1/comment/list', { params: { postId } }),
};

export const ReportService = {
    topProducts: () => apiClient.get('/reports/v1/top-products'),
};

export const ArchiverService = {
    archive: (type, age) => apiClient.post('/automation/v1/archiver', { type, age }),

    archiveAll: async (age) => {
        const types = ['CASE', 'HISTORY', 'POST'];
        const results = await Promise.allSettled(
            types.map(type => ArchiverService.archive(type, age))
        );

        return results.map((result, index) => ({
            type: types[index],
            status: result.status,
            value: result.status === 'fulfilled' ? result.value : result.reason
        }));
    }
};

export default apiClient;
