import React from 'react';
import { currencyConfig, taxConfig } from '../../config';
import { getLicenseData } from '../../utils/license';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import './Settings.css'; // We'll reuse existing styles or create a simple one

const Settings = () => {
    const licenseData = getLicenseData();

    return (
        <div className="client-info-step">
            <div className="client-info-card">
                <div className="client-info-header">
                    <h2 className="client-info-title">
                        <FontAwesomeIcon icon={faCog} /> Settings
                    </h2>
                    <p className="client-info-subtitle">Manage your application configurations</p>
                </div>

                <div className="client-form-grid">
                    <div className="form-field full-width">
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#64748b' }}>
                            General Configuration
                        </h4>
                    </div>

                    <div className="form-field">
                        <label>Currency Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={currencyConfig.name}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Currency Code</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={currencyConfig.code}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Currency Symbol</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={currencyConfig.symbol}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Locale</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={currencyConfig.locale}
                            readOnly
                        />
                    </div>

                    <div className="form-field full-width">
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#64748b', marginTop: '1rem' }}>
                            Tax Configuration
                        </h4>
                    </div>

                    <div className="form-field">
                        <label>VAT Rate</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={`${(taxConfig.vatRate * 100).toFixed(0)}%`}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>VAT Label</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={taxConfig.vatLabel}
                            readOnly
                        />
                    </div>

                    <div className="form-field full-width">
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#64748b', marginTop: '1rem' }}>
                            License Information
                        </h4>
                    </div>

                    <div className="form-field">
                        <label>Licensed To</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={licenseData?.name || 'Unknown'}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>License Type</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={licenseData?.type || 'Unknown'}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Status</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={licenseData?.active ? 'Active' : 'Inactive'}
                            style={{ color: licenseData?.active ? '#10b981' : '#ef4444', fontWeight: 500 }}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Case Limit</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={licenseData?.limit?.case || 'Unlimited'}
                            readOnly
                        />
                    </div>

                    <div className="form-field">
                        <label>Case/History/Twit Age</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={licenseData?.limit?.data_age + ' days' || '10 days'}
                            readOnly
                        />
                    </div>

                    <div className="form-field full-width">
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                            <p><strong>Note:</strong> Configuration is currently read-only. To change these values, please contact your system administrator.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
