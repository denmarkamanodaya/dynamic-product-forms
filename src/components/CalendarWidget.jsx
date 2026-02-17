import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.css';
import { CaseService } from '../services/api';
import { getLocalDateString } from '../utils/dateHelpers';
import { currencyConfig } from '../config';

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
            const dayCases = cases.filter(c => {
                const leadTime = c.data?.orderDetails?.leadTime || c.data?.clientDetails?.date;
                let normalizedLeadTime = leadTime;
                if (leadTime && leadTime.includes('T')) {
                    normalizedLeadTime = leadTime.split('T')[0];
                }
                return normalizedLeadTime === dateString;
            });

            if (dayCases.length > 0) {
                return (
                    <div className="calendar-tile-content">
                        {dayCases.length < 3 ? (
                            <div className="dots-container">
                                {dayCases.map((_, i) => <div key={i} className="calendar-dot"></div>)}
                            </div>
                        ) : (
                            <div className="calendar-count-badge">{dayCases.length}</div>
                        )}
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
                            <div className="calendar-main-view">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={date}
                                    tileContent={tileContent}
                                    className="custom-calendar-full"
                                />
                            </div>

                            <div className="calendar-sidebar">
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
                                        {selectedDateCases.map(c => {
                                            // Get user avatar data
                                            const renderUserAvatar = (createdBy) => {
                                                if (!createdBy) return null;

                                                let name = 'Unknown';
                                                let initials = 'U';
                                                let avatarColor = 'var(--accent-color, #3b82f6)';


                                                if (createdBy.firstName || createdBy.lastName) {
                                                    const first = createdBy.firstName ? createdBy.firstName.charAt(0) : '';
                                                    const last = createdBy.lastName ? createdBy.lastName.charAt(0) : '';
                                                    initials = first && last ? `${first}${last}` : (first || last || 'U');
                                                } else if (createdBy.name) {
                                                    name = createdBy.name;
                                                    const nameParts = name.split(' ');
                                                    initials = nameParts.length > 1
                                                        ? `${nameParts[0][0]}${nameParts[1][0]}`
                                                        : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
                                                }


                                                if (createdBy.metadata) {
                                                    try {
                                                        const meta = typeof createdBy.metadata === 'string'
                                                            ? JSON.parse(createdBy.metadata)
                                                            : createdBy.metadata;
                                                        initials = meta.initials || initials;
                                                        avatarColor = meta.avatarColor || avatarColor;
                                                    } catch (e) {
                                                        // Use defaults
                                                    }
                                                }


                                                return (
                                                    <div
                                                        className="user-avatar-circle"
                                                        style={{
                                                            background: avatarColor,
                                                            backgroundColor: avatarColor
                                                        }}
                                                    >
                                                        {initials.toUpperCase()}
                                                    </div>
                                                );
                                            };

                                            return (
                                                <li key={c.caseId} className="event-card kanban-card-style">
                                                    <div className="card-header-row">
                                                        <div className="card-client">
                                                            <div className="client-name">
                                                                {c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || 'Unknown Client'}
                                                            </div>
                                                            {c.data?.clientDetails?.businessName && c.data?.clientDetails?.clientName && (
                                                                <div className="business-name">
                                                                    {c.data?.clientDetails?.businessName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="card-footer-row">
                                                        <div className="card-info-item total-item">
                                                            <span className="text" style={{ fontWeight: 'bold' }}>
                                                                {currencyConfig.code} {c.data?.grandTotal ? parseFloat(c.data.grandTotal).toLocaleString(currencyConfig.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                            </span>
                                                        </div>

                                                        <div className="card-info-item">
                                                            <span className="text">
                                                                {c.data?.products?.length || 0} Item{(c.data?.products?.length || 0) !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="card-user-footer">
                                                        <span className={`compact-status-badge status-${c.status?.toLowerCase() || 'default'}`}>
                                                            {c.status
                                                                ? `${c.status.slice(0, 3).toUpperCase()}-${String(c.caseId).slice(-4).toUpperCase()}`
                                                                : String(c.caseId).slice(-4).toUpperCase()}
                                                        </span>
                                                        {renderUserAvatar(c.createdBy)}
                                                    </div>
                                                </li>
                                            );
                                        })}
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
