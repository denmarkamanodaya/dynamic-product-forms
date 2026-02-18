import React, { useState, useEffect, useMemo } from 'react';
import { UserService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faUser, faEnvelope, faShieldAlt,
    faCheckCircle, faBan, faPlus, faInbox, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../context/NotificationContext';
import './MyCases.css'; // Reuse same layout CSS for consistency

const UserDirectory = ({ onNavigate }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState('detail');
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', emailAddress: '',
        password: '', confirmPassword: '',
        role: 'member', avatarUrl: ''
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.list();
            let list = [];
            if (Array.isArray(response)) list = response;
            else if (response.data && Array.isArray(response.data)) list = response.data;
            else if (response.data?.data && Array.isArray(response.data.data)) list = response.data.data;
            setUsers(list);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const q = searchTerm.toLowerCase();
        return users.filter(u =>
            (u.firstName || '').toLowerCase().includes(q) ||
            (u.lastName || '').toLowerCase().includes(q) ||
            (u.emailAddress || '').toLowerCase().includes(q)
        );
    }, [users, searchTerm]);

    const getInitials = (first, last) =>
        `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();

    const getAvatarStyle = (user) => {
        if (user.metadata) {
            try {
                const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                if (meta?.avatarColor) return { backgroundColor: meta.avatarColor, backgroundImage: 'none' };
            } catch (e) { /* ignore */ }
        }
        return { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' };
    };

    const getStatusIcon = (status) => {
        if ((status || '').toUpperCase() === 'ACTIVE')
            return <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} />;
        return <FontAwesomeIcon icon={faBan} style={{ color: '#ef4444' }} />;
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setMode('detail');
    };

    const handleNewUserClick = () => {
        setSelectedUser(null);
        setMode('create');
        setFormData({ firstName: '', lastName: '', emailAddress: '', password: '', confirmPassword: '', role: 'member', avatarUrl: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (formData.password !== formData.confirmPassword) {
            showNotification("Passwords do not match", 'error'); return;
        }
        if (formData.password.length < 8) {
            showNotification("Password must be at least 8 characters long", 'error'); return;
        }
        if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
            showNotification("Password must contain at least one letter and one number", 'error'); return;
        }
        setCreating(true);
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const payload = {
            firstName: formData.firstName.toUpperCase(),
            lastName: formData.lastName.toUpperCase(),
            emailAddress: formData.emailAddress,
            password: formData.password,
            role: formData.role,
            avatarUrl: formData.avatarUrl,
            status: 'active',
            metadata: JSON.stringify({ avatarColor: randomColor })
        };
        try {
            const response = await UserService.create({ data: payload });
            if (response.data) {
                showNotification("User created successfully!", 'success');
                setMode('detail');
                setFormData({ firstName: '', lastName: '', emailAddress: '', password: '', confirmPassword: '', role: 'member', avatarUrl: '' });
                fetchUsers();
            } else { throw new Error('Failed to create user'); }
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="mycases-wrapper">
                <div className="mycases-loading"><div className="spinner"></div>Loading users...</div>
            </div>
        );
    }

    return (
        <div className="mycases-wrapper">
            {/* ─── Column 1: User List ─── */}
            <div className="mycases-list-panel">
                <div className="mycases-list-header">
                    <h2>
                        <FontAwesomeIcon icon={faUser} />
                        Users Directory
                    </h2>
                    <div className="mycases-controls">
                        <div className="mycases-search">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="mycases-new-btn"
                            onClick={handleNewUserClick}
                        >
                            <FontAwesomeIcon icon={faPlus} /> New
                        </button>
                    </div>
                </div>

                {/* Column Headers */}
                <div className="mycases-table-header">
                    <div className="mycases-header-col col-id">Profile</div>
                    <div className="mycases-header-col col-client">Full Name</div>
                    <div className="mycases-header-col col-email" style={{ flex: 1.5 }}>Email Address</div>
                    <div className="mycases-header-col col-role" style={{ width: 100 }}>Role</div>
                    <div className="mycases-header-col col-status" style={{ width: 60 }}>Status</div>
                </div>

                <div className="mycases-card-list">
                    {filteredUsers.length === 0 ? (
                        <div className="mycases-empty">
                            <FontAwesomeIcon icon={faInbox} />
                            <p>No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            const isActive = selectedUser?.emailAddress === user.emailAddress;

                            return (
                                <div
                                    key={user.emailAddress || Math.random()}
                                    className={`mycases-card ${isActive ? 'active' : ''}`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <div className="mycases-row-col col-id">
                                        <span
                                            className="avatar-circle"
                                            style={{
                                                ...getAvatarStyle(user),
                                                width: 24, height: 24,
                                                fontSize: '0.6rem',
                                                border: 'none'
                                            }}
                                        >
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                getInitials(user.firstName, user.lastName)
                                            )}
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-client">
                                        <span className="mycases-card-client">
                                            {user.firstName} {user.lastName}
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-email" style={{ flex: 1.5 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.emailAddress}</span>
                                    </div>
                                    <div className="mycases-row-col col-role" style={{ width: 100 }}>
                                        <span className={`status-badge-compact status-${(user.role || 'member').toLowerCase()}`} style={{ border: 'none', background: 'transparent' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{user.role}</span>
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-status" style={{ width: 60, justifyContent: 'center' }}>
                                        {getStatusIcon(user.status)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredUsers.length > 0 && (
                    <div className="mycases-list-count">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* ─── Column 2: Detail / Create ─── */}
            <div className="mycases-detail-panel">
                {mode === 'create' ? (
                    <UserCreateForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleCreate}
                        onCancel={() => setMode('detail')}
                        loading={creating}
                    />
                ) : selectedUser ? (
                    <UserDetailView
                        user={selectedUser}
                        getInitials={getInitials}
                        getAvatarStyle={getAvatarStyle}
                        getStatusIcon={getStatusIcon}
                    />
                ) : (
                    <div className="mycases-detail-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                        <p>Select a user to view details</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            or click <strong>+ New</strong> to create one
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── User Detail ─── */
const UserDetailView = ({ user, getInitials, getAvatarStyle, getStatusIcon }) => (
    <div className="mycases-detail-content">
        <div className="detail-header">
            <div className="detail-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: getAvatarStyle(user).background || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.2rem', overflow: 'hidden'
                }}>
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{user.firstName} {user.lastName}</h3>
                    <span className="detail-case-id">{user.emailAddress}</span>
                </div>
            </div>
            <div className="detail-header-right" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={`status-badge status-${(user.role || 'member').toLowerCase()}`}>
                    <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: '0.25rem' }} />
                    {user.role}
                </span>
                <span style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                    {getStatusIcon(user.status)}{' '}
                    {(user.status || '').toUpperCase() === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>

        <div className="detail-section">
            <h4 className="detail-section-title">
                <FontAwesomeIcon icon={faUser} /> User Information
            </h4>
            <div className="detail-client-grid">
                <div className="detail-info-item">
                    <span className="detail-info-label">First Name</span>
                    <span className="detail-info-value">{user.firstName || '—'}</span>
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">Last Name</span>
                    <span className="detail-info-value">{user.lastName || '—'}</span>
                </div>
                <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-info-label">
                        <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                        Email Address
                    </span>
                    <span className="detail-info-value">
                        <a href={`mailto:${user.emailAddress}`}>{user.emailAddress}</a>
                    </span>
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">
                        <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                        Role
                    </span>
                    <span className="detail-info-value" style={{ textTransform: 'capitalize' }}>
                        {user.role || '—'}
                    </span>
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                        Created
                    </span>
                    <span className="detail-info-value">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Inline Create Form ─── */
const UserCreateForm = ({ formData, onChange, onSubmit, onCancel, loading }) => (
    <div className="mycases-detail-content" style={{ maxWidth: 700 }}>
        <div className="detail-header">
            <div className="detail-header-left">
                <h3 style={{ margin: 0 }}>Create New User</h3>
                <span className="detail-case-id" style={{ fontFamily: 'inherit' }}>
                    Enter the details for the new user account
                </span>
            </div>
        </div>

        <div className="detail-section">
            <h4 className="detail-section-title">
                <FontAwesomeIcon icon={faUser} /> Personal Information
            </h4>
            <div className="detail-client-grid">
                <div className="detail-info-item">
                    <span className="detail-info-label">First Name</span>
                    <input type="text" name="firstName" className="glass-input" value={formData.firstName} onChange={onChange} placeholder="Enter first name" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">Last Name</span>
                    <input type="text" name="lastName" className="glass-input" value={formData.lastName} onChange={onChange} placeholder="Enter last name" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
                <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-info-label">Email Address</span>
                    <input type="email" name="emailAddress" className="glass-input" value={formData.emailAddress} onChange={onChange} placeholder="Enter email address" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
            </div>
        </div>

        <div className="detail-section">
            <h4 className="detail-section-title">
                <FontAwesomeIcon icon={faShieldAlt} /> Credentials & Access
            </h4>
            <div className="detail-client-grid">
                <div className="detail-info-item">
                    <span className="detail-info-label">Password</span>
                    <input type="password" name="password" className="glass-input" value={formData.password} onChange={onChange} placeholder="Min 8 chars, letter & number" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">Confirm Password</span>
                    <input type="password" name="confirmPassword" className="glass-input" value={formData.confirmPassword} onChange={onChange} placeholder="Re-enter password" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">Role</span>
                    <select name="role" className="glass-input" value={formData.role} onChange={onChange} style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>
                <div className="detail-info-item">
                    <span className="detail-info-label">Avatar URL (Optional)</span>
                    <input type="url" name="avatarUrl" className="glass-input" value={formData.avatarUrl} onChange={onChange} placeholder="https://example.com/avatar.jpg" style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }} />
                </div>
            </div>
        </div>

        <div className="detail-actions">
            <button className="btn-edit-case" style={{ background: '#e2e8f0', color: '#475569', boxShadow: 'none' }} onClick={onCancel}>
                Cancel
            </button>
            <button className="btn-edit-case" onClick={onSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
            </button>
        </div>
    </div>
);

export default UserDirectory;
