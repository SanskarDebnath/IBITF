import { useCart } from "../../app/providers/CartProvider";
import { useToast } from "../../app/providers/ToastProvider";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const handleAdd = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
        });

        showToast(`${product.name} added to cart`, "success");
    };

    return (
        <article className="product-card">
            <img
                src={product.image}
                alt={product.name}
                className="product-card__image"
                loading="lazy"
            />

            <div className="product-card__body">
                <h3 className="product-card__title">{product.name}</h3>
                <p className="product-card__desc">{product.description}</p>

                <div className="product-card__footer">
                    <p className="product-card__price">₹{product.price}</p>
                    <button type="button" onClick={handleAdd}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </article>
    );
}
