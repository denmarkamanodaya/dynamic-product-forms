import React from 'react';
import './ClientInfoStep.css';

const ClientInfoStep = ({ clientDetails, onChange, onNext }) => {
    const handleChange = (field, value) => {
        onChange({ ...clientDetails, [field]: value });
    };

    const validateAndProceed = () => {
        // Validation: At least client name or business name required
        if (!clientDetails.clientName.trim() && !clientDetails.businessName.trim()) {
            alert('Please provide at least a Client Name or Business Name');
            return;
        }
        onNext();
    };

    return (
        <div className="client-info-step">
            <div className="step-card">
                <div className="step-header">
                    <h2 className="step-title">Client Information</h2>
                    <p className="step-subtitle">Please provide the client details to get started</p>
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
                        <label>Tax Identity Number</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter tax ID"
                            value={clientDetails.taxId}
                            onChange={(e) => handleChange('taxId', e.target.value)}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Business Address</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter business address"
                            value={clientDetails.businessAddress}
                            onChange={(e) => handleChange('businessAddress', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>Date</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={clientDetails.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label>No. of Terms (Days)</label>
                        <input
                            type="number"
                            className="glass-input"
                            placeholder="e.g., 30"
                            value={clientDetails.terms}
                            onChange={(e) => handleChange('terms', e.target.value)}
                        />
                    </div>
                </div>

                <div className="step-actions">
                    <button className="continue-btn" onClick={validateAndProceed}>
                        Continue to Products →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientInfoStep;
