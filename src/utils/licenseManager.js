/**
 * Utility to manage license decoding and validation.
 */

// Decodes the base64 license string into a JSON object
export const decodeLicense = (licenseString) => {
    try {
        if (!licenseString) return null;
        const decoded = atob(licenseString);
        return JSON.parse(decoded);
    } catch (error) {
        console.error("Failed to decode license:", error);
        return null;
    }
};

// Checks if the license is active and limits are respected
export const checkLicenseStatus = (licenseString, metrics = {}) => {
    const licenseData = decodeLicense(licenseString);

    if (!licenseData) {
        return { isValid: false, message: "Invalid license format." };
    }

    if (licenseData.active === false) {
        return { isValid: false, message: "License is inactive." };
    }

    // Check Case Limit
    if (licenseData.limit && licenseData.limit.case !== undefined && metrics.caseCount !== undefined) {
        if (metrics.caseCount > licenseData.limit.case) {
            return {
                isValid: false,
                message: `Case limit reached. Your license allows ${licenseData.limit.case} cases, but you have ${metrics.caseCount}. Please upgrade your license.`
            };
        }
    }

    return { isValid: true, data: licenseData };
};
