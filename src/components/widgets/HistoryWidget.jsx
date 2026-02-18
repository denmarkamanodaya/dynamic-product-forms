import React, { useState, useEffect } from 'react';
import './HistoryWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faClock, faEye, faUser } from '@fortawesome/free-solid-svg-icons';
import { HistoryService } from '../../services/api';

const HistoryWidget = ({ isOpen, onToggle }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch history when opened
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await HistoryService.list();
            // Normalized response check
            if (response.data) {
                setLogs(response.data || []);
            } else if (Array.isArray(response)) {
                setLogs(response);
            }
            console.log("History Logs:", response.data || response);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format date "Month Day, Year at Time"
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="history-widget-overlay">
            {/* The widget itself */}
            <div className="history-window">
                <div className="history-header">
                    <div className="history-title">
                        <FontAwesomeIcon icon={faHistory} />
                        Audit Trail / History
                    </div>
                    <button className="close-btn" onClick={() => onToggle(false)}>×</button>
                </div>

                <div className="history-body">
                    {isLoading ? (
                        <div className="loading-spinner"></div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state">
                            <FontAwesomeIcon icon={faEye} size="2x" style={{ marginBottom: '10px' }} />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div className="history-timeline">
                            {logs.map((log) => (
                                <div key={log.SK} className="history-item">
                                    <div className="history-dot"></div>
                                    <div className="history-content">
                                        <div className="history-header-row">
                                            <div className="history-action">{log.action.replace('_', ' ')}</div>
                                        </div>
                                        <div className="history-description">
                                            {log.description}
                                        </div>
                                        <div className="history-time">
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatDate(log.createdAt || log.timestamp)}
                                        </div>
                                        {log.user && (
                                            <div className="history-user">
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>
                                                    {(log.user.firstName || log.user.lastName)
                                                        ? `${log.user.firstName || ''} ${log.user.lastName || ''}`
                                                        : (log.user.email || 'Unknown')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryWidget;
