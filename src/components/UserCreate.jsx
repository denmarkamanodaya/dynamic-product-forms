import React, { useState, useEffect } from 'react';
import './UserCreate.css';
import { useNotification } from '../context/NotificationContext';
import { UserService } from '../services/api';

const UserCreate = ({ onNavigate }) => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
        role: 'member',
        avatarUrl: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            showNotification("Passwords do not match", 'error');
            return false;
        }

        if (formData.password.length < 8) {
            showNotification("Password must be at least 8 characters long", 'error');
            return false;
        }

        // Basic strength check: at least one number and one letter
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);

        if (!hasLetter || !hasNumber) {
            showNotification("Password must contain at least one letter and one number", 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        // Generate random hex color for avatar background
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        // Prepare payload: remove confirmPassword and add default status
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
                setFormData({
                    firstName: '',
                    lastName: '',
                    emailAddress: '',
                    password: '',
                    confirmPassword: '',
                    role: 'member',
                    avatarUrl: ''
                });
            } else {
                throw new Error('Failed to create user');
            }

        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-create-page">
            <div className="user-create-card">
                <div className="user-create-header">
                    <h2 className="user-create-title">Create New User</h2>
                    <p className="user-create-subtitle">Enter the details for the new user account</p>
                </div>

                <div className="user-create-grid">
                    <div className="form-field">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className="glass-input"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                        />
                    </div>

                    <div className="form-field">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className="glass-input"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="emailAddress"
                            className="glass-input"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="form-field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="glass-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min 8 chars, letter & number"
                        />
                    </div>

                    <div className="form-field">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="glass-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                        />
                    </div>

                    <div className="form-field">
                        <label>Role</label>
                        <select
                            name="role"
                            className="glass-input"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="guest">Guest</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Avatar URL (Optional)</label>
                        <input
                            type="url"
                            name="avatarUrl"
                            className="glass-input"
                            value={formData.avatarUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                </div>

                <div className="user-create-actions">
                    <button className="glass-btn secondary" onClick={() => onNavigate('dashboard')}>
                        Cancel
                    </button>
                    <button
                        className="glass-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCreate;
