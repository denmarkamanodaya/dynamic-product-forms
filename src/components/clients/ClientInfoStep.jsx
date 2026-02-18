import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faBuilding, faEnvelope, faPhone, faIdCard, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import './ClientInfoStep.css';
import PHILIPPINES_PROVINCES from '../../utils/philippines_provinces';

const ClientInfoStep = ({ clientDetails, onChange, onNext, onCancel, submitLabel = 'Continue to Products →' }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field, value) => {
        onChange({ ...clientDetails, [field]: value });
    };

    const validateAndProceed = async () => {
        // Validation: At least client name or business name required
        if (!clientDetails.clientName.trim() && !clientDetails.businessName.trim()) {
            alert('Please provide at least a Client Name or Business Name');
            return;
        }

        setIsSubmitting(true);
        try {
            await onNext();
        } catch (error) {
            console.error("Error proceeding to next step:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mycases-detail-content">
            <div className="detail-header">
                <div className="detail-header-left">
                    <h3 style={{ margin: 0 }}>Client Information</h3>
                    <span className="detail-case-id" style={{ fontFamily: 'inherit' }}>
                        Please provide the client details to get started
                    </span>
                </div>
            </div>

            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faUser} /> Client Information
                </h4>
                <div className="detail-client-grid">
                    <div className="detail-info-item">
                        <span className="detail-info-label">Client Name</span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter client name"
                            value={clientDetails.clientName}
                            onChange={(e) => handleChange('clientName', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">Business Name</span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter business name"
                            value={clientDetails.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faIdCard} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Tax ID
                        </span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter tax ID"
                            value={clientDetails.taxId}
                            onChange={(e) => handleChange('taxId', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Email Address
                        </span>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Enter email address"
                            value={clientDetails.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Mobile Number
                        </span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter mobile number"
                            value={clientDetails.mobile}
                            onChange={(e) => handleChange('mobile', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faBuilding} /> Address Information
                </h4>
                <div className="detail-client-grid">
                    <div className="detail-info-item" style={{ gridColumn: 'span 2' }}>
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Address Line 1
                        </span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Unit, Building, Street Name"
                            value={clientDetails.address1}
                            onChange={(e) => handleChange('address1', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item" style={{ gridColumn: 'span 2' }}>
                        <span className="detail-info-label">Address Line 2 (Optional)</span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Village, Subdivision, Barangay"
                            value={clientDetails.address2}
                            onChange={(e) => handleChange('address2', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">City/Municipality</span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter city"
                            value={clientDetails.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">Province</span>
                        <select
                            className="glass-input"
                            value={clientDetails.province}
                            onChange={(e) => handleChange('province', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        >
                            <option value="">Select Province</option>
                            {PHILIPPINES_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                    </div>

                    <div className="detail-info-item">
                        <span className="detail-info-label">Zip/Postcode</span>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter zip code"
                            value={clientDetails.zip}
                            onChange={(e) => handleChange('zip', e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>
                </div>
            </div>

            <div className="detail-actions">
                {onCancel && (
                    <button
                        className="btn-edit-case"
                        style={{ background: '#e2e8f0', color: '#475569', boxShadow: 'none' }}
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    className="btn-edit-case"
                    onClick={validateAndProceed}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : submitLabel}
                </button>
            </div>
        </div>
    );
};

export default ClientInfoStep;
