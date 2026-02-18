import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import firetronLogo from '../../assets/firetron-logo.png';
import { UserService } from '../../services/api';
import './Login.css';

// Mock User Database - This will be removed as we are using an API
// const USERS = {
//     'user': { username: 'user', password: 'pass', name: 'Demo User', role: 'User' },
//     'admin': { username: 'admin', password: 'admin', name: 'System Admin', role: 'Admin' },
//     'jane': { username: 'jane', password: 'doe', name: 'Jane Doe', role: 'Manager' },
//     'john': { username: 'john', password: 'doe', name: 'John Doe', role: 'Support' }
// };

const Login = ({ onLogin }) => {
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => { // Made handleSubmit async
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Backend expects { data: { emailAddress, password } }
            const response = await UserService.login({
                data: {
                    emailAddress: emailAddress,
                    password: password
                }
            });

            if (response.data) {
                // Success
                onLogin(response.data);
            } else {
                throw new Error('Login failed');
            }

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
                        <label htmlFor="emailAddress">Email Address</label>
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faUser} className="input-icon" />
                            <input
                                type="email"
                                id="emailAddress"
                                className="glass-input with-icon"
                                placeholder="Enter email address"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                autoComplete="email"
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
