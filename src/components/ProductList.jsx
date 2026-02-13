import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';
import ProductForm from './ProductForm';
import ClientInfoStep from './ClientInfoStep';
import './ProductList.css';

const ProductList = () => {
    const [currentStep, setCurrentStep] = useState(1); // Step 1: Client Info, Step 2: Products

    const [products, setProducts] = useState([
        { id: 1, productId: '', name: '', price: 0, quantity: 1, thumbnail: '', condition: 'Brand New' }
    ]);

    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        businessName: '',
        taxId: '',
        businessAddress: '',
        date: new Date().toISOString().split('T')[0],
        terms: ''
    });

    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => {
        fetch('https://dummyjson.com/products?limit=100')
            .then(res => res.json())
            .then(data => setAvailableProducts(data.products))
            .catch(err => console.error("Failed to load products", err));
    }, []);

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
        try {
            const payload = {
                caseId,
                timestamp,
                data: {
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

            const response = await fetch('http://localhost:3000/v3/test', {
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
            alert(`Order saved successfully! Case ID: ${caseId}`);
        } catch (error) {
            console.error('Error saving to database:', error);
            alert(`Failed to save order to database: ${error.message}`);
        }
    };

    const generatePDF = async () => {
        const caseId = uuidv4();
        const timestamp = new Date().toISOString();
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Product Order Summary", 14, 22);

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
        doc.text(`Date: ${clientDetails.date}`, 14, yPos);
        doc.text(`Terms: ${clientDetails.terms ? clientDetails.terms + ' Days' : 'N/A'}`, 110, yPos);

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

        // Save PDF with UUID filename
        doc.save(`${caseId}.pdf`);

        // Save to backend API
        await saveToDatabase(caseId, timestamp);
    };

    const handleNext = () => {
        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    // Step 1: Client Information
    if (currentStep === 1) {
        return (
            <div className="app-container">
                <header className="app-header">
                    <h1 className="heading">Dynamic Product Manager</h1>
                    <p className="subtitle">Add, select, and manage product inventory seamlessly.</p>
                </header>

                <ClientInfoStep
                    clientDetails={clientDetails}
                    onChange={setClientDetails}
                    onNext={handleNext}
                />
            </div>
        );
    }

    // Step 2: Product Management
    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="heading">Dynamic Product Manager</h1>
                <p className="subtitle">Add, select, and manage product inventory seamlessly.</p>
            </header>

            {/* Step Indicator & Client Summary */}
            <div className="step-indicator">
                <button className="back-btn" onClick={handleBack}>
                    ← Back to Client Info
                </button>
                <div className="client-summary">
                    <span className="summary-label">Client:</span>
                    <span className="summary-value">
                        {clientDetails.clientName || clientDetails.businessName || 'N/A'}
                    </span>
                </div>
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
                    />
                ))}
            </div>

            {/* Add Button moved to body below products */}
            <div className="add-button-container">
                <button
                    className="add-btn"
                    onClick={addProduct}
                >
                    <span className="icon">+</span> Add New Product
                </button>
            </div>

            <div className="controls-area">
                <div className="controls-wrapper">
                    <button
                        className="glass-btn generate-btn"
                        onClick={generatePDF}
                    >
                        <span className="icon">📄</span> Generate PDF
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
