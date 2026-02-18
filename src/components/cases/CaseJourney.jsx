import React, { useEffect, useState } from 'react';
import './CaseJourney.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { HistoryService } from '../../services/api';

const CaseJourney = ({ caseId, onClose }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await HistoryService.getByCaseId(caseId);
                if (response.data) {
                    const sortedHistory = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setHistory(sortedHistory);
                }
            } catch (error) {
                console.error("Failed to fetch case history", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (caseId) {
            fetchHistory();
        }
    }, [caseId]);

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="case-journey-modal-overlay" onClick={onClose}>
            <div className="case-journey-modal" onClick={e => e.stopPropagation()}>
                <div className="case-journey-header">
                    <h2>Case Journey</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="case-journey-content">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading journey...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <p className="no-data">No history found for this case.</p>
                    ) : (
                        <div className="journey-timeline">
                            {history.map((step, index) => (
                                <div key={step.id || index} className={`journey-step ${index === 0 ? 'completed' : ''}`}>
                                    <div className="step-marker"></div>
                                    <div className="step-content">
                                        <div className="step-header">
                                            <span className="step-action">{step.action}</span>
                                            <span className="step-date">{formatDateTime(step.createdAt)}</span>
                                        </div>
                                        <div className="step-description">{step.description}</div>
                                        {step.user && (
                                            <div className="step-user">
                                                <div className="step-user-avatar" style={(() => {
                                                    if (step.user.metadata) {
                                                        try {
                                                            const meta = typeof step.user.metadata === 'string' ? JSON.parse(step.user.metadata) : step.user.metadata;
                                                            if (meta.avatarColor) return { backgroundColor: meta.avatarColor, backgroundImage: 'none' };
                                                        } catch (e) { }
                                                    }
                                                    return {};
                                                })()}>
                                                    {step.user.avatarUrl ? (
                                                        <img src={step.user.avatarUrl} alt="User" />
                                                    ) : (
                                                        getInitials(step.user.firstName, step.user.lastName) || <FontAwesomeIcon icon={faUser} />
                                                    )}
                                                </div>
                                                <span>{step.user.firstName} {step.user.lastName}</span>
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

export default CaseJourney;
