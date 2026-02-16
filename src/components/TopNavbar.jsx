import React from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './TopNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const TopNavbar = ({ currentView, onNavigate, clientName, currentUser, onLogout }) => {
    return (
        <nav className="top-navbar">
            <div className="navbar-brand">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <img src={firetronLogo} alt="Firetron" className="logo-img" />
                    {clientName && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                            Client: {clientName}
                        </span>
                    )}
                </div>
            </div>

            <div className="navbar-menu">
                <a
                    className={`nav-link ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => onNavigate('list')}
                >
                    Dashboard
                </a>
                <a
                    className={`nav-link ${currentView === 'form' ? 'active' : ''}`}
                    onClick={() => onNavigate('form')}
                >
                    New Case
                </a>
            </div>

            <div className="navbar-actions">
                {currentUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                    {currentUser.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    {currentUser.role}
                                </div>
                            </div>
                            <FontAwesomeIcon icon={faUserCircle} size="2x" style={{ color: '#cbd5e1' }} />
                        </div>
                        <button
                            className="glass-btn"
                            onClick={onLogout}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default TopNavbar;
