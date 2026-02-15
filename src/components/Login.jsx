import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import firetronLogo from '../assets/firetron-logo.png';
import { endpoints } from '../config'; // Added endpoints import
import './Login.css';

// Mock User Database - This will be removed as we are using an API
// const USERS = {
//     'user': { username: 'user', password: 'pass', name: 'Demo User', role: 'User' },
//     'admin': { username: 'admin', password: 'admin', name: 'System Admin', role: 'Admin' },
//     'jane': { username: 'jane', password: 'doe', name: 'Jane Doe', role: 'Manager' },
//     'john': { username: 'john', password: 'doe', name: 'John Doe', role: 'Support' }
// };

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState(''); // This acts as email/username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => { // Made handleSubmit async
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(endpoints.userLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        emailAddress: username, // Mapping username field to emailAddress for backend
                        password: password
                    }
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            // Success
            onLogin(result.data);

        } catch (err) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={firetronLogo} alt="Firetron" className="login-logo" />
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Please sign in to continue</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faUser} className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                className="glass-input with-icon"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                className="glass-input with-icon"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                </form>

                <div className="login-footer">
                    &copy; {new Date().getFullYear()} Firetron. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
