import React, { useState, useEffect } from 'react';
import { UserService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faEnvelope, faShieldAlt, faCheckCircle, faBan, faPlus } from '@fortawesome/free-solid-svg-icons';

const UserList = ({ onNavigate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await UserService.list();
            let userList = [];
            if (Array.isArray(response)) {
                userList = response;
            } else if (response.data && Array.isArray(response.data)) {
                userList = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                userList = response.data.data;
            }
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (user.firstName || '').toLowerCase().includes(query) ||
            (user.lastName || '').toLowerCase().includes(query) ||
            (user.emailAddress || '').toLowerCase().includes(query)
        );
    });

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getAvatarStyle = (user) => {
        if (user.metadata) {
            try {
                const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                if (meta && meta.avatarColor) {
                    return { background: meta.avatarColor };
                }
            } catch (e) {
                // Ignore
            }
        }
        return {}; // Default fallbacks in CSS
    };

    const getStatusIcon = (status) => {
        if ((status || '').toUpperCase() === 'ACTIVE') return <FontAwesomeIcon icon={faCheckCircle} className="status-icon active" />;
        return <FontAwesomeIcon icon={faBan} className="status-icon inactive" />;
    };

    return (
        <div className="ledger-container user-list-container">
            <div className="ledger-header">
                <h2 className="page-title"><FontAwesomeIcon icon={faUser} /> Users Directory</h2>
                <div className="ledger-controls">
                    <div className="search-box">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="glass-btn primary-btn" onClick={() => onNavigate('user-create')}>
                        <FontAwesomeIcon icon={faPlus} /> New User
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    Loading users...
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}></th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-center">Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.emailAddress || Math.random()} onClick={() => console.log('View user', user)}>
                                    <td className="avatar-cell">
                                        <div className="user-avatar" style={getAvatarStyle(user)}>
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="" />
                                            ) : (
                                                <span>{getInitials(user.firstName, user.lastName)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="font-medium">{user.firstName} {user.lastName}</td>
                                    <td>
                                        <a href={`mailto:${user.emailAddress}`} className="email-link" onClick={e => e.stopPropagation()}>
                                            <FontAwesomeIcon icon={faEnvelope} className="icon-mr" />
                                            {user.emailAddress}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${(user.role || '').toLowerCase()}`}>
                                            <FontAwesomeIcon icon={faShieldAlt} className="icon-mr" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {getStatusIcon(user.status)}
                                    </td>
                                    <td className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <style jsx>{`
                .ledger-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }
                .ledger-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .page-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0;
                }
                .ledger-controls {
                    display: flex;
                    gap: 1rem;
                }
                .search-box {
                    position: relative;
                    min-width: 250px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .search-box input {
                    width: 100%;
                    padding: 0 0 0 2rem;
                    border: none;
                    background: transparent;
                    color: #1e293b;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    outline: none;
                    box-shadow: none;
                    height: 100%;
                }
                .search-box input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .primary-btn {
                    /* glass-btn class handles most styles */
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                /* Table Styles matching LedgerTable */
                .table-responsive {
                    background: white;
                    border-radius: var(--radius-sm);
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .ledger-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ledger-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #e2e8f0;
                }
                .ledger-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    vertical-align: middle;
                    font-size: 0.9rem;
                }
                .ledger-table tr:last-child td {
                    border-bottom: none;
                }
                .ledger-table tr:hover {
                    background-color: #f8fafc;
                    cursor: pointer;
                }

                /* Avatar Styles */
                .avatar-cell {
                    width: 50px;
                    padding-right: 0 !important;
                }
                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.85rem;
                    overflow: hidden;
                }
                .user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Specific Column Styles */
                .font-medium {
                    font-weight: 500;
                    color: #0f172a;
                }
                .text-muted {
                    color: #94a3b8;
                    font-size: 0.85rem;
                }
                .text-center {
                    text-align: center;
                }
                .py-4 {
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                }

                /* Email Link */
                .email-link {
                    color: #3b82f6; /* Current color scheme blue */
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: color 0.2s;
                }
                .email-link:hover {
                    color: #2563eb;
                    text-decoration: underline;
                }

                /* Role Badges */
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .role-superadmin {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fee2e2;
                }
                .role-admin {
                    background: #fff7ed;
                    color: #ea580c;
                    border: 1px solid #ffedd5;
                }
                .role-member, .role-user {
                    background: #f0f9ff;
                    color: #0284c7;
                    border: 1px solid #e0f2fe;
                }
                .icon-mr {
                    margin-right: 0.4rem;
                }

                /* Status Icons */
                .status-icon {
                    font-size: 1.1rem;
                }
                .status-icon.active {
                    color: #10b981; /* Green check */
                }
                .status-icon.inactive {
                    color: #ef4444; /* Red ban */
                }

                /* Loading */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    color: #64748b;
                    background: white;
                    border-radius: var(--radius-sm);
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                }
                .spinner {
                    border: 3px solid #f1f5f9;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UserList;
