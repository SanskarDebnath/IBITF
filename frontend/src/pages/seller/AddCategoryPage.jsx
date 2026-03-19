import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories } from "../../services/catalogService";
import { addSellerCategory } from "../../services/sellerService";
import "./SellerForms.css";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await listCategories();
        setCategories(data || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const category = await addSellerCategory({ name });
      const updatedCategories = await listCategories();
      setCategories(updatedCategories || []);
      setName("");
      setSuccess(`Category "${category.name}" added successfully. It will show 0 products until you add a product in this category.`);
    } catch (err) {
      setError(err.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-form-page">
      <div className="seller-form-header">
        <div>
          <h1>Add Category</h1>
          <p>Create a new category so it appears in seller product forms and catalog filters.</p>
        </div>
        <Link className="seller-secondary-btn" to="/seller/products/new">
          Add Product
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        <label>
          Category Name
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Bamboo Decor"
            required
          />
        </label>

        {error && <div className="seller-alert error">{error}</div>}
        {success && <div className="seller-alert success">{success}</div>}

        <div className="seller-form-actions">
          <Link className="seller-secondary-btn" to="/seller/dashboard">
            Back to Dashboard
          </Link>
          <button type="submit" className="seller-primary-btn" disabled={submitting}>
            {submitting ? "Adding..." : "Create Category"}
          </button>
        </div>
      </form>

      <section className="seller-category-panel">
        <div className="seller-panel-header">
          <div>
            <h2>Available Categories</h2>
            <p>Use these when creating or editing products.</p>
          </div>
        </div>

        {loading ? (
          <p className="seller-empty-text">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="seller-empty-text">No categories available yet.</p>
        ) : (
          <div className="seller-category-list">
            {categories.map((category) => (
              <span key={category.id} className="seller-category-chip">
                {category.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
