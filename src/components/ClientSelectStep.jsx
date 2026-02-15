import React, { useState, useEffect } from 'react';
import './ClientSelectStep.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import endpoints from '../config';

const ClientSelectStep = ({ onClientSelect, onManualInput }) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(endpoints.clientList);
                if (!response.ok) {
                    throw new Error('Failed to fetch clients');
                }
                const result = await response.json();

                // Assuming the API returns { data: [...] } or just [...]
                // Adjusting based on common patterns, but will log to be sure
                console.log('Client list API result:', result);

                // Handle different response structures gracefully
                const clientList = Array.isArray(result) ? result :
                    (result.data && Array.isArray(result.data)) ? result.data : [];

                setClients(clientList);
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
        // Convert both to strings for comparison to avoid type mismatches
        const client = clients.find(c =>
            String(c.clientId) === String(selectedClient) ||
            String(c.id) === String(selectedClient) ||
            String(c._id) === String(selectedClient)
        );
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
                                {clients.map((client) => (
                                    <option
                                        key={client.clientId || client.id || client._id}
                                        value={client.clientId || client.id || client._id}
                                    >
                                        {client.clientName || client.businessName || 'Unnamed Client'}
                                    </option>
                                ))}
                            </select>
                            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
                        </div>
                    )}

                    {!isLoading && (
                        <>
                            <button
                                className="action-btn"
                                onClick={handleContinue}
                                disabled={!selectedClient}
                            >
                                Use Selected Client
                            </button>

                            <div className="divider">OR</div>

                            <button
                                className="manual-btn"
                                onClick={onManualInput}
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> Enter Details Manually
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientSelectStep;
