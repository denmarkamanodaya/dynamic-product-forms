import { useNotification } from '../context/NotificationContext';
import React, { useState } from 'react';
import ClientInfoStep from './ClientInfoStep';
import { ClientService } from '../services/api';

const ClientCreate = ({ onNavigate }) => {
    const { showNotification } = useNotification();
    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        businessName: '',
        taxId: '',
        email: '',
        mobile: '',
        address1: '',
        address2: '',
        city: '',
        province: '',
        zip: '',
        businessAddress: '', // Keeping for backward compatibility or display fallback
    });

    const handleCreate = async () => {
        try {
            // Construct composite address
            const compositeAddress = [
                clientDetails.address1,
                clientDetails.address2,
                clientDetails.city,
                clientDetails.province,
                clientDetails.zip
            ].filter(Boolean).join(', ');

            // Prepare payload with metadata
            const payload = {
                ...clientDetails,
                businessAddress: compositeAddress, // Overwrite with composite
                metadata: JSON.stringify({
                    address_information: {
                        address1: clientDetails.address1,
                        address2: clientDetails.address2,
                        city: clientDetails.city,
                        province: clientDetails.province,
                        zip: clientDetails.zip
                    },
                    contact_information: {
                        email: clientDetails.email,
                        mobile: clientDetails.mobile
                    }
                })
            };

            const response = await ClientService.create(payload);

            if (response.data) {
                // Success
                showNotification('Client created successfully!', 'success');
            } else {
                throw new Error('Failed to create client');
            }

            // Success (redundant logic in original, cleaned up here)

            // Reset form
            setClientDetails({
                clientName: '',
                businessName: '',
                taxId: '',
                email: '',
                mobile: '',
                address1: '',
                address2: '',
                city: '',
                province: '',
                zip: '',
                businessAddress: '',
            });

            // Optional: Redirect to list or dashboard after a delay? 
            // For now, let's just show success and stay here or let user navigate.

        } catch (error) {

            console.error('Error creating client:', error);
            showNotification('Failed to create client. Please try again.', 'error');
        }
    };

    return (
        <div style={{ position: 'relative' }}>

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
