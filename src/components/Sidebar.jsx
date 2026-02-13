import React from 'react';
import './Sidebar.css';
import logo from '../assets/firetron-logo.png';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <img src={logo} alt="Firetron Logo" className="sidebar-logo" />
            </div>

            <div className="sidebar-search">
                <div className="search-wrapper">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <button className="search-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <h3 className="nav-group-title">Main Menu</h3>
                    <ul className="nav-list">
                        <li><a href="javascript:void(0)" className="nav-item active">Dashboard</a></li>
                        <li><a href="javascript:void(0)" className="nav-item">Products Manager</a></li>
                        <li><a href="javascript:void(0)" className="nav-item">Clients</a></li>
                        <li><a href="javascript:void(0)" className="nav-item">Orders</a></li>
                    </ul>
                </div>

                <div className="nav-group">
                    <h3 className="nav-group-title">Account</h3>
                    <ul className="nav-list">
                        <li><a href="javascript:void(0)" className="nav-item">Profile</a></li>
                        <li><a href="javascript:void(0)" className="nav-item">Settings</a></li>
                        <li><a href="javascript:void(0)" className="nav-item">Login</a></li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
