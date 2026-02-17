import React, { useState, useEffect } from 'react';
import { ClientService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserTie, faEnvelope, faPhone, faMapMarkerAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const ClientList = ({ onNavigate }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await ClientService.list();
            let clientList = [];
            if (Array.isArray(response)) {
                clientList = response;
            } else if (response.data && Array.isArray(response.data)) {
                clientList = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                clientList = response.data.data;
            }
            setClients(clientList);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (client.clientName || '').toLowerCase().includes(query) ||
            (client.businessName || '').toLowerCase().includes(query) ||
            (client.email || '').toLowerCase().includes(query)
        );
    });

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const getContactInfo = (client) => {
        let email = client.email;
        let mobile = client.phone || client.mobile; // existing top-level fallback

        if (client.metadata) {
            try {
                const meta = typeof client.metadata === 'string' ? JSON.parse(client.metadata) : client.metadata;
                if (meta.contact_information) {
                    email = meta.contact_information.email || email;
                    mobile = meta.contact_information.mobile || mobile;
                }
            } catch (e) {
                console.error("Failed to parse client metadata", e);
            }
        }
        return { email, mobile };
    };

    return (
        <div className="ledger-container client-list-container">
            <div className="ledger-header">
                <h2 className="page-title"><FontAwesomeIcon icon={faUserTie} /> Clients Directory</h2>
                <div className="ledger-controls">
                    <div className="search-box">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="glass-btn primary-btn" onClick={() => onNavigate('client-create')}>
                        <FontAwesomeIcon icon={faPlus} /> New Client
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    Loading clients...
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Business</th>
                                <th>Tax ID</th>
                                <th>Contact Info</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <tr key={client.clientId || client._id || Math.random()} onClick={() => console.log('View client', client)}>
                                    <td className="font-medium">{client.clientName || 'N/A'}</td>
                                    <td>
                                        <span className="business-name">{client.businessName || '-'}</span>
                                    </td>
                                    <td>
                                        <span className="tax-id">{client.taxId || '-'}</span>
                                    </td>
                                    <td>
                                        <div className="contact-stack">
                                            {(() => {
                                                const { email, mobile } = getContactInfo(client);
                                                return (
                                                    <>
                                                        {email && (
                                                            <a href={`mailto:${email}`} className="email-link" onClick={e => e.stopPropagation()}>
                                                                <FontAwesomeIcon icon={faEnvelope} className="icon-mr" />
                                                                {email}
                                                            </a>
                                                        )}
                                                        {mobile && (
                                                            <span className="phone-text">
                                                                <FontAwesomeIcon icon={faPhone} className="icon-mr" />
                                                                {mobile}
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td>
                                        {(client.businessAddress || client.address) && (
                                            <span className="address-text">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-mr" />
                                                {client.businessAddress || client.address}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">No clients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <style jsx>{`
                .ledger-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }
                .ledger-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .page-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0;
                }
                .ledger-controls {
                    display: flex;
                    gap: 1rem;
                }
                .search-box {
                    position: relative;
                    min-width: 250px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .search-box input {
                    width: 100%;
                    padding: 0 0 0 2rem;
                    border: none;
                    background: transparent;
                    color: #1e293b;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    outline: none;
                    box-shadow: none;
                    height: 100%;
                }
                .search-box input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .primary-btn {
                    /* glass-btn handles standard styles */
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                /* Table Styles matching LedgerTable */
                .table-responsive {
                    background: white;
                    border-radius: var(--radius-sm);
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .ledger-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ledger-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #e2e8f0;
                }
                .ledger-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    vertical-align: middle;
                    font-size: 0.9rem;
                }
                .ledger-table tr:last-child td {
                    border-bottom: none;
                }
                .ledger-table tr:hover {
                    background-color: #f8fafc;
                    cursor: pointer;
                }

                /* Avatar Styles */
                .avatar-cell {
                    width: 50px;
                    padding-right: 0 !important;
                }
                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #059669); /* Green for clients */
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .client-avatar {
                    background: linear-gradient(135deg, #f59e0b, #d97706); /* Orange for clients */
                }

                /* Specific Column Styles */
                .font-medium {
                    font-weight: 500;
                    color: #0f172a;
                    font-size: 0.95rem;
                }
                .business-name {
                    color: #64748b;
                    font-size: 0.9rem;
                }
                .tax-id {
                    font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
                    font-size: 0.85rem;
                    color: #64748b;
                }
                .contact-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }
                .phone-text, .address-text {
                    color: #64748b;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .text-center {
                    text-align: center;
                }
                .py-4 {
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                }

                /* Email Link */
                .email-link {
                    color: #3b82f6;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    transition: color 0.2s;
                }
                .email-link:hover {
                    color: #2563eb;
                    text-decoration: underline;
                }

                .icon-mr {
                    margin-right: 0.4rem;
                    opacity: 0.7;
                    width: 14px;
                }

                /* Loading */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    color: #64748b;
                    background: white;
                    border-radius: var(--radius-sm);
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                }
                .spinner {
                    border: 3px solid #f1f5f9;
                    border-top: 3px solid #f59e0b; /* Orange for clients */
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ClientList;
