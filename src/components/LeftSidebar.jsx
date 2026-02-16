import React from 'react';
import './LeftSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faCalendarAlt, faPlus, faEye, faFire, faBrain } from '@fortawesome/free-solid-svg-icons';

const LeftSidebar = ({ onNavigate, onToggleChat, isChatOpen, onToggleCalendar, isCalendarOpen, onToggleHistory, isHistoryOpen, onNewCase, onNavigate: handleNavigate }) => {
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
        </aside>
    );
};

export default LeftSidebar;
