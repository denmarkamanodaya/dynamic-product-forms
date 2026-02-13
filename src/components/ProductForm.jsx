import React from 'react';
import './ProductForm.css';

const ProductForm = ({ data, onChange, onRemove, index, availableProducts }) => {

    const handleProductSelect = (e) => {
        const selectedId = parseInt(e.target.value);
        const product = availableProducts.find(p => p.id === selectedId);

        if (product) {
            onChange(index, {
                ...data,
                productId: product.id,
                name: product.title,
                price: product.price,
                description: product.description,
                thumbnail: product.thumbnail
            });
        } else {
            onChange(index, {
                ...data,
                productId: '',
                name: '',
                price: 0,
                description: '',
                thumbnail: ''
            });
        }
    };

    const handleChange = (field, value) => {
        onChange(index, { ...data, [field]: value });
    };

    return (
        <div className="product-row glass-panel">
            {/* 1. Product Selection & Preview */}
            <div className="field-group product-select-group">
                <div className="select-wrapper">
                    {data.thumbnail && (
                        <img src={data.thumbnail} alt={data.name} className="mini-thumb" />
                    )}
                    <select
                        className="glass-input custom-select"
                        value={data.productId || ''}
                        onChange={handleProductSelect}
                    >
                        <option value="">Select a Product...</option>
                        {availableProducts && availableProducts.length > 0 ? (
                            availableProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))
                        ) : (
                            <option disabled>Loading...</option>
                        )}
                    </select>
                </div>
            </div>

            {/* 1.5 Condition */}
            <div className="field-group condition-group">
                <select
                    className="glass-input"
                    value={data.condition || 'Brand New'}
                    onChange={(e) => handleChange('condition', e.target.value)}
                >
                    <option value="Brand New">Brand New</option>
                    <option value="Refill">Refill</option>
                </select>
            </div>

            {/* 2. Price */}
            <div className="field-group price-group">
                <div className="input-wrapper symbol-input">
                    <span className="currency-symbol">Php</span>
                    <input
                        type="number"
                        className="glass-input"
                        value={data.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                    />
                </div>
            </div>

            {/* 3. Quantity */}
            <div className="field-group qty-group">
                <input
                    type="number"
                    className="glass-input center-text"
                    value={data.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                    min="1"
                />
            </div>

            {/* 4. Total */}
            <div className="field-group total-group">
                <span className="row-total">
                    Php {((data.price || 0) * (data.quantity || 1)).toFixed(2)}
                </span>
            </div>

            {/* 5. Actions */}
            <button
                onClick={() => onRemove(index)}
                className="remove-btn"
                title="Remove Item"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    );
};

export default ProductForm;
