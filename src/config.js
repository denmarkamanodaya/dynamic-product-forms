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
};

export { API_BASE_URL, PRODUCT_API_URL, endpoints };
export default endpoints;
