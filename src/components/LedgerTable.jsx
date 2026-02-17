import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faFileInvoiceDollar, faSort, faSortUp, faSortDown, faEye } from '@fortawesome/free-solid-svg-icons';
import { CaseService } from '../services/api';
import { currencyConfig } from '../config';
import './LedgerTable.css';

const LedgerTable = ({ data: externalData, title = "Recent Transactions" }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (externalData) {
            setCases(externalData);
            setIsLoading(false);
        } else {
            fetchCases();
        }
    }, [externalData]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const response = await CaseService.list();
            if (response.data) {
                // Normalize data structure
                const data = Array.isArray(response.data) ? response.data :
                    (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
                setCases(data);
            }
        } catch (error) {
            console.error("Failed to fetch ledger data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredCases = useMemo(() => {
        let filtered = cases.filter(c => (c.status || '').toUpperCase() !== 'ARCHIVED');

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

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'createdAt':
                        aValue = new Date(a.createdAt || 0);
                        bValue = new Date(b.createdAt || 0);
                        break;
                    case 'caseId':
                        aValue = (a.caseId || a._id || '').slice(-4);
                        bValue = (b.caseId || b._id || '').slice(-4);
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

    // Pagination Logic
    const totalPages = Math.ceil(sortedAndFilteredCases.length / itemsPerPage);
    const paginatedCases = sortedAndFilteredCases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(currencyConfig.locale, { style: 'currency', currency: currencyConfig.code }).format(amount || 0);
    };

    const handleActionClick = (caseId) => {
        window.location.href = `?caseId=${caseId}`;
    };

    return (
        <div className="ledger-container dashboard-widget">
            <div className="dashboard-header">
                <h3 className="dashboard-title">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} /> {title}
                </h3>
            </div>

            <div className="ledger-controls">
                <div className="search-box">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search Client or Case ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
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
                        <option value="deleted">Deleted</option>
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
                                <td colSpan="7" className="text-center">Loading...</td>
                            </tr>
                        ) : paginatedCases.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No transactions found</td>
                            </tr>
                        ) : (
                            paginatedCases.map((c) => (
                                <tr key={c.caseId || c._id}>
                                    <td>{formatDate(c.createdAt)}</td>
                                    <td className="font-mono">
                                        {(c.caseId || c._id || '').slice(-4).toUpperCase()}
                                    </td>
                                    <td className="font-medium">
                                        {c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || 'Unknown'}
                                        {c.data?.clientDetails?.businessName && c.data.clientDetails.clientName && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {c.data.clientDetails.businessName}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${(c.status || 'unknown').toLowerCase()}`}>
                                            {c.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="text-right font-mono text-money">
                                        {formatCurrency(c.data?.grandTotal)}
                                    </td>
                                    <td>{c.data?.orderDetails?.leadTime || 'N/A'}</td>
                                    <td className="text-right">
                                        <button
                                            className="glass-btn small"
                                            onClick={() => handleActionClick(c.caseId || c._id)}
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

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="glass-btn small"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="glass-btn small"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default LedgerTable;
