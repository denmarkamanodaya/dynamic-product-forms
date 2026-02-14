import React from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './NavigationSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faTachometerAlt, faFolderPlus, faList, faPlus } from '@fortawesome/free-solid-svg-icons';

const NavigationSidebar = ({ currentView, onNavigate, clientName, currentUser, onLogout }) => {
    return (
        <nav className="navigation-sidebar">
            <div className="nav-header">
                <img src={firetronLogo} alt="Firetron" className="nav-logo" />
                {clientName && (
                    <span className="client-info">Client: {clientName}</span>
                )}
            </div>

            <div className="nav-menu">
                <a
                    className={`nav-item ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => onNavigate('list')}
                >
                    <FontAwesomeIcon icon={faList} />
                    Dashboard
                </a>
                <a
                    className={`nav-item ${currentView === 'form' ? 'active' : ''}`}
                    onClick={() => onNavigate('form')}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New Case
                </a>
            </div>

            <div className="nav-footer">
                {currentUser && (
                    <>
                        <div className="user-profile">
                            <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
                            <div className="user-details">
                                <span className="user-name">{currentUser.name}</span>
                                <span className="user-role">{currentUser.role}</span>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavigationSidebar;
