import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";

export default function ProductRow({ title, subtitle, products }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loadedImages, setLoadedImages] = useState({});

    const handleImageLoad = (id) => {
        setLoadedImages(prev => ({ ...prev, [id]: true }));
    };

    const handleImageError = (id) => {
        setLoadedImages(prev => ({ ...prev, [id]: 'error' }));
    };

    // Simulate loading delay for demo
    useEffect(() => {
        const timer = setTimeout(() => {
            products.forEach(product => {
                if (product.image && !loadedImages[product.id]) {
                    handleImageLoad(product.id);
                }
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [products]);

    return (
        <section className="product-row-section">
            <div className="product-row-header">
                <div>
                    <h3>{title}</h3>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                <Link to="/products" className="view-all-link">
                    View All
                </Link>
            </div>

            <div className="carousel">
                {products.map((product) => {
                    const isLoaded = loadedImages[product.id];
                    const isError = isLoaded === 'error';

                    return (
                        <div key={product.id} className="carousel__item">
                            <div
                                className="product-card"
                                onClick={() => navigate(`/products/${product.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        navigate(`/products/${product.id}`);
                                    }
                                }}
                            >
                                <div className={`product-card__image ${!isLoaded && !isError ? 'loading-center' : ''}`}>
                                    {!isLoaded && !isError && (
                                        <div className="ios-spinner"></div>
                                    )}

                                    {isError && (
                                        <div className="fallback-icon">🎁</div>
                                    )}

                                    {isLoaded && !isError && product.image && (
                                        <div className="image-wrapper">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={isLoaded ? 'loaded' : ''}
                                                onLoad={() => handleImageLoad(product.id)}
                                                onError={() => handleImageError(product.id)}
                                            />
                                        </div>
                                    )}

                                    {isLoaded && !isError && !product.image && (
                                        <div className="fallback-icon">🎁</div>
                                    )}
                                </div>
                                <div className="product-card__body">
                                    <h4 className="product-card__title">{product.name}</h4>
                                    <p className="product-card__desc">{product.description}</p>
                                    {product.rating && (
                                        <div className="product-card__rating">
                                            {'★'.repeat(Math.floor(product.rating))}
                                            <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                                                {product.rating}
                                            </span>
                                        </div>
                                    )}
                                    <div className="product-card__footer">
                                        <p className="product-card__price">₹{product.price}</p>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                addToCart(product);
                                                showToast(`${product.name} added to cart`, "success");
                                            }}
                                            className="product-card__button"
                                        >
                                            Add to Cart
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
