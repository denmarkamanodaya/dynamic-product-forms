import React from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './NavigationSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faTachometerAlt, faBriefcase, faList, faPlus, faUserPlus, faUserTie, faCog, faFire } from '@fortawesome/free-solid-svg-icons';

const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const NavigationSidebar = ({ currentView, onNavigate, clientName, currentUser, onLogout, isOpen, onClose }) => {
    return (
        <>
            {isOpen && <div className="nav-backdrop" onClick={onClose} />}
            <nav className={`navigation-sidebar ${isOpen ? 'nav-open' : ''}`}>
                <a href="/" onClick={() => window.location.reload()}><div className="nav-header">
                    <img src={firetronLogo} alt="Firetron" className="nav-logo" />
                    {clientName && (
                        <span className="client-info">Client: {clientName}</span>
                    )}
                </div></a>

                <div className="nav-menu">
                    {['superadmin', 'admin', 'Admin'].includes(currentUser?.role) && (
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

                    {['superadmin', 'admin', 'Admin'].includes(currentUser?.role) && (
                        <a
                            className={`nav-item ${['user-list', 'user-create'].includes(currentView) ? 'active' : ''}`}
                            onClick={() => onNavigate('user-list')}
                        >
                            <FontAwesomeIcon icon={faUserCircle} />
                            Users
                        </a>
                    )}
                    <a
                        className={`nav-item ${['client-list', 'client-create'].includes(currentView) ? 'active' : ''}`}
                        onClick={() => onNavigate('client-list')}
                    >
                        <FontAwesomeIcon icon={faUserTie} />
                        Clients
                    </a>

                    {['superadmin', 'admin', 'Admin'].includes(currentUser?.role) && (
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
                                {(() => {
                                    // Dynamic Avatar Logic
                                    if (currentUser.avatarUrl) {
                                        return <img src={currentUser.avatarUrl} alt="User" className="user-avatar-circle image" />;
                                    }

                                    let customStyle = {};
                                    if (currentUser.metadata) {
                                        try {
                                            const meta = typeof currentUser.metadata === 'string' ? JSON.parse(currentUser.metadata) : currentUser.metadata;
                                            if (meta && meta.avatarColor) {
                                                customStyle = {
                                                    backgroundColor: meta.avatarColor,
                                                    backgroundImage: 'none'
                                                };
                                            }
                                        } catch (e) {
                                            console.error("Failed to parse user metadata", e);
                                        }
                                    }

                                    return (
                                        <div
                                            className="user-avatar-circle"
                                            style={customStyle}
                                        >
                                            {getInitials(currentUser.firstName, currentUser.lastName)}
                                        </div>
                                    );
                                })()}
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
            </nav>
        </>
    );
};

export default NavigationSidebar;
