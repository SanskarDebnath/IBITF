import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";
import { HIDE_PRODUCT_PRICES } from "../../config/commerce";

export default function ProductRow({ title, subtitle, products }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [imageStatus, setImageStatus] = useState({});

  useEffect(() => {
    setImageStatus((previous) => {
      const next = {};
      products.forEach((product) => {
        if (!product?.id) return;

        if (!product.image) {
          next[product.id] = "no-image";
          return;
        }

        next[product.id] = previous[product.id] || "loading";
      });
      return next;
    });
  }, [products]);

  const handleImageLoad = (id) => {
    setImageStatus((prev) => ({ ...prev, [id]: "loaded" }));
  };

  const handleImageError = (id) => {
    setImageStatus((prev) => ({ ...prev, [id]: "error" }));
  };

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
          const status = imageStatus[product.id] || (product.image ? "loading" : "no-image");
          const isLoaded = status === "loaded";
          const isError = status === "error" || status === "no-image";

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
                <div className={`product-card__image ${!isLoaded && !isError ? "loading-center" : ""}`}>
                  {!isLoaded && !isError && <div className="ios-spinner"></div>}

                  {isError && <div className="fallback-icon">IMG</div>}

                  {!isError && product.image && (
                    <div className="image-wrapper">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={isLoaded ? "loaded" : ""}
                        onLoad={() => handleImageLoad(product.id)}
                        onError={() => handleImageError(product.id)}
                      />
                    </div>
                  )}
                </div>
                <div className="product-card__body">
                  <h4 className="product-card__title">{product.name}</h4>
                  <p className="product-card__desc">{product.description}</p>
                  {product.rating && (
                    <div className="product-card__rating">
                      {"\u2605".repeat(Math.floor(product.rating))}
                      <span style={{ color: "#6b7280", marginLeft: "8px" }}>{product.rating}</span>
                    </div>
                  )}
                  <div className="product-card__footer">
                    <p className="product-card__price">
                      {HIDE_PRODUCT_PRICES ? "Price hidden" : `\u20B9${product.price}`}
                    </p>
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
