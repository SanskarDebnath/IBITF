import { Link } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider";
import { Trash2, ShoppingBag, ArrowRight, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import "./CartPage.css";

export default function CartPage() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const taxRate = 0.18;
  const totalWithTax = total * (1 + taxRate);

  const handleClearCart = async () => {
    setIsClearing(true);
    await clearCart();
    setTimeout(() => setIsClearing(false), 300);
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-title-section">
          <ShoppingCart className="cart-icon" size={28} />
          <h1>Shopping Cart</h1>
          {items.length > 0 && (
            <span className="cart-count-badge">{items.length} items</span>
          )}
        </div>

        {items.length > 0 && (
          <button
            className="clear-cart-btn"
            onClick={handleClearCart}
            disabled={isClearing}
          >
            <Trash2 size={18} />
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag className="empty-cart-icon" size={64} />
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="browse-products-btn">
            <ShoppingBag size={20} />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-container">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item-thumbnail" />
                  ) : (
                    <div className="image-placeholder">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <div className="cart-item-title-group">
                      <Link to={`/products/${item.productId}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-meta">
                        <span>Product ID: {item.productId}</span>
                        {item.status ? <span className="cart-item-status">{item.status}</span> : null}
                      </div>
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-price">INR {(item.price * (1 + taxRate)).toFixed(2)}</div>
                    <div className="cart-item-quantity">
                      <span className="quantity-label">Quantity:</span>
                      <span className="quantity-value">{item.qty}</span>
                    </div>
                    {item.stock > 0 ? (
                      <div className="cart-item-stock">Stock: {item.stock}</div>
                    ) : null}
                  </div>

                  <div className="cart-item-subtotal">
                    Subtotal (incl. tax):{" "}
                    <span className="subtotal-amount">INR {(item.price * (1 + taxRate) * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-header">
              <h3>Order Summary</h3>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal (incl. tax)</span>
                <span>INR {totalWithTax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="summary-row">
                <span>Tax (18%)</span>
                <span>Included</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span><strong>Total</strong></span>
                <span className="total-amount">INR {totalWithTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-actions">
              <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
                <ArrowRight size={20} />
              </Link>
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}

