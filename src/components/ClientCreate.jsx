import React, { useState } from 'react';
import ClientInfoStep from './ClientInfoStep';
import { endpoints } from '../config';

const ClientCreate = ({ onNavigate }) => {
    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        businessName: '',
        taxId: '',
        businessAddress: '',
    });
    const [notification, setNotification] = useState(null);

    const handleCreate = async () => {
        try {
            const response = await fetch(endpoints.clientCreate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientDetails)
            });

            if (!response.ok) {
                throw new Error('Failed to create client');
            }

            // Success
            setNotification({ type: 'success', message: 'Client created successfully!' });

            // Reset form
            setClientDetails({
                clientName: '',
                businessName: '',
                taxId: '',
                businessAddress: '',
            });

            // Optional: Redirect to list or dashboard after a delay? 
            // For now, let's just show success and stay here or let user navigate.

        } catch (error) {
            console.error('Error creating client:', error);
            setNotification({ type: 'error', message: 'Failed to create client. Please try again.' });
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {notification && (
                <div className={`notification ${notification.type}`} style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    backgroundColor: notification.type === 'success' ? '#def7ec' : '#fde8e8',
                    color: notification.type === 'success' ? '#03543f' : '#9b1c1c',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {notification.message}
                    <button
                        onClick={() => setNotification(null)}
                        style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Reuse ClientInfoStep but hijack onNext to be our submit handler */}
            {/* We also need to hide the "Continue to Products" text if possible, or override the button text? 
               ClientInfoStep hardcodes "Continue to Products". 
               We might need to modify ClientInfoStep to accept custom button text or children.
               OR just accept it says "Continue..." for now. 
               Wait, let's look at ClientInfoStep again. It has hardcoded text.
               Maybe we should update ClientInfoStep to allow button text customization.
            */}
            <ClientInfoStep
                clientDetails={clientDetails}
                onChange={setClientDetails}
                onNext={handleCreate}
                onCancel={() => onNavigate('list')}
                submitLabel="Create Client"
            />
        </div>
    );
};

export default ClientCreate;
