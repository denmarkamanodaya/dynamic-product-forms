import React, { useState, useEffect, useMemo } from 'react';
import endpoints, { currencyConfig } from '../config';
import './LedgerTable.css'; // Reusing LedgerTable styles for consistency
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBriefcase,
    faEye,
    faSort,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';

const MyCases = ({ currentUser }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    useEffect(() => {
        const fetchMyCases = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(endpoints.caseList);
                if (!response.ok) {
                    throw new Error('Failed to fetch cases');
                }
                const result = await response.json();

                // Filter for cases created by current user
                const myCases = result.data.filter(c =>
                    c.createdBy && c.createdBy.email === currentUser?.emailAddress
                );

                setCases(myCases);
            } catch (error) {
                console.error("Error fetching my cases:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchMyCases();
        }
    }, [currentUser]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    };

    const sortedAndFilteredCases = useMemo(() => {
        let filtered = [...cases];

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.caseId.toLowerCase().includes(term) ||
                (c.data?.clientDetails?.clientName || '').toLowerCase().includes(term) ||
                (c.data?.clientDetails?.businessName || '').toLowerCase().includes(term)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'createdAt':
                        aValue = new Date(a.createdAt || 0);
                        bValue = new Date(b.createdAt || 0);
                        break;
                    case 'caseId':
                        aValue = (a.caseId || '').slice(-4);
                        bValue = (b.caseId || '').slice(-4);
                        break;
                    case 'clientName':
                        aValue = (a.data?.clientDetails?.clientName || a.data?.clientDetails?.businessName || '').toLowerCase();
                        bValue = (b.data?.clientDetails?.clientName || b.data?.clientDetails?.businessName || '').toLowerCase();
                        break;
                    case 'status':
                        aValue = (a.status || '').toLowerCase();
                        bValue = (b.status || '').toLowerCase();
                        break;
                    case 'amount':
                        aValue = parseFloat(a.data?.grandTotal || 0);
                        bValue = parseFloat(b.data?.grandTotal || 0);
                        break;
                    case 'leadTime':
                        aValue = new Date(a.data?.orderDetails?.leadTime || 0);
                        bValue = new Date(b.data?.orderDetails?.leadTime || 0);
                        break;
                    default:
                        aValue = 0;
                        bValue = 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [cases, searchTerm, statusFilter, sortConfig]);

    const getStatusClass = (status) => {
        // Updated to match LedgerTable status classes more closely if needed, 
        // or strictly follow existing MyCases logic if it was already correct.
        // LedgerTable uses `status-${status.toLowerCase()}` which maps to CSS.
        // MyCases had a switch. Let's stick to the switch for safety or ensure css matches.
        // LedgerTable CSS has specific classes like .status-quotation.
        switch (status) {
            case 'quotation': return 'status-quotation';
            case 'approved': return 'status-approved';
            case 'invoicing': return 'status-invoicing';
            case 'delivery': return 'status-delivery';
            case 'completed': return 'status-completed';
            case 'deleted': return 'status-deleted';
            default: return 'status-unknown';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(currencyConfig.locale, {
            style: 'currency',
            currency: currencyConfig.code
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleActionClick = (caseId) => {
        window.location.href = `?caseId=${caseId}`;
    };

    return (
        <div className="ledger-container dashboard-widget" style={{ margin: '0 auto', maxWidth: '100%', width: '100%' }}>

            <div className="dashboard-header">
                <h3 className="dashboard-title">
                    <FontAwesomeIcon icon={faBriefcase} /> My Cases
                </h3>
            </div>

            <div className="ledger-controls">
                <div className="search-box">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Case ID or Client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="quotation">Quotation</option>
                        <option value="approved">Approved</option>
                        <option value="invoicing">Invoicing</option>
                        <option value="delivery">Delivery</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="ledger-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('createdAt')}>
                                Date <FontAwesomeIcon icon={getSortIcon('createdAt')} className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('caseId')}>
                                Case # <FontAwesomeIcon icon={getSortIcon('caseId')} className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('clientName')}>
                                Client <FontAwesomeIcon icon={getSortIcon('clientName')} className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('status')}>
                                Status <FontAwesomeIcon icon={getSortIcon('status')} className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('amount')}>
                                Amount <FontAwesomeIcon icon={getSortIcon('amount')} className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('leadTime')}>
                                Lead Time <FontAwesomeIcon icon={getSortIcon('leadTime')} className="sort-icon" />
                            </th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '3rem' }}>
                                    Loading cases...
                                </td>
                            </tr>
                        ) : sortedAndFilteredCases.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                                    No cases found.
                                </td>
                            </tr>
                        ) : (
                            sortedAndFilteredCases.map(c => (
                                <tr key={c.caseId}>
                                    <td>{formatDate(c.createdAt)}</td>
                                    <td className="font-mono">
                                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                                            {(c.caseId || '').slice(-4).toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="font-medium">
                                            {c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || 'Unknown'}
                                        </div>
                                        {c.data?.clientDetails?.businessName && c.data.clientDetails.clientName && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {c.data.clientDetails.businessName}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="text-right text-money">
                                        {formatCurrency(c.data?.grandTotal || 0)}
                                    </td>
                                    <td>
                                        {c.data?.orderDetails?.leadTime || 'N/A'}
                                    </td>
                                    <td className="text-right">
                                        <button
                                            className="glass-btn secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                            onClick={() => handleActionClick(c.caseId)}
                                        >
                                            <FontAwesomeIcon icon={faEye} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-info" style={{ marginTop: '1rem', textAlign: 'center' }}>
                Showing {sortedAndFilteredCases.length} records
            </div>
        </div>
    );
};

export default MyCases;
