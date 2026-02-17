import React, { useState } from 'react';
import './ClientInfoStep.css';
import PHILIPPINES_PROVINCES from '../utils/philippines_provinces';

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
        <div className="client-info-step">
            <div className="client-info-card">
                <div className="client-info-header">
                    <h2 className="client-info-title">Client Information</h2>
                    <p className="client-info-subtitle">Please provide the client details to get started</p>
                </div>

                <div className="client-form-grid">
                    <div className="form-field">
                        <label>Client Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter client name"
                            value={clientDetails.clientName}
                            onChange={(e) => handleChange('clientName', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Business Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter business name"
                            value={clientDetails.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Enter email address"
                            value={clientDetails.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Mobile Number</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter mobile number"
                            value={clientDetails.mobile}
                            onChange={(e) => handleChange('mobile', e.target.value)}
                        />

                        <div className="form-field">
                            <label>Tax Identity Number</label>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Enter tax ID"
                                value={clientDetails.taxId}
                                onChange={(e) => handleChange('taxId', e.target.value)}
                            />
                        </div>

                    </div>

                    <div className="form-field">
                        <label>Address Line 1</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Unit, Building, Street Name"
                            value={clientDetails.address1}
                            onChange={(e) => handleChange('address1', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Address Line 2 (Optional)</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Village, Subdivision, Barangay"
                            value={clientDetails.address2}
                            onChange={(e) => handleChange('address2', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>City/Municipality</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter city"
                            value={clientDetails.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Province</label>
                        <select
                            className="glass-input"
                            value={clientDetails.province}
                            onChange={(e) => handleChange('province', e.target.value)}
                        >
                            <option value="">Select Province</option>
                            {PHILIPPINES_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Zip/Postcode</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter zip code"
                            value={clientDetails.zip}
                            onChange={(e) => handleChange('zip', e.target.value)}
                        />
                    </div>
                </div>

                <div className="step-actions">
                    {onCancel && (
                        <button
                            className="glass-btn secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            style={{ marginRight: '1rem' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        className="glass-btn"
                        onClick={validateAndProceed}
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
                    >
                        {isSubmitting ? 'Processing...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientInfoStep;
