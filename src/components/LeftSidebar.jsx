import React from 'react';
import './LeftSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faCalendarAlt, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';

const LeftSidebar = ({ isChatOpen, onToggleChat, isCalendarOpen, onToggleCalendar, isHistoryOpen, onToggleHistory, onNewCase }) => {
    return (
        <aside className="left-sidebar">
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
                title="Toggle Chat"
            >
                <FontAwesomeIcon icon={faCommentDots} />
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
