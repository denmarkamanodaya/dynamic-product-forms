import React from 'react';
import './ProductForm.css';
import { currencyConfig } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const ProductForm = ({ data, onChange, onRemove, index, availableProducts, readOnly }) => {

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
        <div className={`product-row glass-panel ${readOnly ? 'readonly-row' : ''}`}>
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
                        disabled={readOnly}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
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
                    disabled={readOnly}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                >
                    <option value="Brand New">Brand New</option>
                    <option value="Refill">Refill</option>
                </select>
            </div>

            {/* 2. Price */}
            <div className="field-group price-group">
                <div className="input-wrapper symbol-input">
                    <span className="currency-symbol">{currencyConfig.symbol}</span>
                    <input
                        type="number"
                        className="glass-input"
                        value={data.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        disabled={readOnly}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
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
                    disabled={readOnly}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                />
            </div>

            {/* 4. Total */}
            <div className="field-group total-group">
                <span className="row-total">
                    {currencyConfig.code} {((data.price || 0) * (data.quantity || 1)).toFixed(2)}
                </span>
            </div>

            {/* 5. Actions */}
            {!readOnly && (
                <button
                    onClick={() => onRemove(index)}
                    className="remove-btn"
                    title="Remove Item"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
        </div>
    );
};

export default ProductForm;
