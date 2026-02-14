import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';
import ProductForm from './ProductForm';
import ClientInfoStep from './ClientInfoStep';
import ClientSelectStep from './ClientSelectStep';
import './ProductList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilePdf, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ProductList = ({ caseId: initialCaseId, onClientDataLoaded }) => {
    const [currentStep, setCurrentStep] = useState(0); // Step 0: Client Select, Step 1: Client Info, Step 2: Products
    const [isEditMode, setIsEditMode] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false); // New State for Read-Only Mode
    const [isLoading, setIsLoading] = useState(false);
    const [activeCaseId, setActiveCaseId] = useState(initialCaseId || null);
    const [isManualClient, setIsManualClient] = useState(false);

    const [products, setProducts] = useState([
        { id: 1, productId: '', name: '', price: 0, quantity: 1, thumbnail: '', condition: 'Brand New' }
    ]);

    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        businessName: '',
        taxId: '',
        businessAddress: '',
    });

    const [orderDetails, setOrderDetails] = useState({
        leadTime: new Date().toISOString().split('T')[0],
        terms: ''
    });

    const [availableProducts, setAvailableProducts] = useState([]);

    // Fetch product catalog from dummyjson
    useEffect(() => {
        fetch('https://dummyjson.com/products?limit=100')
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
                const response = await fetch(`http://localhost:3000/case/v1/get?id=${initialCaseId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                const caseData = result.data.data;
                const status = result.data.status; // Get status from API

                // Check if case is in Approval state
                if (status === 'approved') {
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
                        leadTime: caseData.orderDetails.leadTime || caseData.orderDetails.date || new Date().toISOString().split('T')[0],
                        terms: caseData.orderDetails.terms || ''
                    });
                } else if (caseData.clientDetails && (caseData.clientDetails.date || caseData.clientDetails.terms)) {
                    // Backward compatibility
                    setOrderDetails({
                        leadTime: caseData.clientDetails.date || new Date().toISOString().split('T')[0],
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

                // Enter edit mode and skip to Step 2
                setIsEditMode(true);
                setActiveCaseId(initialCaseId);
                setCurrentStep(2);

            } catch (error) {
                console.error('Error fetching case data:', error);
                alert(`Failed to load case data: ${error.message}`);
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

    const calculateGrandTotal = () => {
        return products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0).toFixed(2);
    };

    const saveToDatabase = async (caseId, timestamp) => {
        if (isReadOnly) return; // Prevent saving in read-only mode

        try {
            const payload = {
                caseId,
                timestamp,
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
                    grandTotal: parseFloat(calculateGrandTotal())
                }
            };

            const response = await fetch('http://localhost:3000/case/v1/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert(`Order ${isEditMode ? 'updated' : 'saved'} successfully! Case ID: ${caseId}`);
        } catch (error) {
            console.error('Error saving to database:', error);
            alert(`Failed to save order to database: ${error.message}`);
        }
    };

    const generatePDF = async () => {
        // In edit mode, reuse the existing caseId; otherwise generate a new one
        const caseId = isEditMode ? activeCaseId : uuidv4();
        const timestamp = new Date().toISOString();
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Product Order Summary", 14, 22);

        // ... (PDF Generation Code remains same) ...
        // Client Details
        doc.setFontSize(11);
        doc.setTextColor(100);

        let yPos = 32;
        doc.text(`Client: ${clientDetails.clientName || 'N/A'}`, 14, yPos);
        doc.text(`Business: ${clientDetails.businessName || 'N/A'}`, 110, yPos);

        yPos += 7;
        doc.text(`Tax ID: ${clientDetails.taxId || 'N/A'}`, 14, yPos);
        doc.text(`Address: ${clientDetails.businessAddress || 'N/A'}`, 110, yPos);

        yPos += 7;
        doc.text(`Lead Time: ${orderDetails.leadTime}`, 14, yPos);
        doc.text(`Terms: ${orderDetails.terms ? orderDetails.terms + ' Days' : 'N/A'}`, 110, yPos);

        // Table Data
        const tableColumn = ["Product", "Condition", "Price", "Quantity", "Total"];
        const tableRows = [];

        products.forEach(product => {
            if (product.name) {
                const productData = [
                    product.name,
                    product.condition || 'Brand New',
                    `Php ${product.price ? product.price.toFixed(2) : '0.00'}`,
                    product.quantity || 1,
                    `Php ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}`
                ];
                tableRows.push(productData);
            }
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 15,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Primary blue color
        });

        // Grand Total
        const finalY = doc.lastAutoTable?.finalY || (yPos + 15);
        doc.text(`Grand Total: Php ${calculateGrandTotal()}`, 14, finalY + 10);

        // Save PDF with caseId filename
        doc.save(`${caseId}.pdf`);

        // Save to backend API ONLY if NOT Read-Only
        if (!isReadOnly) {
            await saveToDatabase(caseId, timestamp);

            // If this was a new order, update state to edit mode
            if (!isEditMode) {
                setIsEditMode(true);
                setActiveCaseId(caseId);
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
        const newClientDetails = {
            clientName: selectedClient.clientName || '',
            businessName: selectedClient.businessName || '',
            taxId: selectedClient.taxId || '',
            businessAddress: selectedClient.businessAddress || '',
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
        setOrderDetails({ leadTime: new Date().toISOString().split('T')[0], terms: '' });
        if (onClientDataLoaded) onClientDataLoaded(''); // Clear name
        setIsManualClient(true);
        setCurrentStep(1);
    };

    const handleNextStep1 = async () => {
        if (isManualClient) {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3000/client/v1/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(clientDetails)
                });

                if (!response.ok) {
                    throw new Error('Failed to create client');
                }

                if (onClientDataLoaded) {
                    onClientDataLoaded(clientDetails.clientName || clientDetails.businessName);
                }
            } catch (error) {
                console.error('Error creating client:', error);
                alert('Failed to save client details. Please try again.');
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
            <div className="app-container">
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
            <div className="app-container">
                <ClientSelectStep
                    onClientSelect={handleClientSelect}
                    onManualInput={handleManualInput}
                />
            </div>
        );
    }

    // Step 1: Client Information
    if (currentStep === 1) {
        return (
            <div className="app-container">
                <ClientInfoStep
                    clientDetails={clientDetails}
                    onChange={setClientDetails}
                    onNext={handleNextStep1}
                />
            </div>
        );
    }

    // Step 2: Product Management
    return (
        <div className="app-container">
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
                <h2 className="step-title">Order Details</h2>
                {isEditMode && (
                    <p className="case-id-label">Case ID: {activeCaseId}</p>
                )}
            </div>

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
                    <button
                        className="glass-btn generate-btn"
                        onClick={generatePDF}
                    >
                        <FontAwesomeIcon icon={faFilePdf} />
                        {isReadOnly ? 'Download PDF' : (isEditMode ? 'Update & Generate PDF' : 'Generate PDF')}
                    </button>

                    <div className="grand-total-card">
                        <span className="label">Total Value</span>
                        <span className="value">Php {calculateGrandTotal()}</span>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductList;
