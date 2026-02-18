import React, { useState } from 'react';
import { currencyConfig, taxConfig } from '../../config';
import { getLicenseData } from '../../utils/license';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog, faGlobe, faReceipt, faIdCard,
    faChevronRight, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import '../cases/MyCases.css';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const licenseData = getLicenseData();

    const tabs = [
        { id: 'general', label: 'General Configuration', icon: faGlobe },
        { id: 'tax', label: 'Tax Configuration', icon: faReceipt },
        { id: 'license', label: 'License Information', icon: faIdCard },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="settings-tab-pane">
                        <div className="detail-section">
                            <h4 className="detail-section-title">
                                <FontAwesomeIcon icon={faGlobe} /> General Configuration
                            </h4>
                            <div className="detail-client-grid">
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Currency Name</span>
                                    <input type="text" className="glass-input" value={currencyConfig.name} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Currency Code</span>
                                    <input type="text" className="glass-input" value={currencyConfig.code} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Currency Symbol</span>
                                    <input type="text" className="glass-input" value={currencyConfig.symbol} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Locale</span>
                                    <input type="text" className="glass-input" value={currencyConfig.locale} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'tax':
                return (
                    <div className="settings-tab-pane">
                        <div className="detail-section">
                            <h4 className="detail-section-title">
                                <FontAwesomeIcon icon={faReceipt} /> Tax Configuration
                            </h4>
                            <div className="detail-client-grid">
                                <div className="detail-info-item">
                                    <span className="detail-info-label">VAT Rate</span>
                                    <input type="text" className="glass-input" value={`${(taxConfig.vatRate * 100).toFixed(0)}%`} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">VAT Label</span>
                                    <input type="text" className="glass-input" value={taxConfig.vatLabel} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'license':
                return (
                    <div className="settings-tab-pane">
                        <div className="detail-section">
                            <h4 className="detail-section-title">
                                <FontAwesomeIcon icon={faIdCard} /> License Information
                            </h4>
                            <div className="detail-client-grid">
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Licensed To</span>
                                    <input type="text" className="glass-input" value={licenseData?.name || 'Unknown'} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">License Type</span>
                                    <input type="text" className="glass-input" value={licenseData?.type || 'Unknown'} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Status</span>
                                    <input
                                        type="text"
                                        className={`glass-input settings-license-status ${licenseData?.active ? 'is-active' : 'is-inactive'}`}
                                        value={licenseData?.active ? 'Active' : 'Inactive'}
                                        readOnly
                                    />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Case Limit</span>
                                    <input type="text" className="glass-input" value={licenseData?.limit?.case || 'Unlimited'} readOnly />
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Data Retention</span>
                                    <input type="text" className="glass-input" value={licenseData?.limit?.data_age + ' days' || '10 days'} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mycases-wrapper">
            {/* 1st Column: Tabs and Settings Data */}
            <div className="mycases-list-panel settings-panel">
                <div className="mycases-list-header">
                    <h2>
                        <FontAwesomeIcon icon={faCog} />
                        Settings
                    </h2>
                    <p className="settings-subtitle">
                        Manage your application configurations and license
                    </p>
                </div>

                <div className="settings-container">
                    {/* CSS-style Tabs */}
                    <div className="settings-tabs-list">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`settings-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <div className="tab-label-group">
                                    <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
                                    <span>{tab.label}</span>
                                </div>
                                <FontAwesomeIcon icon={faChevronRight} className="tab-arrow" />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="settings-active-content">
                        {renderTabContent()}

                        <div className="settings-footer-note">
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <p>Configuration is currently read-only. Contact admin for changes.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2nd Column: Blank for now */}
            <div className="mycases-detail-panel">
                <div className="mycases-detail-placeholder">
                    <FontAwesomeIcon icon={faCog} className="settings-placeholder-icon" />
                    <p>Settings Module</p>
                    <p className="settings-placeholder-hint">
                        Select a category on the left to manage settings
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
