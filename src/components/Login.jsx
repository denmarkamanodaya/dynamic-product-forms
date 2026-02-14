import React, { useState } from 'react';
import firetronLogo from '../assets/firetron-logo.png';
import './Login.css';

// Mock User Database
const USERS = {
    'user': { username: 'user', password: 'pass', name: 'Demo User', role: 'User' },
    'admin': { username: 'admin', password: 'admin', name: 'System Admin', role: 'Admin' },
    'jane': { username: 'jane', password: 'doe', name: 'Jane Doe', role: 'Manager' },
    'john': { username: 'john', password: 'doe', name: 'John Doe', role: 'Support' }
};

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for premium feel
        setTimeout(() => {
            const user = USERS[username.toLowerCase()];
            if (user && user.password === password) {
                onLogin(user);
            } else {
                setError('Invalid username or password');
                setIsLoading(false);
            }
        }, 800);
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
                        <input
                            type="text"
                            id="username"
                            className="glass-input"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="glass-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="glass-btn login-btn"
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
