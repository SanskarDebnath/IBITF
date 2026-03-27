import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addSellerProduct } from "../../services/sellerService";
import { listCategories } from "../../services/catalogService";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  readFileAsDataUrl,
  validateProductImage
} from "./productImageUtils";
import "./SellerForms.css";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    specifications: "",
    price: "",
    stock: "",
    categoryId: "",
    image: "",
    status: "active"
  });
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await listCategories();
        setCategories(data || []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProductImage(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setFormData((prev) => ({ ...prev, image }));
      setImageName(file.name);
      setError("");
      e.target.value = "";
    } catch (err) {
      setError(err.message || "Failed to process image");
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImageName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await addSellerProduct({
        ...formData,
        price: Number(formData.price || 0),
        stock: Number(formData.stock || 0),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null
      });
      navigate("/seller/products");
    } catch (err) {
      setError(err.message || "Failed to add product");
    }
  };

  return (
    <div className="seller-form-page">
      <div className="seller-form-header">
        <div>
          <h1>Add Product</h1>
          <p>Create a new product listing for your store.</p>
        </div>
        <Link className="seller-secondary-btn" to="/seller/categories/new">
          Add Category
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        <label>
          Title
          <input name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>
        <label>
          Product Details / Specifications
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            placeholder={"Material: Bamboo\nDimensions: 12 x 8 x 6 in\nWeight: 450 g"}
          />
          <span className="seller-field-hint">
            Add one specification per line as <code>Key: Value</code>.
          </span>
        </label>
        <div className="seller-form-grid">
          <label>
            Price (INR)
            <input name="price" type="number" value={formData.price} onChange={handleChange} required />
          </label>
          <label>
            Stock
            <input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
          </label>
        </div>
        <div className="seller-form-grid">
          <label>
            Category
            <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        <label>
          Product Image
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <span className="seller-field-hint">
            Upload JPG, PNG, WEBP, or other image files up to{" "}
            {Math.round(MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024))} MB.
          </span>
        </label>
        {imageName ? <div className="seller-upload-name">Selected: {imageName}</div> : null}
        {formData.image ? (
          <div className="seller-image-preview-card">
            <img className="seller-image-preview" src={formData.image} alt="Product preview" />
            <div className="seller-image-preview-actions">
              <span className="seller-field-hint">Preview of the product image.</span>
              <button type="button" className="seller-secondary-btn" onClick={handleRemoveImage}>
                Remove Image
              </button>
            </div>
          </div>
        ) : null}
        {error && <div className="seller-alert error">{error}</div>}
        <div className="seller-form-actions">
          <button type="button" className="seller-secondary-btn" onClick={() => navigate("/seller/products")}>Cancel</button>
          <button type="submit" className="seller-primary-btn">Create Product</button>
        </div>
      </form>
    </div>
  );
}
