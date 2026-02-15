import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.css';
import endpoints from '../config';

const CalendarWidget = ({ isOpen, onToggle }) => {
    const [date, setDate] = useState(new Date());
    const [cases, setCases] = useState([]);
    const [selectedDateCases, setSelectedDateCases] = useState([]);

    // Helper to format date as YYYY-MM-DD in local time
    const formatDateLocal = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch cases on mount
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const statuses = ['quotation', 'approved', 'invoicing', 'delivery'];
                const fetchPromises = statuses.map(status =>
                    fetch(`${endpoints.caseList}?status=${status}`)
                        .then(res => res.ok ? res.json() : [])
                        .then(data => Array.isArray(data) ? data : (data.data || []))
                );

                const results = await Promise.all(fetchPromises);
                const allCases = results.flat();
                console.log("CalendarWidget: Fetched all cases:", allCases);
                setCases(allCases);
            } catch (error) {
                console.error("Failed to fetch cases for calendar", error);
            }
        };
        fetchCases();
    }, []);

    // Update selected cases when date changes or cases load
    useEffect(() => {
        const dateString = formatDateLocal(date);
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
            const dateString = formatDateLocal(date);
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
                                        {selectedDateCases.map(c => (
                                            <li key={c.caseId} className="event-card">
                                                <div className="event-card-header">
                                                    <span className="client-name">
                                                        {c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || 'Unknown Client'}
                                                    </span>
                                                    <span className={`status-badge-full status-${c.status?.toLowerCase() || 'default'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <div className="event-card-body">
                                                    <p className="case-id">#{c.status.slice(0, 3).toUpperCase()}-{c.caseId.slice(-4).toUpperCase()}</p>
                                                    {c.data?.products && (
                                                        <p className="product-count">
                                                            {c.data.products.length} Item{c.data.products.length !== 1 ? 's' : ''}
                                                            <span className="total-val">Php {c.data?.grandTotal}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
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
