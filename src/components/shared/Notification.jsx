import React from 'react';
import './Notification.css';
import { useNotification } from '../../context/NotificationContext';

const Notification = () => {
    const { notification, closeNotification } = useNotification();

    if (!notification) return null;

    return (
        <div className={`notification-container ${notification.type}`}>
            <span className="notification-message">{notification.message}</span>
            <button className="notification-close-btn" onClick={closeNotification}>×</button>
        </div>
    );
};

export default Notification;
