import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ProductForm from './ProductForm';
import ClientInfoStep from './ClientInfoStep';
import ClientSelectStep from './ClientSelectStep';
import CaseJourney from './CaseJourney';
import './ProductList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilePdf, faArrowLeft, faPrint, faRoute } from '@fortawesome/free-solid-svg-icons';
import { PRODUCT_API_URL, currencyConfig, taxConfig } from '../config';
import generateQuotation from '../utils/pdf/generateQuotation';
import generateInvoice from '../utils/pdf/generateInvoice';
import generateDeliveryReceipt from '../utils/pdf/generateDeliveryReceipt';
import { useNotification } from '../context/NotificationContext';
import { getLocalDateString } from '../utils/dateHelpers';
import { CaseService, ClientService } from '../services/api';

const ProductList = ({ caseId: initialCaseId, onClientDataLoaded, onNavigate, currentUser }) => {
    const [currentStep, setCurrentStep] = useState(0); // Step 0: Client Select, Step 1: Client Info, Step 2: Products, Step 3: Calculation
    const [isEditMode, setIsEditMode] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false); // New State for Read-Only Mode
    const [isLoading, setIsLoading] = useState(false);
    const [activeCaseId, setActiveCaseId] = useState(initialCaseId || null);
    const [isManualClient, setIsManualClient] = useState(false);
    const [caseStatus, setCaseStatus] = useState('quotation');
    const [includeVat, setIncludeVat] = useState(false);
    const [showJourney, setShowJourney] = useState(false);
    const { showNotification } = useNotification();

    const [products, setProducts] = useState([
        { id: 1, productId: '', name: '', price: 0, quantity: 1, thumbnail: '', condition: 'Brand New' }
    ]);

    // ... (existing state for clientDetails, orderDetails, availableProducts) ...

    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        businessName: '',
        taxId: '',
        businessAddress: '',
        email: '',
        mobile: '',
        address1: '',
        address2: '',
        city: '',
        province: '',
        zip: '',
    });

    const [orderDetails, setOrderDetails] = useState({
        leadTime: getLocalDateString(),
        terms: ''
    });

    const [availableProducts, setAvailableProducts] = useState([]);

    // ... (useEffect for products/case data fetching remains same) ...
    // Fetch product catalog from dummyjson
    useEffect(() => {
        fetch(PRODUCT_API_URL)
            .then(res => res.json())
            .then(data => setAvailableProducts(data.products))
            .catch(err => console.error("Failed to load products", err));
    }, []);

    // Fetch case data from API when caseId is provided (edit mode)
    useEffect(() => {
        if (!initialCaseId) return;

        const fetchCaseData = async () => {
            setIsLoading(true);
            try {
                const response = await CaseService.get(initialCaseId);
                if (!response.data) {
                    throw new Error(`API error! No data returned.`);
                }
                const caseData = response.data.data;
                const status = response.data.status; // Get status from API
                setCaseStatus(status);

                // Check if case is in read-only state (including Invoicing, Delivery, and Completed)
                if (['approved', 'invoicing', 'delivery', 'completed'].includes(status)) {
                    setIsReadOnly(true);
                }

                // Hydrate client details
                if (caseData.clientDetails) {
                    setClientDetails(caseData.clientDetails);
                    if (onClientDataLoaded) {
                        onClientDataLoaded(caseData.clientDetails.clientName || caseData.clientDetails.businessName);
                    }
                }

                // Hydrate order details
                if (caseData.orderDetails) {
                    setOrderDetails({
                        leadTime: caseData.orderDetails.leadTime || caseData.orderDetails.date || getLocalDateString(),
                        terms: caseData.orderDetails.terms || ''
                    });
                } else if (caseData.clientDetails && (caseData.clientDetails.date || caseData.clientDetails.terms)) {
                    // Backward compatibility
                    setOrderDetails({
                        leadTime: caseData.clientDetails.date || getLocalDateString(),
                        terms: caseData.clientDetails.terms || ''
                    });
                }

                // Hydrate products with unique ids for React keys
                if (caseData.products && caseData.products.length > 0) {
                    const hydratedProducts = caseData.products.map((p, idx) => ({
                        id: Date.now() + idx,
                        productId: p.productId,
                        name: p.name,
                        price: p.price,
                        quantity: p.quantity,
                        condition: p.condition || 'Brand New',
                        thumbnail: '', // Will be restored once availableProducts loads
                    }));
                    setProducts(hydratedProducts);
                }

                // Hydrate VAT setting
                if (caseData.vatDetails && typeof caseData.vatDetails.included !== 'undefined') {
                    setIncludeVat(caseData.vatDetails.included);
                }

                // Enter edit mode and skip to Step 2
                setIsEditMode(true);
                setActiveCaseId(initialCaseId);
                setCurrentStep(2);

            } catch (error) {
                console.error('Error fetching case data:', error);
                showNotification(`Failed to load case data: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCaseData();
    }, [initialCaseId]);

    // Restore thumbnails when availableProducts loads (for edit mode)
    useEffect(() => {
        if (!isEditMode || availableProducts.length === 0) return;

        setProducts(prevProducts =>
            prevProducts.map(product => {
                if (product.productId && !product.thumbnail) {
                    const catalogProduct = availableProducts.find(p => p.id === product.productId);
                    if (catalogProduct) {
                        return {
                            ...product,
                            thumbnail: catalogProduct.thumbnail,
                        };
                    }
                }
                return product;
            })
        );
    }, [availableProducts, isEditMode]);

    const addProduct = () => {
        setProducts([
            ...products,
            { id: Date.now(), productId: '', name: '', price: 0, quantity: 1, thumbnail: '' }
        ]);
    };

    const updateProduct = (index, updatedProduct) => {
        const newProducts = [...products];
        newProducts[index] = updatedProduct;
        setProducts(newProducts);
    };

    const removeProduct = (indexToRemove) => {
        setProducts(products.filter((_, index) => index !== indexToRemove));
    };

    const calculateSubtotal = () => {
        return products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
    };

    const calculateVatAmount = () => {
        if (!includeVat) return 0;
        return calculateSubtotal() * taxConfig.vatRate;
    };

    const calculateGrandTotal = () => {
        return (calculateSubtotal() + calculateVatAmount()).toFixed(2);
    };

    const saveToDatabase = async (caseId, timestamp) => {
        if (isReadOnly) return; // Prevent saving in read-only mode

        try {
            const payload = {
                caseId,
                timestamp,
                status: caseStatus, // Use current status
                data: {
                    orderDetails: {
                        leadTime: orderDetails.leadTime,
                        terms: orderDetails.terms
                    },
                    clientDetails,
                    products: products.map(p => ({
                        productId: p.productId,
                        name: p.name,
                        price: p.price,
                        quantity: p.quantity,
                        condition: p.condition,
                        total: (p.price || 0) * (p.quantity || 1)
                    })),
                    vatDetails: {
                        included: includeVat,
                        rate: taxConfig.vatRate,
                        amount: calculateVatAmount()
                    },
                    grandTotal: parseFloat(calculateGrandTotal())
                },
                createdBy: {
                    email: currentUser?.emailAddress || currentUser?.email || 'unknown',
                    firstName: currentUser?.firstName || 'Unknown',
                    lastName: currentUser?.lastName || 'User',
                    avatarUrl: currentUser?.avatarUrl || '',
                    metadata: currentUser?.metadata || ''
                } // Tag the creator with full details
            };

            console.log('Saving case with payload:', payload);

            const response = await CaseService.create(payload);
            console.log('Save response:', response);

            // Check for success (either "Success" string or just presence of response)
            if (response && (response.data === 'Success' || response.caseId)) {
                showNotification('Case saved successfully!', 'success');
                return true;
            } else {
                console.warn('Unexpected save response:', response);
                // Don't throw if we got a caseId back, assume success
                if (!response.caseId) {
                    throw new Error('Failed to save case: invalid response');
                }
                showNotification('Case saved successfully!', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error saving to database:', error);
            const errMsg = error.response?.data?.message || error.message || 'Unknown error';
            showNotification(`Failed to save order: ${errMsg}`, 'error');
            return false;
        }
    };

    const generatePDF = async (forcedType) => {
        // In edit mode, reuse the existing caseId; otherwise generate a new one
        const caseId = isEditMode ? activeCaseId : uuidv4();
        const timestamp = new Date().toISOString();

        // Determine which PDF to generate
        // If a specific type is forced (e.g. for Delivery buttons), use it.
        // Otherwise, default to 'invoice' for Invoicing status, and 'quotation' for others.
        const typeHelper = forcedType || (caseStatus === 'invoicing' ? 'invoice' : 'quotation');

        if (typeHelper === 'invoice') {
            generateInvoice(caseId, clientDetails, orderDetails, products, calculateGrandTotal);
        } else if (typeHelper === 'delivery_receipt') {
            generateDeliveryReceipt(caseId, clientDetails, orderDetails, products, calculateGrandTotal);
        } else {
            generateQuotation(caseId, clientDetails, orderDetails, products, calculateGrandTotal);
        }

        // Save to backend API ONLY if NOT Read-Only
        if (!isReadOnly) {
            const success = await saveToDatabase(caseId, timestamp);
            if (!success) return; // Stop if save failed

            // If this was a new order, update state to edit mode
            if (!isEditMode) {
                setIsEditMode(true);
                setActiveCaseId(caseId);
            }

            // Redirect to Board (List View) after save
            if (onNavigate) {
                onNavigate('list');
            }
        }
    };

    const handleNext = () => {
        setCurrentStep(2);
    };

    const handleBack = () => {
        if (isReadOnly) return; // Disable back if read-only
        setCurrentStep(1);
    };

    // ... (Client Handlers remain same) ...
    const handleClientSelect = (selectedClient) => {
        // ... implementation ...
        console.log("handleClientSelect called with:", selectedClient);

        // Extract metadata if available
        let metadata = {};
        if (selectedClient.metadata) {
            try {
                metadata = typeof selectedClient.metadata === 'string'
                    ? JSON.parse(selectedClient.metadata)
                    : selectedClient.metadata;
            } catch (e) {
                console.error("Failed to parse client metadata", e);
            }
        }

        const addressInfo = metadata.address_information || {};
        const contactInfo = metadata.contact_information || {};

        const newClientDetails = {
            clientName: selectedClient.clientName || '',
            businessName: selectedClient.businessName || '',
            taxId: selectedClient.taxId || '',
            businessAddress: selectedClient.businessAddress || '',
            email: contactInfo.email || selectedClient.email || '',
            mobile: contactInfo.mobile || selectedClient.mobile || selectedClient.phone || '',
            address1: addressInfo.address1 || '',
            address2: addressInfo.address2 || '',
            city: addressInfo.city || '',
            province: addressInfo.province || '',
            zip: addressInfo.zip || '',
        };
        // Update terms if available in selected client, otherwise keep current input
        if (selectedClient.terms) {
            setOrderDetails(prev => ({ ...prev, terms: selectedClient.terms }));
        }
        console.log("Setting client details to:", newClientDetails);
        setClientDetails(newClientDetails);
        if (onClientDataLoaded) {
            onClientDataLoaded(newClientDetails.clientName || newClientDetails.businessName);
        }
        setIsManualClient(false);
        setCurrentStep(1);
    };

    const handleManualInput = () => {
        setClientDetails({ ...clientDetails, clientName: '', businessName: '', taxId: '', businessAddress: '' });
        // Reset order details or keep them? Probably keep them or reset to default:
        setOrderDetails({ leadTime: getLocalDateString(), terms: '' });
        if (onClientDataLoaded) onClientDataLoaded(''); // Clear name
        setIsManualClient(true);
        setCurrentStep(1);
    };

    const handleNextStep1 = async () => {
        if (isManualClient) {
            setIsLoading(true);
            try {
                const response = await ClientService.create(clientDetails);

                if (!response.data) {
                    throw new Error('Failed to create client');
                }

                if (onClientDataLoaded) {
                    onClientDataLoaded(clientDetails.clientName || clientDetails.businessName);
                }
            } catch (error) {
                console.error('Error creating client:', error);
                showNotification('Failed to save client details. Please try again.', 'error');
                setIsLoading(false);
                return; // Stop if failed
            } finally {
                setIsLoading(false);
            }
        }
        setCurrentStep(2);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="product-list-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading case data...</p>
                </div>
            </div>
        );
    }

    // Step 0: Client Selection
    if (currentStep === 0) {
        return (
            <ClientSelectStep
                onClientSelect={handleClientSelect}
                onManualInput={handleManualInput}
            />
        );
    }

    // Step 1: Client Information
    if (currentStep === 1) {
        return (
            <ClientInfoStep
                clientDetails={clientDetails}
                onChange={setClientDetails}
                onNext={handleNextStep1}
            />
        );
    }

    // Step 3: Calculation & Confirmation (Merged into Step 2)
    // if (currentStep === 3) { ... } removed


    // Step 2: Product Management (Updated UI)
    return (
        <div className="product-list-page">
            <br />

            {/* Step Indicator & Client Summary */}
            <div className="step-indicator">
                {!isReadOnly && (
                    <button className="back-btn" onClick={handleBack}>
                        ← Back to Client Info
                    </button>
                )}
                <div className="client-summary">
                    {isEditMode && (
                        <span className={`edit-badge ${isReadOnly ? 'readonly' : ''}`}>
                            {isReadOnly ? 'Read-Only (Approved)' : 'Editing'}
                        </span>
                    )}
                    <span className="summary-label">Client:</span>
                    <span className="summary-value">
                        {clientDetails.clientName || clientDetails.businessName || 'N/A'}
                    </span>
                </div>
            </div>

            <div className="step-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <h2 className="step-title" style={{ margin: 0 }}>Order Details</h2>
                    {isEditMode && <span className="case-id-label" style={{ margin: 0 }}>#{activeCaseId.slice(-4).toUpperCase()}</span>}
                </div>
                {caseStatus === 'completed' && (
                    <button
                        className="glass-btn primary-gradient"
                        onClick={() => setShowJourney(true)}
                        title="View Case Journey"
                    >
                        <FontAwesomeIcon icon={faRoute} /> Case Journey
                    </button>
                )}
            </div>

            {showJourney && (
                <CaseJourney
                    caseId={activeCaseId}
                    onClose={() => setShowJourney(false)}
                />
            )}

            {/* Order Details Section */}
            <div className="client-details-section" style={{ marginBottom: '2rem' }}>
                <div className="details-grid">
                    <div className="input-group">
                        <label>Lead Time (Date)</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={orderDetails.leadTime}
                            onChange={(e) => setOrderDetails({ ...orderDetails, leadTime: e.target.value })}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="input-group">
                        <label>Terms (Days)</label>
                        <input
                            type="number"
                            className="glass-input"
                            placeholder="e.g., 30"
                            value={orderDetails.terms}
                            onChange={(e) => setOrderDetails({ ...orderDetails, terms: e.target.value })}
                            disabled={isReadOnly}
                        />
                    </div>
                    {/* VAT Checkbox removed as per user request */}
                </div>
            </div>

            <div className="product-header">
                <span className="header-label product">Product</span>
                <span className="header-label condition">Condition</span>
                <span className="header-label price">Price</span>
                <span className="header-label qty">Qty</span>
                <span className="header-label total">Total</span>
                <span className="header-label action"></span>
            </div>

            <div className="product-grid">
                {products.map((product, index) => (
                    <ProductForm
                        key={product.id || index}
                        index={index}
                        data={product}
                        availableProducts={availableProducts}
                        onChange={updateProduct}
                        onRemove={() => removeProduct(index)}
                        readOnly={isReadOnly}
                    />
                ))}
            </div>

            {/* Add Button moved to body below products */}
            {!isReadOnly && (
                <div className="add-button-container">
                    <button
                        className="add-btn"
                        onClick={addProduct}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add New Product
                    </button>
                </div>
            )}

            <div className="controls-area">
                <div className="controls-wrapper">
                    {caseStatus === 'completed' ? (
                        <div className="completed-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="glass-btn" onClick={() => generatePDF('quotation')}>
                                <FontAwesomeIcon icon={faFilePdf} /> Quotation
                            </button>
                            <button className="glass-btn" onClick={() => generatePDF('invoice')}>
                                <FontAwesomeIcon icon={faFilePdf} /> Invoice
                            </button>
                            <button className="glass-btn" onClick={() => generatePDF('delivery_receipt')}>
                                <FontAwesomeIcon icon={faFilePdf} /> DR
                            </button>
                        </div>
                    ) : caseStatus === 'delivery' ? (
                        <button
                            className="glass-btn"
                            onClick={() => generatePDF('delivery_receipt')}
                        >
                            <FontAwesomeIcon icon={faFilePdf} /> Download Delivery Receipt
                        </button>
                    ) : (
                        <button
                            className="glass-btn"
                            onClick={() => generatePDF()}
                            disabled={products.length === 0}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                            {caseStatus === 'invoicing' ? 'Download Invoice' : (isReadOnly ? 'Download Quotation' : (isEditMode ? 'Update & Confirm Order' : 'Confirm & Generate PDF'))}
                        </button>
                    )}

                    <div className="grand-total-card">
                        <span className="label">Grand Total {includeVat ? '(Inc. VAT)' : ''}</span>
                        <span className="value">{currencyConfig.code} {calculateGrandTotal()}</span>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductList;
