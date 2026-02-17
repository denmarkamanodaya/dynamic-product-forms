
import { LICENSE_KEY } from '../config';

export const getLicenseData = () => {
    try {
        if (!LICENSE_KEY) return null;
        const decoded = atob(LICENSE_KEY);
        return JSON.parse(decoded);
    } catch (e) {
        console.error("Failed to decode license key", e);
        return null;
    }
};

export const getDataAgeLimit = () => {
    const data = getLicenseData();
    // Default to 90 days if not specified or error
    return data?.limit?.data_age || 10;
};
