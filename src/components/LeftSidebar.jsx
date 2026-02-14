import React from 'react';
import './LeftSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faCalendarAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const LeftSidebar = ({ isChatOpen, onToggleChat, isCalendarOpen, onToggleCalendar, onNewCase }) => {
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
        </aside>
    );
};

export default LeftSidebar;
