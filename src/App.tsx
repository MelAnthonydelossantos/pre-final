import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './App.css';

type Product = {
  id: number;
  image: string;
  name: string;
  category: string;
  description: string;
  specification: string;
  rating: number;
  price: number;
  quantity: number;
};

type ProductForm = {
  image: string;
  name: string;
  category: string;
  description: string;
  specification: string;
  rating: string;
  price: string;
  quantity: string;
};

const formatCurrency = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const defaultProducts: Product[] = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    name: 'Laptop Pro 14',
    category: 'Electronics',
    description: 'A sleek premium laptop designed for productivity and creative work.',
    specification: '14-inch Retina display, 16GB RAM, 1TB SSD',
    rating: 4.8,
    price: 1299,
    quantity: 1,
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    name: 'Pulse Smartwatch',
    category: 'Accessories',
    description: 'Track your fitness goals with a vibrant AMOLED display and long battery life.',
    specification: 'GPS, heart rate monitoring, 7-day battery',
    rating: 4.6,
    price: 249,
    quantity: 2,
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    name: 'Velocity Runner',
    category: 'Footwear',
    description: 'Lightweight running shoes built with responsive cushioning and breathable mesh.',
    specification: 'Engineered knit upper, cushioned sole, everyday support',
    rating: 4.7,
    price: 139,
    quantity: 3,
  },
];

const initialForm: ProductForm = {
  image: '',
  name: '',
  category: 'Electronics',
  description: '',
  specification: '',
  rating: '4.5',
  price: '',
  quantity: '1',
};

function App() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [formData, setFormData] = useState<ProductForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(null);

  const cartItems = products.filter((product) => (cart[product.id] ?? 0) > 0);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, product) => sum + product.price * (cart[product.id] ?? 0),
    0,
  );

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof ProductForm, string>> = {};

    if (!formData.image.trim()) {
      nextErrors.image = 'Image URL is required.';
    }

    if (!formData.name.trim()) {
      nextErrors.name = 'Product name is required.';
    }

    if (!formData.category.trim()) {
      nextErrors.category = 'Category is required.';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required.';
    }

    if (!formData.specification.trim()) {
      nextErrors.specification = 'Specification is required.';
    }

    const rating = Number(formData.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      nextErrors.rating = 'Rating must be between 1 and 5.';
    }

    const price = Number(formData.price);
    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'Price must be greater than zero.';
    }

    const quantity = Number(formData.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      nextErrors.quantity = 'Quantity must be a positive whole number.';
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      image: formData.image.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      specification: formData.specification.trim(),
      rating: Number(formData.rating),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    };

    setProducts((currentProducts) => [newProduct, ...currentProducts]);
    setFormData(initialForm);
    setErrors({});
  };

  const updateQuantity = (id: number, delta: number) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              quantity: Math.max(0, product.quantity + delta),
            }
          : product,
      ),
    );

    if (delta > 0) {
      setCart((current) => ({
        ...current,
        [id]: (current[id] ?? 0) + 1,
      }));
      setLastAddedProductId(id);
    } else {
      setCart((current) => {
        const currentQuantity = current[id] ?? 0;
        if (currentQuantity <= 1) {
          const nextCart = { ...current };
          delete nextCart[id];
          return nextCart;
        }

        return { ...current, [id]: currentQuantity - 1 };
      });
    }
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>Mel Anthony&apos;s Product</h1>
        </div>
        <div className="header-actions">
          <div className="cart-container">
            <button
              type="button"
              className="cart-button"
              aria-label={`Shopping cart, ${cartCount} items`}
              aria-expanded={isCartOpen}
              aria-controls="cart-panel"
              onClick={() => setIsCartOpen((isOpen) => !isOpen)}
            >
              <svg
                className="cart-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-label">Cart</span>
              <span className="cart-badge">{cartCount}</span>
            </button>
            {isCartOpen && (
              <section className="cart-panel" id="cart-panel" aria-label="Shopping cart contents">
                <h2>Your Cart</h2>
                {cartItems.length === 0 ? (
                  <p className="empty-cart">Your cart is empty. Add a product to see it here.</p>
                ) : (
                  <>
                    <ul className="cart-items">
                      {cartItems.map((product) => (
                        <li className="cart-item" key={product.id}>
                          <img src={product.image} alt="" />
                          <div className="cart-item-info">
                            <strong>{product.name}</strong>
                            <span>
                              {cart[product.id]} × {formatCurrency.format(product.price)}
                            </span>
                          </div>
                          <strong>
                            {formatCurrency.format(product.price * (cart[product.id] ?? 0))}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    <div className="cart-total">
                      <span>Cart total</span>
                      <strong>{formatCurrency.format(cartTotal)}</strong>
                    </div>
                    {lastAddedProductId !== null && (
                      <button
                        type="button"
                        className="view-added-button"
                        onClick={() => {
                          setIsCartOpen(false);
                          requestAnimationFrame(() => {
                            document
                              .getElementById(`product-${lastAddedProductId}`)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          });
                        }}
                      >
                        View last added product
                      </button>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </div>
      </header>

      <div className="content-grid">
        <section className="panel product-panel">
          <div className="section-heading">
            <h2>Display Product List</h2>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} id={`product-${product.id}`}>
                    <td>
                      <img className="product-thumb" src={product.image} alt={product.name} />
                    </td>
                    <td>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <span>{product.category}</span>
                        <small>{product.description}</small>
                      </div>
                    </td>
                    <td>{formatCurrency.format(product.price)}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency.format(product.price * product.quantity)}</td>
                    <td>
                      <div className="action-buttons">
                        <button type="button" onClick={() => updateQuantity(product.id, 1)}>
                          Add
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={product.quantity === 0}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel form-panel">
          <div className="section-heading">
            <h2>Add New Product</h2>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <label>
              <span>Feature Image</span>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && <small>{errors.image}</small>}
            </label>

            <label>
              <span>Product Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Product name"
              />
              {errors.name && <small>{errors.name}</small>}
            </label>

            <label>
              <span>Product Category</span>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Footwear">Footwear</option>
                <option value="Home">Home</option>
              </select>
              {errors.category && <small>{errors.category}</small>}
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief product description"
              />
              {errors.description && <small>{errors.description}</small>}
            </label>

            <label>
              <span>Specification</span>
              <textarea
                name="specification"
                value={formData.specification}
                onChange={handleInputChange}
                placeholder="Technical specification"
              />
              {errors.specification && <small>{errors.specification}</small>}
            </label>

            <div className="inline-fields">
              <label>
                <span>Rating</span>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleInputChange}
                />
                {errors.rating && <small>{errors.rating}</small>}
              </label>

              <label>
                <span>Price</span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
                {errors.price && <small>{errors.price}</small>}
              </label>

              <label>
                <span>Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
                {errors.quantity && <small>{errors.quantity}</small>}
              </label>
            </div>

            <button type="submit" className="submit-button">
              Add Product
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export default App;
