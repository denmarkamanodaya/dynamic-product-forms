import React, { useState, useEffect } from 'react';
import './ClientSelectStep.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import endpoints from '../config';
import { ClientService } from '../services/api';

const ClientSelectStep = ({ onClientSelect, onManualInput }) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const response = await ClientService.list();
                if (response.data) {
                    // Normalize data structure
                    const clientList = Array.isArray(response.data) ? response.data :
                        (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];

                    setClients(clientList);
                } else {
                    throw new Error('Invalid data');
                }
            } catch (err) {
                console.error('Error fetching clients:', err);
                setError('Could not load client list. Please enter details manually.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleContinue = () => {
        if (!selectedClient) return;

        // Convert both to strings for comparison to avoid type mismatches
        const client = clients.find(c => {
            const id = c.clientId || c.id || c._id || c.PK;
            return String(id) === String(selectedClient);
        });

        if (client) {
            onClientSelect(client);
        }
    };

    return (
        <div className="client-select-step">
            <div className="step-card">
                <div className="step-header">
                    <h2 className="step-title">Select Client</h2>
                    <p className="step-subtitle">Choose an existing client or enter details manually</p>
                </div>

                <div className="selection-area">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading clients...</p>
                        </div>
                    ) : (
                        <div className="dropdown-container">
                            <label>Existing Client</label>
                            <select
                                className="client-dropdown"
                                value={selectedClient}
                                onChange={(e) => {
                                    console.log("Selected value:", e.target.value);
                                    setSelectedClient(e.target.value);
                                }}
                                disabled={clients.length === 0}
                            >
                                <option value="" disabled>
                                    {clients.length === 0 ? "No clients found" : "Select a client..."}
                                </option>
                                {clients.map((client) => {
                                    const id = client.clientId || client.id || client._id || client.PK;
                                    return (
                                        <option
                                            key={id}
                                            value={id}
                                        >
                                            {client.clientName || client.businessName || 'Unnamed Client'}
                                        </option>
                                    );
                                })}
                            </select>
                            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
                        </div>
                    )}

                    {!isLoading && (
                        <div className="button-group">
                            <button
                                className="glass-btn"
                                onClick={handleContinue}
                                disabled={!selectedClient}
                            >
                                Use Selected Client
                            </button>

                            <span className="divider-text">- OR -</span>

                            <button
                                className="glass-btn secondary"
                                onClick={onManualInput}
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> Enter Details Manually
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientSelectStep;
