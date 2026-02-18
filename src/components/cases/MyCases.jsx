import React, { useState, useEffect, useMemo } from 'react';
import { CaseService } from '../../services/api';
import { currencyConfig } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFileInvoiceDollar, faUser,
    faEnvelope, faPhone, faMapMarkerAlt, faBoxOpen,
    faPen, faClipboardList, faInbox, faFilePdf, faRoute
} from '@fortawesome/free-solid-svg-icons';
import generateQuotation from '../../utils/pdf/generateQuotation';
import generateInvoice from '../../utils/pdf/generateInvoice';
import generateDeliveryReceipt from '../../utils/pdf/generateDeliveryReceipt';
import CaseJourney from './CaseJourney';
import './MyCases.css';

const MyCases = ({ currentUser, onNavigate, showAllCases = false, title = 'My Cases' }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showJourney, setShowJourney] = useState(false);

    useEffect(() => {
        const fetchMyCases = async () => {
            setIsLoading(true);
            try {
                const response = await CaseService.list();
                let allCases = [];
                if (Array.isArray(response)) {
                    allCases = response;
                } else if (response.data && Array.isArray(response.data)) {
                    allCases = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    allCases = response.data.data;
                }

                let filtered = allCases.filter(c => (c.status || '').toUpperCase() !== 'ARCHIVED');

                if (!showAllCases) {
                    filtered = filtered.filter(c => {
                        if (!c.createdBy) return false;

                        let creatorEmail = '';
                        if (typeof c.createdBy === 'string') {
                            creatorEmail = c.createdBy;
                        } else {
                            creatorEmail = c.createdBy.email || c.createdBy.emailAddress;
                        }

                        const userEmail = currentUser?.emailAddress || currentUser?.email;
                        return creatorEmail === userEmail;
                    });
                }

                setCases(filtered);
            } catch (error) {
                console.error("Error fetching my cases:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (showAllCases || currentUser) {
            fetchMyCases();
        }
    }, [currentUser, showAllCases]);

    const filteredCases = useMemo(() => {
        let filtered = [...cases];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(c => {
                const clientName = (c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || '').toLowerCase();
                const caseId = (c.caseId || c._id || '').toLowerCase();
                return clientName.includes(lowerTerm) || caseId.includes(lowerTerm);
            });
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => (c.status || '').toLowerCase() === statusFilter.toLowerCase());
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return filtered;
    }, [cases, searchTerm, statusFilter]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(currencyConfig.locale, {
            style: 'currency', currency: currencyConfig.code
        }).format(amount || 0);
    };

    const getContactInfo = (clientDetails) => {
        let email = clientDetails?.email || '';
        let mobile = clientDetails?.mobile || clientDetails?.phone || '';

        if (clientDetails?.metadata) {
            try {
                const meta = typeof clientDetails.metadata === 'string'
                    ? JSON.parse(clientDetails.metadata)
                    : clientDetails.metadata;
                if (meta.contact_information) {
                    email = meta.contact_information.email || email;
                    mobile = meta.contact_information.mobile || mobile;
                }
            } catch (e) { /* ignore */ }
        }
        return { email, mobile };
    };

    const getAddress = (clientDetails) => {
        if (!clientDetails) return '';

        // Try composite fields first
        const parts = [
            clientDetails.address1,
            clientDetails.address2,
            clientDetails.city,
            clientDetails.province,
            clientDetails.zip
        ].filter(Boolean);

        if (parts.length > 0) return parts.join(', ');

        // Fallback to businessAddress
        return clientDetails.businessAddress || '';
    };

    const handleEditCase = (caseId) => {
        window.location.href = `?caseId=${caseId}`;
    };

    // ─── Render ───

    if (isLoading) {
        return (
            <div className="mycases-wrapper">
                <div className="mycases-loading" style={{ width: '100%' }}>
                    <div className="spinner"></div>
                    <p>Loading your cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mycases-wrapper">
            {/* ─── Column 1: Case List ─── */}
            <div className="mycases-list-panel">
                <div className="mycases-list-header">
                    <h2>
                        <FontAwesomeIcon icon={faClipboardList} />
                        {title}
                    </h2>
                    <div className="mycases-controls">
                        <div className="mycases-search">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search client or case..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="mycases-filter">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="quotation">Quotation</option>
                                <option value="approved">Approved</option>
                                <option value="invoicing">Invoicing</option>
                                <option value="delivery">Delivery</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Column Headers */}
                <div className="mycases-table-header">
                    <div className="mycases-header-col col-status">S</div>
                    <div className="mycases-header-col col-id">ID</div>
                    <div className="mycases-header-col col-client">Client / Case</div>
                    <div className="mycases-header-col col-amount">Total</div>

                    {/* <div className="mycases-header-col col-date">Date</div> */}
                    <div className="mycases-header-col col-lead">Lead</div>
                    <div className="mycases-header-col col-meta">Items</div>
                    <div className="mycases-header-col col-user">User</div>
                </div>

                <div className="mycases-card-list">
                    {filteredCases.length === 0 ? (
                        <div className="mycases-empty">
                            <FontAwesomeIcon icon={faInbox} />
                            <p>No cases found</p>
                        </div>
                    ) : (
                        filteredCases.map(c => {
                            const clientName = c.data?.clientDetails?.clientName
                                || c.data?.clientDetails?.businessName
                                || 'Unknown';
                            const isActive = selectedCase?.caseId === c.caseId;

                            return (
                                <div
                                    key={c.caseId || c._id}
                                    className={`mycases-card ${isActive ? 'active' : ''}`}
                                    onClick={() => setSelectedCase(c)}
                                >
                                    <div className="mycases-row-col col-status">
                                        <span className={`status-badge-compact status-${(c.status || 'unknown').toLowerCase()}`} title={c.status || 'Unknown'}>
                                            <span className="dot"></span>
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-id">
                                        <span className="mycases-card-id">
                                            #{(c.caseId || c._id || '').slice(-4).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-client">
                                        <span className="mycases-card-client" title={clientName}>{clientName}</span>
                                    </div>
                                    <div className="mycases-row-col col-amount">
                                        <span className="mycases-card-amount">
                                            {formatCurrency(c.data?.grandTotal)}
                                        </span>
                                    </div>

                                    {/* <div className="mycases-row-col col-date">
                                        <span className="mycases-card-date">{formatDate(c.createdAt)}</span>
                                    </div> */}
                                    <div className="mycases-row-col col-lead">
                                        <span className="mycases-card-items" title={c.data?.orderDetails?.leadTime}>{c.data?.orderDetails?.leadTime || '—'}</span>
                                    </div>
                                    <div className="mycases-row-col col-meta">
                                        <span className="mycases-card-items">
                                            {c.data?.products?.length || 0} item{(c.data?.products?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="mycases-row-col col-user">
                                        {c.createdBy && (
                                            <div className="row-user-avatar" title={typeof c.createdBy === 'object' ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : c.createdBy}>
                                                {typeof c.createdBy === 'object' ? (() => {
                                                    let customStyle = { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' };
                                                    try {
                                                        const meta = typeof c.createdBy.metadata === 'string' ? JSON.parse(c.createdBy.metadata || '{}') : (c.createdBy.metadata || {});
                                                        if (meta.avatarColor) {
                                                            customStyle = { backgroundColor: meta.avatarColor, backgroundImage: 'none' };
                                                        }
                                                    } catch (e) { }
                                                    return (
                                                        <span className="avatar-circle" style={customStyle}>
                                                            {(c.createdBy.firstName?.[0] || '') + (c.createdBy.lastName?.[0] || '')}
                                                        </span>
                                                    );
                                                })() : <span className="avatar-circle">?</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredCases.length > 0 && (
                    <div className="mycases-list-count">
                        {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* ─── Column 2: Detail Panel ─── */}
            <div className="mycases-detail-panel">
                {!selectedCase ? (
                    <div className="mycases-detail-placeholder">
                        <FontAwesomeIcon icon={faFileInvoiceDollar} />
                        <p>Select a case to view details</p>
                    </div>
                ) : (
                    <CaseDetailView
                        caseData={selectedCase}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        getContactInfo={getContactInfo}
                        getAddress={getAddress}
                        onEdit={handleEditCase}
                        onViewJourney={() => setShowJourney(true)}
                    />
                )}
            </div>
            {showJourney && selectedCase && (
                <CaseJourney
                    caseId={selectedCase.caseId || selectedCase._id}
                    onClose={() => setShowJourney(false)}
                />
            )}
        </div>
    );
};

/* ─── Case Detail Sub-Component ─── */
const CaseDetailView = ({ caseData, formatDate, formatCurrency, getContactInfo, getAddress, onEdit, onViewJourney }) => {
    const client = caseData.data?.clientDetails || {};
    const products = caseData.data?.products || [];
    const order = caseData.data?.orderDetails || {};
    const vat = caseData.data?.vatDetails || {};
    const { email, mobile } = getContactInfo(client);
    const address = getAddress(client);
    const status = (caseData.status || '').toLowerCase();

    const handlePDF = (type) => {
        const caseId = caseData.caseId || caseData._id;
        const grandTotalFn = () => (caseData.data?.grandTotal || 0).toFixed(2);

        if (type === 'quotation') {
            generateQuotation(caseId, client, order, products, grandTotalFn);
        } else if (type === 'invoice') {
            generateInvoice(caseId, client, order, products, grandTotalFn);
        } else if (type === 'delivery_receipt') {
            generateDeliveryReceipt(caseId, client, order, products, grandTotalFn);
        }
    };

    return (
        <div className="mycases-detail-content">
            {/* Header */}
            <div className="detail-header">
                <div className="detail-header-left">
                    <h3>{client.clientName || client.businessName || 'Unknown Client'}</h3>
                    <span className="detail-case-id">
                        Case #{(caseData.caseId || '').slice(-4).toUpperCase()} • {formatDate(caseData.createdAt)}
                    </span>
                </div>
                <div className="detail-header-right">
                    <span className={`status-badge status-${(caseData.status || 'unknown').toLowerCase()}`}>
                        {caseData.status || 'Unknown'}
                    </span>
                </div>
            </div>

            {/* Client Info */}
            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faUser} /> Client Information
                </h4>
                <div className="detail-client-grid">
                    <div className="detail-info-item">
                        <span className="detail-info-label">Client Name</span>
                        <span className="detail-info-value">{client.clientName || <span className="muted">—</span>}</span>
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">Business</span>
                        <span className="detail-info-value">{client.businessName || <span className="muted">—</span>}</span>
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

            {/* Products */}
            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faBoxOpen} /> Products ({products.length})
                </h4>
                {products.length > 0 ? (
                    <div className="detail-products-table-wrapper">
                        <table className="detail-products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                    <th style={{ textAlign: 'right' }}>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, i) => (
                                    <tr key={i}>
                                        <td className="product-name">{p.name || 'Unnamed'}</td>
                                        <td className="product-qty">{p.quantity || 0}</td>
                                        <td className="product-price" style={{ textAlign: 'right' }}>{formatCurrency(p.price)}</td>
                                        <td className="product-price">{formatCurrency(p.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.5rem 0' }}>No products added.</p>
                )}
            </div>

            {/* Order Summary */}
            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} /> Order Summary
                </h4>
                <div className="detail-summary-grid">
                    <div className="detail-summary-item">
                        <span className="detail-summary-label">Grand Total</span>
                        <span className="detail-summary-value grand-total">
                            {formatCurrency(caseData.data?.grandTotal)}
                        </span>
                    </div>
                    <div className="detail-summary-item">
                        <span className="detail-summary-label">VAT</span>
                        <span className="detail-summary-value">
                            {vat.included ? `${formatCurrency(vat.amount)} (${(vat.rate * 100).toFixed(0)}%)` : 'Not Included'}
                        </span>
                    </div>
                    <div className="detail-summary-item">
                        <span className="detail-summary-label">Lead Time</span>
                        <span className="detail-summary-value">{order.leadTime || '—'}</span>
                    </div>
                    <div className="detail-summary-item">
                        <span className="detail-summary-label">Terms</span>
                        <span className="detail-summary-value">{order.terms || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Actions — status-specific controls matching ProductList logic */}
            <div className="detail-actions">
                {status === 'completed' ? (
                    <>
                        <button
                            className="glass-btn primary-gradient"
                            onClick={onViewJourney}
                            style={{ marginRight: 'auto' }}
                        >
                            <FontAwesomeIcon icon={faRoute} /> View Journey
                        </button>
                        <button className="glass-btn" onClick={() => handlePDF('quotation')}>
                            <FontAwesomeIcon icon={faFilePdf} /> Quotation
                        </button>
                        <button className="glass-btn" onClick={() => handlePDF('invoice')}>
                            <FontAwesomeIcon icon={faFilePdf} /> Invoice
                        </button>
                        <button className="glass-btn" onClick={() => handlePDF('delivery_receipt')}>
                            <FontAwesomeIcon icon={faFilePdf} /> DR
                        </button>
                    </>
                ) : status === 'delivery' ? (
                    <button className="glass-btn" onClick={() => handlePDF('delivery_receipt')}>
                        <FontAwesomeIcon icon={faFilePdf} /> Download Delivery Receipt
                    </button>
                ) : status === 'invoicing' ? (
                    <button className="glass-btn" onClick={() => handlePDF('invoice')}>
                        <FontAwesomeIcon icon={faFilePdf} /> Download Invoice
                    </button>
                ) : status === 'approved' ? (
                    <button className="glass-btn" onClick={() => handlePDF('quotation')}>
                        <FontAwesomeIcon icon={faFilePdf} /> Download Quotation
                    </button>
                ) : (
                    <button
                        className="btn-edit-case"
                        onClick={() => onEdit(caseData.caseId || caseData._id)}
                    >
                        <FontAwesomeIcon icon={faPen} />
                        Edit Case
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyCases;
