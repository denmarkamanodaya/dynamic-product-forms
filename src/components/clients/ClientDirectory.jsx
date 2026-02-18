import React, { useState, useEffect, useMemo } from 'react';
import { ClientService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faUserTie, faEnvelope, faPhone, faMapMarkerAlt,
    faPlus, faInbox, faBuilding, faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../../context/NotificationContext';
import ClientInfoStep from './ClientInfoStep';
import '../cases/MyCases.css'; // Reuse same layout CSS for consistency

const ClientDirectory = ({ onNavigate }) => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState('detail'); // 'detail' | 'create'
    const { showNotification } = useNotification();

    const [clientDetails, setClientDetails] = useState({
        clientName: '', businessName: '', taxId: '',
        email: '', mobile: '',
        address1: '', address2: '', city: '', province: '', zip: '',
        businessAddress: '',
    });

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await ClientService.list();
            let list = [];
            if (Array.isArray(response)) list = response;
            else if (response.data && Array.isArray(response.data)) list = response.data;
            else if (response.data?.data && Array.isArray(response.data.data)) list = response.data.data;
            setClients(list);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const q = searchTerm.toLowerCase();
        return clients.filter(c =>
            (c.clientName || '').toLowerCase().includes(q) ||
            (c.businessName || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
    }, [clients, searchTerm]);

    const getContactInfo = (client) => {
        let email = client.email;
        let mobile = client.phone || client.mobile;
        if (client.metadata) {
            try {
                const meta = typeof client.metadata === 'string' ? JSON.parse(client.metadata) : client.metadata;
                if (meta.contact_information) {
                    email = meta.contact_information.email || email;
                    mobile = meta.contact_information.mobile || mobile;
                }
            } catch (e) { /* ignore */ }
        }
        return { email, mobile };
    };

    const getAddress = (client) => {
        if (client.metadata) {
            try {
                const meta = typeof client.metadata === 'string' ? JSON.parse(client.metadata) : client.metadata;
                const addr = meta.address_information || {};
                const parts = [addr.address1, addr.address2, addr.city, addr.province, addr.zip].filter(Boolean);
                if (parts.length > 0) return parts.join(', ');
            } catch (e) { /* ignore */ }
        }
        return client.businessAddress || client.address || '';
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setMode('detail');
    };

    const handleNewClientClick = () => {
        setSelectedClient(null);
        setMode('create');
        setClientDetails({
            clientName: '', businessName: '', taxId: '',
            email: '', mobile: '',
            address1: '', address2: '', city: '', province: '', zip: '',
            businessAddress: '',
        });
    };

    const handleCreate = async () => {
        try {
            const compositeAddress = [
                clientDetails.address1, clientDetails.address2,
                clientDetails.city, clientDetails.province, clientDetails.zip
            ].filter(Boolean).join(', ');
            const payload = {
                ...clientDetails, businessAddress: compositeAddress,
                metadata: JSON.stringify({
                    address_information: { address1: clientDetails.address1, address2: clientDetails.address2, city: clientDetails.city, province: clientDetails.province, zip: clientDetails.zip },
                    contact_information: { email: clientDetails.email, mobile: clientDetails.mobile }
                })
            };
            const response = await ClientService.create(payload);
            if (response.data) {
                showNotification('Client created successfully!', 'success');
                setMode('detail');
                setClientDetails({ clientName: '', businessName: '', taxId: '', email: '', mobile: '', address1: '', address2: '', city: '', province: '', zip: '', businessAddress: '' });
                fetchClients();
            } else { throw new Error('Failed to create client'); }
        } catch (error) {
            console.error('Error creating client:', error);
            showNotification('Failed to create client. Please try again.', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="mycases-wrapper">
                <div className="mycases-loading"><div className="spinner"></div>Loading clients...</div>
            </div>
        );
    }

    return (
        <div className="mycases-wrapper">
            {/* ─── Column 1: Client List ─── */}
            <div className="mycases-list-panel">
                <div className="mycases-list-header">
                    <h2>
                        <FontAwesomeIcon icon={faUserTie} />
                        Clients Directory
                    </h2>
                    <div className="mycases-controls">
                        <div className="mycases-search">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="mycases-new-btn"
                            onClick={handleNewClientClick}
                        >
                            <FontAwesomeIcon icon={faPlus} /> New
                        </button>
                    </div>
                </div>

                {/* Column Headers */}
                <div className="mycases-table-header">
                    <div className="mycases-header-col col-id">Init</div>
                    <div className="mycases-header-col col-client">Client / Business</div>
                    <div className="mycases-header-col col-email">Email</div>
                    <div className="mycases-header-col col-phone" style={{ width: 120 }}>Phone</div>
                    <div className="mycases-header-col col-tax" style={{ width: 100 }}>Tax ID</div>
                </div>

                <div className="mycases-card-list">
                    {filteredClients.length === 0 ? (
                        <div className="mycases-empty">
                            <FontAwesomeIcon icon={faInbox} />
                            <p>No clients found</p>
                        </div>
                    ) : (
                        filteredClients.map(client => {
                            const isActive = selectedClient?.clientName === client.clientName;
                            const { email, mobile } = getContactInfo(client);

                            return (
                                <div
                                    key={client.clientName || Math.random()}
                                    className={`mycases-card ${isActive ? 'active' : ''}`}
                                    onClick={() => handleSelectClient(client)}
                                >
                                    <div className="mycases-row-col col-id">
                                        <span className="mycases-card-id">
                                            {(client.clientName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-client">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="mycases-card-client">{client.clientName || 'Unknown'}</span>
                                            {client.businessName && (
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    {client.businessName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mycases-row-col col-email" style={{ flex: 1.5 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{email || '—'}</span>
                                    </div>
                                    <div className="mycases-row-col col-phone" style={{ width: 120 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{mobile || '—'}</span>
                                    </div>
                                    <div className="mycases-row-col col-tax" style={{ width: 100 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            {client.taxId || '—'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredClients.length > 0 && (
                    <div className="mycases-list-count">
                        {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* ─── Column 2: Detail / Create ─── */}
            <div className="mycases-detail-panel">
                {mode === 'create' ? (
                    <div className="mycases-detail-content" style={{ maxWidth: 700 }}>
                        <ClientInfoStep
                            clientDetails={clientDetails}
                            onChange={setClientDetails}
                            onNext={handleCreate}
                            onCancel={() => setMode('detail')}
                            submitLabel="Create Client"
                        />
                    </div>
                ) : selectedClient ? (
                    <ClientDetailView
                        client={selectedClient}
                        getContactInfo={getContactInfo}
                        getAddress={getAddress}
                    />
                ) : (
                    <div className="mycases-detail-placeholder">
                        <FontAwesomeIcon icon={faUserTie} />
                        <p>Select a client to view details</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            or click <strong>+ New</strong> to create one
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Client Detail Sub-Component ─── */
const ClientDetailView = ({ client, getContactInfo, getAddress }) => {
    const { email, mobile } = getContactInfo(client);
    const address = getAddress(client);

    return (
        <div className="mycases-detail-content">
            {/* Header */}
            <div className="detail-header">
                <div className="detail-header-left">
                    <h3>{client.clientName || 'Unknown Client'}</h3>
                    {client.businessName && (
                        <span className="detail-case-id">
                            <FontAwesomeIcon icon={faBuilding} style={{ marginRight: '0.3rem' }} />
                            {client.businessName}
                        </span>
                    )}
                </div>
            </div>

            {/* Client Info */}
            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faUserTie} /> Client Information
                </h4>
                <div className="detail-client-grid">
                    <div className="detail-info-item">
                        <span className="detail-info-label">Client Name</span>
                        <span className="detail-info-value">{client.clientName || <span className="muted">—</span>}</span>
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">Business Name</span>
                        <span className="detail-info-value">{client.businessName || <span className="muted">—</span>}</span>
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faIdCard} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Tax ID
                        </span>
                        <span className="detail-info-value" style={{ fontFamily: 'monospace' }}>
                            {client.taxId || <span className="muted">—</span>}
                        </span>
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Email
                        </span>
                        <span className="detail-info-value">
                            {email ? <a href={`mailto:${email}`}>{email}</a> : <span className="muted">—</span>}
                        </span>
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                            Mobile
                        </span>
                        <span className="detail-info-value">{mobile || <span className="muted">—</span>}</span>
                    </div>
                    {address && (
                        <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                            <span className="detail-info-label">
                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '0.3rem', opacity: 0.6 }} />
                                Address
                            </span>
                            <span className="detail-info-value">{address}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDirectory;
