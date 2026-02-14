import React from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './TopNavbar.css';

const TopNavbar = ({ currentView, onNavigate, clientName }) => {
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
                {/* Add dummy links to match the crowded nature of MindJournals nav if desired, 
                    but sticking to functional ones for now */}
            </div>

            <div className="navbar-actions">
                {/* Placeholder for right-side actions like Search/Login to balance the grid */}
                <div style={{ width: '24px' }}></div>
            </div>
        </nav>
    );
};

export default TopNavbar;
