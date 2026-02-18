import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.css';
import { CaseService } from '../services/api';
import { getLocalDateString } from '../utils/dateHelpers';
import { currencyConfig } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMoneyBillWave, faUser, faBox, faBookmark } from '@fortawesome/free-solid-svg-icons';

const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
};

const renderUserAvatar = (user) => {
    if (!user) return <div className="user-avatar-circle unknown">?</div>;

    if (typeof user === 'string') {
        return (
            <div className="user-avatar-circle legacy" title={user}>
                <FontAwesomeIcon icon={faUser} />
            </div>
        );
    }

    if (user.avatarUrl) {
        return <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="user-avatar-circle image" />;
    }

    let customStyle = {};
    if (user.metadata) {
        try {
            const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
            if (meta && meta.avatarColor) {
                customStyle = {
                    backgroundColor: meta.avatarColor,
                    backgroundImage: 'none'
                };
            }
        } catch (e) { }
    }

    const initials = getInitials(user.firstName, user.lastName);
    return (
        <div
            className="user-avatar-circle initials"
            title={`${user.firstName} ${user.lastName}`}
            style={customStyle}
        >
            {initials}
        </div>
    );
};

const CalendarWidget = ({ isOpen, onToggle }) => {
    const [date, setDate] = useState(new Date());
    const [cases, setCases] = useState([]);
    const [selectedDateCases, setSelectedDateCases] = useState([]);

    // Fetch cases on mount only (no polling to reduce API costs)
    useEffect(() => {
        const fetchCases = async () => {
            try {
                // Fetch ALL cases in one go
                const response = await CaseService.list();
                let allCases = [];
                if (Array.isArray(response)) {
                    allCases = response;
                } else if (response.data && Array.isArray(response.data)) {
                    allCases = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    allCases = response.data.data;
                }

                // Filter out completed and ARCHIVED cases
                const activeCases = allCases.filter(c => c.status !== 'completed' && (c.status || '').toUpperCase() !== 'ARCHIVED');
                setCases(activeCases);
            } catch (error) {
                console.error("Failed to fetch cases for calendar", error);
            }
        };
        fetchCases();
    }, []); // Fetch only once on mount

    // Update selected cases when date changes or cases load
    useEffect(() => {
        const dateString = getLocalDateString(date);

        const filtered = cases.filter(c => {
            // Check data.orderDetails.leadTime first, fallback to data.clientDetails.date
            const leadTime = c.data?.orderDetails?.leadTime || c.data?.clientDetails?.date;

            // Handle if leadTime is a full ISO string
            let normalizedLeadTime = leadTime;
            if (leadTime && leadTime.includes('T')) {
                normalizedLeadTime = leadTime.split('T')[0];
            }



            return normalizedLeadTime === dateString;
        });
        setSelectedDateCases(filtered);
    }, [date, cases]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    // Custom tile content to show dots
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = getLocalDateString(date);
            const hasCases = cases.some(c => {
                const leadTime = c.data?.orderDetails?.leadTime || c.data?.clientDetails?.date;
                let normalized = leadTime;
                if (leadTime && leadTime.includes('T')) normalized = leadTime.split('T')[0];
                return normalized === dateString;
            });

            if (hasCases) {
                return (
                    <div className="calendar-tile-content">
                        <div className="calendar-dot"></div>
                    </div>
                );
            }
        }
        return null;
    };

    // Close on click outside (adjusted to use prop)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && event.target.classList.contains('calendar-overlay')) {
                onToggle(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className="calendar-widget">
            {isOpen && (
                <div className="calendar-overlay">
                    <div className="calendar-container">
                        <div className="calendar-header-full">
                            <h2 className="calendar-title-full">Production Calendar</h2>
                            <button className="close-btn-full" onClick={() => onToggle(false)}>
                                <span className="icon">×</span> Close
                            </button>
                        </div>

                        <div className="calendar-body-full">
                            <div className="calendar-sidebar-minimal">
                                <div className="calendar-search-container">
                                    <div className="search-wrapper">
                                        <span className="search-icon">🔍</span>
                                        <input type="text" placeholder="Search memos..." className="mini-search-input" />
                                        <span className="filter-icon">⚙️</span>
                                    </div>
                                </div>

                                <div className="calendar-main-view">
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={date}
                                        tileContent={tileContent}
                                        className="custom-calendar-minimal"
                                        next2Label={null}
                                        prev2Label={null}
                                        formatShortWeekday={(locale, date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                                    />
                                </div>

                                <div className="calendar-mini-stats">
                                    <div className="mini-stat-chip">🔗 Links 0</div>
                                    <div className="mini-stat-chip">📋 To-do 0/1</div>
                                    <div className="mini-stat-chip">{'</>'} Code 0</div>
                                </div>

                                <div className="calendar-section">
                                    <div className="section-header">
                                        <h3>Shortcuts</h3>
                                        <button className="add-btn">+</button>
                                    </div>
                                </div>

                                <div className="calendar-section">
                                    <div className="section-header">
                                        <h3>Tags</h3>
                                        <button className="more-btn">...</button>
                                    </div>
                                    <div className="tags-container">
                                        <span className="tag"># features</span>
                                        <span className="tag"># hello</span>
                                        <span className="tag"># sponsor</span>
                                        <span className="tag"># todo</span>
                                    </div>
                                </div>
                            </div>

                            <div className="calendar-content-view">
                                <h3 className="sidebar-date">
                                    {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <div className="sidebar-divider"></div>

                                {selectedDateCases.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📅</div>
                                        <p>No production due on this date.</p>
                                    </div>
                                ) : (
                                    <ul className="events-list-full">
                                        {selectedDateCases.map(c => (
                                            <div key={c.caseId || c._id} className="kanban-card calendar-card">
                                                <div className="card-content">
                                                    <div className="card-title-group">
                                                        <div className="card-title">
                                                            {c.data?.clientDetails?.clientName || c.data?.clientName || 'Untitled Request'}
                                                        </div>
                                                        {(c.data?.clientDetails?.businessName || c.data?.businessName) && (
                                                            <div className="card-subtitle">
                                                                {c.data?.clientDetails?.businessName || c.data?.businessName}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="card-stats">
                                                        <div className="stat-item" title="Grand Total">
                                                            <FontAwesomeIcon icon={faMoneyBillWave} />
                                                            <span>{c.data?.grandTotal ? parseFloat(c.data.grandTotal).toLocaleString(currencyConfig.locale, { style: 'currency', currency: currencyConfig.code }) : '—'}</span>
                                                        </div>
                                                        <div className="stat-item" title="Items">
                                                            <FontAwesomeIcon icon={faBox} />
                                                            <span>{c.data?.products?.length || 0} items</span>
                                                        </div>
                                                        {c.data?.orderDetails?.leadTime && (
                                                            <div className="stat-item" title="Lead Time">
                                                                <FontAwesomeIcon icon={faCalendarAlt} />
                                                                <span>{c.data.orderDetails.leadTime}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="card-footer">
                                                        <div className="card-id-group">
                                                            <FontAwesomeIcon icon={faBookmark} className="id-icon" />
                                                            <span className="card-id">
                                                                {`NUC-${String(c.caseId || c._id).slice(-4).toUpperCase()}`}
                                                            </span>
                                                        </div>
                                                        <div className="card-avatar">
                                                            {renderUserAvatar(c.createdBy)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarWidget;
