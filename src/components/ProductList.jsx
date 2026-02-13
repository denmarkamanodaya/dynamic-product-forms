import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProductForm from './ProductForm';
import './ProductList.css';

const ProductList = () => {
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

    const generatePDF = () => {
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

        // Save PDF
        doc.save("product-order.pdf");
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="heading">Dynamic Product Manager</h1>
                <p className="subtitle">Add, select, and manage product inventory seamlessly.</p>
            </header>

            <div className="client-details-section glass-panel">
                <h2 className="section-title">Client Information</h2>
                <div className="details-grid">
                    <div className="input-group">
                        <label>Client Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={clientDetails.clientName}
                            onChange={(e) => setClientDetails({ ...clientDetails, clientName: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Business Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={clientDetails.businessName}
                            onChange={(e) => setClientDetails({ ...clientDetails, businessName: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Tax Identity Number</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={clientDetails.taxId}
                            onChange={(e) => setClientDetails({ ...clientDetails, taxId: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Business Address</label>
                        <input
                            type="text"
                            className="glass-input"
                            value={clientDetails.businessAddress}
                            onChange={(e) => setClientDetails({ ...clientDetails, businessAddress: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Date</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={clientDetails.date}
                            onChange={(e) => setClientDetails({ ...clientDetails, date: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>No. of Terms (Days)</label>
                        <input
                            type="number"
                            className="glass-input"
                            value={clientDetails.terms}
                            onChange={(e) => setClientDetails({ ...clientDetails, terms: e.target.value })}
                        />
                    </div>
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
        </div>
    );
};

export default ProductList;
