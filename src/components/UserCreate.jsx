import React, { useState, useEffect } from 'react';
import './UserCreate.css';
import { endpoints } from '../config';

const UserCreate = ({ onNavigate }) => {
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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return false;
        }

        // Basic strength check: at least one number and one letter
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);

        if (!hasLetter || !hasNumber) {
            setError("Password must contain at least one letter and one number");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

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
            const response = await fetch(endpoints.userCreate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: payload }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            setSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                emailAddress: '',
                password: '',
                confirmPassword: '',
                role: 'member',
                avatarUrl: ''
            });

        } catch (err) {
            setError(err.message);
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

                {error && <div className="validation-error">{error}</div>}
                {success && (
                    <div className="success-message">
                        User created successfully!
                        <button onClick={() => setSuccess(false)} className="close-msg">Dismiss</button>
                    </div>
                )}

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
                    <button className="cancel-btn" onClick={() => onNavigate('dashboard')}>
                        Cancel
                    </button>
                    <button
                        className="create-btn"
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
