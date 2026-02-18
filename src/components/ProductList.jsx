import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FullPage from './FullPage';
import CaseJourney from './CaseJourney';
import './ProductList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilePdf, faArrowLeft, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { PRODUCT_API_URL, currencyConfig, taxConfig } from '../config';
import generateQuotation from '../utils/pdf/generateQuotation';
import generateInvoice from '../utils/pdf/generateInvoice';
import { useNotification } from '../context/NotificationContext';
import { getLocalDateString } from '../utils/dateHelpers';
import { CaseService, ClientService } from '../services/api';

const ProductList = ({ caseId: initialCaseId, onClientDataLoaded, onNavigate, currentUser }) => {
    // UI State
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [showJourney, setShowJourney] = useState(false);

    // Data State
    const [activeCaseId, setActiveCaseId] = useState(initialCaseId || null);
    const [caseStatus, setCaseStatus] = useState('quotation');
    const [includeVat, setIncludeVat] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Case Data State
    const [clientDetails, setClientDetails] = useState({
        clientName: '', businessName: '', taxId: '', email: '', mobile: '',
        address1: '', address2: '', city: '', province: '', zip: '',
    });
    const [orderDetails, setOrderDetails] = useState({
        leadTime: getLocalDateString(),
        terms: ''
    });
    const [products, setProducts] = useState([
        { id: Date.now(), productId: '', name: '', price: 0, quantity: 1, thumbnail: '', condition: 'Brand New' }
    ]);

    const { showNotification } = useNotification();

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Products
                const prodRes = await fetch(PRODUCT_API_URL);
                const prodData = await prodRes.json();
                setAvailableProducts(prodData.products);

                // Fetch Clients
                const clientRes = await ClientService.list();
                const clientList = Array.isArray(clientRes.data) ? clientRes.data :
                    (clientRes.data?.data && Array.isArray(clientRes.data.data)) ? clientRes.data.data : [];
                setClients(clientList);

                // If Case ID provided, fetch Case
                if (initialCaseId) {
                    await fetchCaseData(initialCaseId);
                }
            } catch (err) {
                console.error("Initialization error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [initialCaseId]);

    const fetchCaseData = async (id) => {
        try {
            const response = await CaseService.get(id);
            const caseData = response.data.data;
            const status = response.data.status;

            setCaseStatus(status);
            if (['approved', 'invoicing', 'delivery', 'completed'].includes(status)) {
                setIsReadOnly(true);
            }

            if (caseData.clientDetails) setClientDetails(caseData.clientDetails);
            if (caseData.orderDetails) {
                setOrderDetails({
                    leadTime: caseData.orderDetails.leadTime || caseData.orderDetails.date || getLocalDateString(),
                    terms: caseData.orderDetails.terms || ''
                });
            }
            if (caseData.products) {
                setProducts(caseData.products.map((p, idx) => ({
                    id: Date.now() + idx, ...p, total: (p.price || 0) * (p.quantity || 1)
                })));
            }
            if (caseData.vatDetails) setIncludeVat(caseData.vatDetails.included);

            setIsEditMode(true);
            setActiveCaseId(id);
            setCurrentStep(2); // Jump to full view
        } catch (error) {
            showNotification(`Failed to load case data: ${error.message}`, 'error');
        }
    };

    // Client Selection Logic
    const handleClientSelect = (selectedClient) => {
        if (isReadOnly) return;
        let metadata = {};
        if (selectedClient.metadata) {
            try {
                metadata = typeof selectedClient.metadata === 'string' ? JSON.parse(selectedClient.metadata) : selectedClient.metadata;
            } catch (e) { console.error("Metadata parse error", e); }
        }

        const addressInfo = metadata.address_information || {};
        const contactInfo = metadata.contact_information || {};

        const newClientDetails = {
            clientName: selectedClient.clientName || '',
            businessName: selectedClient.businessName || '',
            taxId: selectedClient.taxId || '',
            email: contactInfo.email || selectedClient.email || '',
            mobile: contactInfo.mobile || selectedClient.mobile || selectedClient.phone || '',
            address1: addressInfo.address1 || '',
            address2: addressInfo.address2 || '',
            city: addressInfo.city || '',
            province: addressInfo.province || '',
            zip: addressInfo.zip || '',
        };

        setClientDetails(newClientDetails);
        if (selectedClient.terms) setOrderDetails(prev => ({ ...prev, terms: selectedClient.terms }));
        if (onClientDataLoaded) onClientDataLoaded(newClientDetails.clientName || newClientDetails.businessName);

        setCurrentStep(2); // Show the FullPage
        showNotification(`Loaded info for ${selectedClient.clientName || selectedClient.businessName}`, 'success');
    };

    const handleManualInput = () => {
        if (isReadOnly) return;
        setClientDetails({
            clientName: '', businessName: '', taxId: '', email: '', mobile: '',
            address1: '', address2: '', city: '', province: '', zip: '',
        });
        setOrderDetails({ leadTime: getLocalDateString(), terms: '' });
        setCurrentStep(2);
    };

    // Product Handlers
    const addProduct = () => setProducts([...products, { id: Date.now(), productId: '', name: '', price: 0, quantity: 1, thumbnail: '', condition: 'Brand New' }]);
    const updateProduct = (index, updatedProduct) => {
        const newProducts = [...products];
        newProducts[index] = updatedProduct;
        setProducts(newProducts);
    };
    const removeProduct = (indexToRemove) => setProducts(products.filter((_, index) => index !== indexToRemove));

    // Calculations
    const calculateSubtotal = () => products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
    const calculateVatAmount = () => includeVat ? calculateSubtotal() * taxConfig.vatRate : 0;
    const calculateGrandTotal = () => (calculateSubtotal() + calculateVatAmount()).toFixed(2);

    const handleSaveAndGenerate = async () => {
        if (isReadOnly) {
            generateQuotation(activeCaseId, clientDetails, orderDetails, products, calculateGrandTotal);
            return;
        }

        if (!clientDetails.clientName.trim() && !clientDetails.businessName.trim()) {
            showNotification('Please provide at least a Client Name or Business Name', 'error');
            return;
        }

        setIsLoading(true);
        const caseId = isEditMode ? activeCaseId : uuidv4();
        const timestamp = new Date().toISOString();

        try {
            const payload = {
                caseId, timestamp, status: caseStatus,
                data: {
                    orderDetails, clientDetails,
                    products: products.map(p => ({ ...p, total: (p.price || 0) * (p.quantity || 1) })),
                    vatDetails: { included: includeVat, rate: taxConfig.vatRate, amount: calculateVatAmount() },
                    grandTotal: parseFloat(calculateGrandTotal())
                },
                createdBy: {
                    email: currentUser?.emailAddress || 'unknown',
                    firstName: currentUser?.firstName || 'Unknown',
                    lastName: currentUser?.lastName || 'User',
                    avatarUrl: currentUser?.avatarUrl || '',
                    metadata: currentUser?.metadata || ''
                }
            };

            await CaseService.create(payload);

            // Synchronize Client if creating a new case
            if (!isEditMode) {
                try {
                    const clientPayload = {
                        clientName: clientDetails.clientName,
                        businessName: clientDetails.businessName,
                        taxId: clientDetails.taxId,
                        email: clientDetails.email,
                        mobile: clientDetails.mobile,
                        businessAddress: [clientDetails.address1, clientDetails.address2, clientDetails.city, clientDetails.province, clientDetails.zip].filter(Boolean).join(', '),
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
                    await ClientService.create(clientPayload);
                } catch (clientError) {
                    console.error("Client sync failed", clientError);
                    // We don't block the case creation if client sync fails, 
                    // but we could notify if needed.
                }
            }

            // Generate PDF
            if (caseStatus === 'invoicing') generateInvoice(caseId, clientDetails, orderDetails, products, calculateGrandTotal);
            else generateQuotation(caseId, clientDetails, orderDetails, products, calculateGrandTotal);

            showNotification('Case saved successfully!', 'success');
            onNavigate('list');
        } catch (error) {
            showNotification(`Failed to save: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.businessName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="product-list-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Synchronizing Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-list-page">
            <div className="product-list-container">
                {/* Column 1: Client Selection Sidebar */}
                <div className={`client-selection-sidebar ${isReadOnly ? 'read-only' : ''}`}>
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Select Client</h2>
                        <p className="sidebar-subtitle">Choose from database or add manual</p>
                    </div>

                    <div className="client-search-box">
                        <FontAwesomeIcon icon={faSearch} className="search-icon-sidebar" />
                        <input
                            type="text"
                            className="client-search-input"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Table-style Headers */}
                    <div className="sidebar-table-header">
                        <div className="sidebar-header-col col-init">Init</div>
                        <div className="sidebar-header-col col-info">Client / Business</div>
                    </div>

                    <div className="client-list-scroll">
                        <div className="client-cards-list">
                            {filteredClients.length === 0 ? (
                                <div className="sidebar-empty">No clients found</div>
                            ) : (
                                filteredClients.map(client => {
                                    const id = client.clientId || client.id || client._id || client.PK;
                                    const initials = (client.clientName || client.businessName || '??').substring(0, 2).toUpperCase();
                                    const isSelected = (clientDetails.clientName === client.clientName || clientDetails.businessName === client.businessName);

                                    return (
                                        <div
                                            key={id}
                                            className={`client-row-item ${isSelected ? 'active' : ''}`}
                                            onClick={() => handleClientSelect(client)}
                                        >
                                            <div className="sidebar-row-col col-init">
                                                <span className="sidebar-initial-badge">{initials.charAt(0)}</span>
                                            </div>
                                            <div className="sidebar-row-col col-info">
                                                <div className="sidebar-info-stack">
                                                    <span className="sidebar-client-name">{client.clientName || 'Unknown'}</span>
                                                    {client.businessName && (
                                                        <span className="sidebar-business-name">{client.businessName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <button
                        className="manual-entry-btn"
                        onClick={handleManualInput}
                        disabled={isReadOnly}
                    >
                        <FontAwesomeIcon icon={faUserPlus} /> Manual Entry
                    </button>
                </div>

                {/* Column 2: FullPage Details */}
                <div className="full-page-wrapper">
                    <div className="step-indicator">
                        <button className="back-btn" onClick={() => onNavigate('list')}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Back to Board
                        </button>
                    </div>

                    <FullPage
                        clientDetails={clientDetails}
                        onClientChange={setClientDetails}
                        orderDetails={orderDetails}
                        onOrderChange={setOrderDetails}
                        products={products}
                        availableProducts={availableProducts}
                        onProductUpdate={updateProduct}
                        onProductAdd={addProduct}
                        onProductRemove={removeProduct}
                        includeVat={includeVat}
                        calculateGrandTotal={calculateGrandTotal}
                        onGeneratePDF={handleSaveAndGenerate}
                        caseStatus={caseStatus}
                        isEditMode={isEditMode}
                        isReadOnly={isReadOnly}
                        activeCaseId={activeCaseId}
                        setShowJourney={setShowJourney}
                    />
                </div>
            </div>
            {showJourney && <CaseJourney caseId={activeCaseId} onClose={() => setShowJourney(false)} />}
        </div>
    );
};

export default ProductList;
