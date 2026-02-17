import React from 'react';
import './LeftSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faCalendarAlt, faPlus, faEye, faFire, faBrain, faBoxArchive, faBars } from '@fortawesome/free-solid-svg-icons';
import { ArchiverService } from '../services/api';
import { getDataAgeLimit } from '../utils/license';
import { useNotification } from '../context/NotificationContext';

const LeftSidebar = ({ onNavigate, onToggleChat, isChatOpen, onToggleCalendar, isCalendarOpen, onToggleHistory, isHistoryOpen, onNewCase, onNavigate: handleNavigate, currentUser, onToggleNav }) => {
    const { showNotification } = useNotification();

    const handleArchive = async () => {
        try {
            showNotification('Running archiver...', 'info');
            const age = getDataAgeLimit();
            console.log(`Running archiver for data older than ${age} days...`);
            const results = await ArchiverService.archiveAll(age);
            console.log("Archiver results:", results);
            showNotification(`Archiver completed! Data older than ${age} days archived.`, 'success');
        } catch (error) {
            console.error("Archiver failed:", error);
            showNotification("Failed to run archiver.", 'error');
        }
    };

    return (
        <aside className="left-sidebar">
            <button
                className="sidebar-icon-btn"
                onClick={() => handleNavigate('firetwit')}
                title="FireTwit & Notifications"
            >
                <div className="notification-badge-container">
                    <FontAwesomeIcon icon={faFire} />
                </div>
            </button>

            <button
                className="sidebar-icon-btn"
                onClick={onNewCase}
                title="New Case"
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>

            <button
                className={`sidebar-icon-btn ${isChatOpen ? 'active' : ''}`}
                onClick={onToggleChat}
            >
                <FontAwesomeIcon icon={faBrain} />
            </button>

            <button
                className={`sidebar-icon-btn ${isCalendarOpen ? 'active' : ''}`}
                onClick={onToggleCalendar}
                title="Toggle Calendar"
            >
                <FontAwesomeIcon icon={faCalendarAlt} />
            </button>

            <button
                className={`sidebar-icon-btn ${isHistoryOpen ? 'active' : ''}`}
                onClick={onToggleHistory}
                title="Audit History"
            >
                <FontAwesomeIcon icon={faEye} />
            </button>

            {['superadmin', 'admin'].includes(currentUser?.role) && (
                <button
                    className="sidebar-icon-btn"
                    onClick={handleArchive}
                    title="Archive Data"
                >
                    <FontAwesomeIcon icon={faBoxArchive} />
                </button>
            )}

            {/* Hamburger - mobile only */}
            <button
                className="sidebar-icon-btn mobile-only"
                onClick={onToggleNav}
                title="Menu"
            >
                <FontAwesomeIcon icon={faBars} />
            </button>
        </aside>
    );
};

export default LeftSidebar;
