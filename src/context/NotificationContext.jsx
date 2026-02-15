import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const [timerId, setTimerId] = useState(null);

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });

        // Clear existing timer if any
        if (timerId) {
            clearTimeout(timerId);
        }

        // Auto-dismiss after 3 seconds
        const newTimerId = setTimeout(() => {
            setNotification(null);
        }, 3000);
        setTimerId(newTimerId);
    }, [timerId]);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ notification, showNotification, closeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
