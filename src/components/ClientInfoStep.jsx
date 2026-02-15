import React, { useState } from 'react';
import './ClientInfoStep.css';

const ClientInfoStep = ({ clientDetails, onChange, onNext, submitLabel = 'Continue to Products →' }) => {
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
                </div>

                <div className="step-actions">
                    <button
                        className="continue-btn"
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
