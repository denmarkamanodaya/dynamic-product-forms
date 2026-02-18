import React from 'react';
import ProductForm from './ProductForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilePdf, faRoute, faUser, faBuilding, faCalendarAlt, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { currencyConfig } from '../config';
import PHILIPPINES_PROVINCES from '../utils/philippines_provinces';
import generateQuotation from '../utils/pdf/generateQuotation';
import generateInvoice from '../utils/pdf/generateInvoice';
import generateDeliveryReceipt from '../utils/pdf/generateDeliveryReceipt';
import './FullPage.css';

const FullPage = ({
    clientDetails,
    onClientChange,
    orderDetails,
    onOrderChange,
    products,
    availableProducts,
    onProductUpdate,
    onProductAdd,
    onProductRemove,
    includeVat,
    calculateGrandTotal,
    onGeneratePDF,
    caseStatus,
    isEditMode,
    isReadOnly,
    activeCaseId,
    setShowJourney
}) => {
    const handleClientFieldChange = (field, value) => {
        onClientChange({ ...clientDetails, [field]: value });
    };

    return (
        <div className="full-page-container">
            <div className="full-page-header">
                <div className="header-title-group">
                    <h2 className="full-page-title">Case Details</h2>
                    {isEditMode && <span className="full-page-case-id">#{activeCaseId.slice(-4).toUpperCase()}</span>}
                </div>
            </div>

            <div className="full-page-body">
                <div className="detail-section">
                    <h4 className="detail-section-title">
                        <FontAwesomeIcon icon={faUser} /> Client Information
                    </h4>
                    <div className="detail-client-grid">
                        <div className="detail-info-item">
                            <span className="detail-info-label">Client Name</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Full Name"
                                value={clientDetails.clientName}
                                onChange={(e) => handleClientFieldChange('clientName', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Business Name</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Company Name"
                                value={clientDetails.businessName}
                                onChange={(e) => handleClientFieldChange('businessName', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Tax ID</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="000-000-000-000"
                                value={clientDetails.taxId}
                                onChange={(e) => handleClientFieldChange('taxId', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Email Address</span>
                            <input
                                type="email"
                                className="glass-input"
                                placeholder="email@example.com"
                                value={clientDetails.email}
                                onChange={(e) => handleClientFieldChange('email', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Mobile Number</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="09xx xxx xxxx"
                                value={clientDetails.mobile}
                                onChange={(e) => handleClientFieldChange('mobile', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="detail-section">
                    <h4 className="detail-section-title">
                        <FontAwesomeIcon icon={faBuilding} /> Address Information
                    </h4>
                    <div className="detail-client-grid">
                        <div className="detail-info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="detail-info-label">Address Line 1</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Unit, Building, Street Name"
                                value={clientDetails.address1}
                                onChange={(e) => handleClientFieldChange('address1', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">City/Municipality</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Enter city"
                                value={clientDetails.city}
                                onChange={(e) => handleClientFieldChange('city', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Province</span>
                            <select
                                className="glass-input"
                                value={clientDetails.province}
                                onChange={(e) => handleClientFieldChange('province', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            >
                                <option value="">Select Province</option>
                                {PHILIPPINES_PROVINCES.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                        <div className="detail-info-item">
                            <span className="detail-info-label">Zip Code</span>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="e.g. 1000"
                                value={clientDetails.zip}
                                onChange={(e) => handleClientFieldChange('zip', e.target.value)}
                                disabled={isReadOnly}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Order Details
                </h4>
                <div className="detail-client-grid">
                    <div className="detail-info-item">
                        <span className="detail-info-label">Lead Time (Date)</span>
                        <input
                            type="date"
                            className="glass-input"
                            value={orderDetails.leadTime}
                            onChange={(e) => onOrderChange({ ...orderDetails, leadTime: e.target.value })}
                            disabled={isReadOnly}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>
                    <div className="detail-info-item">
                        <span className="detail-info-label">Terms (Days)</span>
                        <input
                            type="number"
                            className="glass-input"
                            placeholder="e.g. 30"
                            value={orderDetails.terms}
                            onChange={(e) => onOrderChange({ ...orderDetails, terms: e.target.value })}
                            disabled={isReadOnly}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                        />
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h4 className="detail-section-title">
                    <FontAwesomeIcon icon={faBoxOpen} /> Product Details
                </h4>
                <div className="products-container" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <div className="product-header">
                        <span className="header-label product">Product</span>
                        <span className="header-label price">Price</span>
                        <span className="header-label qty">Qty</span>
                        <span className="header-label total">Total</span>
                        {!isReadOnly && <span className="header-label action"></span>}
                    </div>

                    <div className="product-list">
                        {products.map((product, index) => (
                            <ProductForm
                                key={product.id || index}
                                index={index}
                                data={product}
                                availableProducts={availableProducts}
                                onChange={onProductUpdate}
                                onRemove={() => onProductRemove(index)}
                                readOnly={isReadOnly}
                            />
                        ))}
                    </div>

                    {!isReadOnly && (
                        <button className="add-product-btn" onClick={onProductAdd}>
                            <FontAwesomeIcon icon={faPlus} /> Add Product
                        </button>
                    )}
                </div>
            </div>

            <div className="full-page-footer">
                <div className="total-display">
                    <span className="total-label">Grand Total {includeVat ? '(Inc. VAT)' : ''}</span>
                    <span className="total-value">{currencyConfig.code} {calculateGrandTotal()}</span>
                </div>
                <div className="footer-actions">
                    {caseStatus === 'completed' ? (
                        <div className="multi-pdf-actions">
                            <button
                                className="glass-btn primary-gradient"
                                onClick={() => setShowJourney(true)}
                                style={{ marginRight: 'auto' }}
                            >
                                <FontAwesomeIcon icon={faRoute} /> Case Journey
                            </button>
                            <button
                                className="glass-btn secondary-btn"
                                onClick={() => generateQuotation(activeCaseId, clientDetails, orderDetails, products, calculateGrandTotal)}
                            >
                                <FontAwesomeIcon icon={faFilePdf} /> Quotation
                            </button>
                            <button
                                className="glass-btn secondary-btn"
                                onClick={() => generateInvoice(activeCaseId, clientDetails, orderDetails, products, calculateGrandTotal)}
                            >
                                <FontAwesomeIcon icon={faFilePdf} /> Invoice
                            </button>
                            <button
                                className="glass-btn secondary-btn"
                                onClick={() => generateDeliveryReceipt(activeCaseId, clientDetails, orderDetails, products, calculateGrandTotal)}
                            >
                                <FontAwesomeIcon icon={faFilePdf} /> Delivery Receipt
                            </button>
                        </div>
                    ) : (
                        <button
                            className="glass-btn primary-btn"
                            onClick={() => onGeneratePDF()}
                            disabled={products.length === 0}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                            {isReadOnly ? 'Download PDF' : (isEditMode ? 'Update Case' : 'Create Case')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FullPage;
