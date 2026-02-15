/**
 * Returns a date string in YYYY-MM-DD format based on the local timezone.
 * @param {Date} dateObj - The date object to format. Defaults to now.
 * @returns {string} Date string in YYYY-MM-DD format.
 */
export const getLocalDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
