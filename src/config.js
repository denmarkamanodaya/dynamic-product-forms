const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const PRODUCT_API_URL = 'https://dummyjson.com/products?limit=100';

const endpoints = {
    caseList: `${API_BASE_URL}/case/v1/list`,
    caseGet: `${API_BASE_URL}/case/v1/get`,
    caseCreate: `${API_BASE_URL}/case/v1/create`,
    caseStatusUpdate: `${API_BASE_URL}/case/v1/status-update`,
    clientList: `${API_BASE_URL}/client/v1/list`,
    clientCreate: `${API_BASE_URL}/client/v1/create`,
    caseCompleted: `${API_BASE_URL}/case/v1/list?status=completed`,
    caseDeleted: `${API_BASE_URL}/case/v1/list?status=deleted`,
    topProducts: `${API_BASE_URL}/reports/v1/top-products`,
    historyList: `${API_BASE_URL}/history/v1/list`,
    userCreate: `${API_BASE_URL}/user/v1/create`,
    userLogin: `${API_BASE_URL}/user/v1/login`,
    createPost: `${API_BASE_URL}/post/v1/create`,
    listPosts: `${API_BASE_URL}/post/v1/list`,
    historyByCase: (caseId) => `${API_BASE_URL}/history/v1/${caseId}`,
    automationArchiver: `${API_BASE_URL}/automation/v1/archiver`,
};

const LOGIN_BACKGROUND_URL = 'https://firetron.ph/wp-content/uploads/2017/11/Firetron-banner_01.jpg';

const currencyConfig = {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    locale: 'en-PH'
};

const taxConfig = {
    vatRate: 0.12,
    vatLabel: 'VAT (12%)'
};

const LICENSE_KEY = "ewogICJuYW1lIjogIkZpcmV0cm9uIiwKICAidHlwZSI6ICJ0ZXN0IiwKICAibGltaXQiOiB7CiAgICAiY2FzZSI6IDUwMCwKICAgICJ1c2VyIjogMywKICAgICJkYXRhX2FnZSI6IDkwCiAgfSwKICAiYWN0aXZlIjogdHJ1ZSwKICAiZXhwaXJhdGlvbiI6ICIyMDI2LTAyLTE3VDExOjQ4OjAwKzA4OjAwIgp9";
const API_KEY = "apikey1234abcdefghij0123456789";

export { API_BASE_URL, PRODUCT_API_URL, LOGIN_BACKGROUND_URL, endpoints, currencyConfig, taxConfig, LICENSE_KEY, API_KEY };
export default endpoints;
