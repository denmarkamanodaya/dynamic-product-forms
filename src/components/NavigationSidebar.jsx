import React from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './NavigationSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faTachometerAlt, faBriefcase, faList, faPlus, faUserPlus, faUserTie, faCog, faFire } from '@fortawesome/free-solid-svg-icons';

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
                {['superadmin', 'admin'].includes(currentUser?.role) && (
                    <a
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onNavigate('dashboard')}
                    >
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        Dashboard
                    </a>
                )}
                <a
                    className={`nav-item ${currentView === 'my-cases' ? 'active' : ''}`}
                    onClick={() => onNavigate('my-cases')}
                >
                    <FontAwesomeIcon icon={faBriefcase} />
                    My Cases
                </a>
                <a
                    className={`nav-item ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => onNavigate('list')}
                >
                    <FontAwesomeIcon icon={faList} />
                    Kanban Board
                </a>
                <a
                    className={`nav-item ${currentView === 'form' ? 'active' : ''}`}
                    onClick={() => onNavigate('form')}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New Case
                </a>
                {['superadmin', 'admin'].includes(currentUser?.role) && (
                    <a
                        className={`nav-item ${currentView === 'user-create' ? 'active' : ''}`}
                        onClick={() => onNavigate('user-create')}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        New User
                    </a>
                )}
                <a
                    className={`nav-item ${currentView === 'client-create' ? 'active' : ''}`}
                    onClick={() => onNavigate('client-create')}
                >
                    <FontAwesomeIcon icon={faUserTie} />
                    New Client
                </a>
                {['superadmin', 'admin'].includes(currentUser?.role) && (
                    <a
                        className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                        onClick={() => onNavigate('settings')}
                    >
                        <FontAwesomeIcon icon={faCog} />
                        Settings
                    </a>
                )}
            </div>

            <div className="nav-footer">
                {currentUser && (
                    <>
                        <div className="user-profile">
                            <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
                            <div className="user-details">
                                <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
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
        </nav >
    );
};

export default NavigationSidebar;
