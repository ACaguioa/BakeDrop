import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

// =====================================================
// LOCAL PRODUCT IMAGES
// =====================================================

import assorted from "../../assets/products/assorted.jpg";
import banana from "../../assets/products/banana.jpg";
import cheesebread from "../../assets/products/cheesebread.jpg";
import cheesedesal from "../../assets/products/cheesedesal.jpg";
import chocoroll from "../../assets/products/chocoroll.jpg";
import customize from "../../assets/products/customize.jpg";
import donuts from "../../assets/products/donuts.jpg";
import eggpie from "../../assets/products/eggpie.jpg";
import ensaymada from "../../assets/products/ensaymada.jpg";
import garlic from "../../assets/products/garlic.jpg";
import kababayan from "../../assets/products/kababayan.jpg";
import loaf from "../../assets/products/loaf.jpg";
import mangoroll from "../../assets/products/mangoroll.jpg";
import mocharoll from "../../assets/products/mocharoll.jpg";
import pandecoco from "../../assets/products/pandecoco.jpg";
import pandesal from "../../assets/products/pandesal.jpg";
import pianono from "../../assets/products/pianono.jpg";
import raisin from "../../assets/products/raisin.jpg";
import spanish from "../../assets/products/spanish.jpg";
import ubedesal from "../../assets/products/ubedesal.jpg";
import ubeensaymada from "../../assets/products/ubeensaymada.jpg";

// =====================================================
// IMAGE MAP
// =====================================================

const productImages = {
  "assorted.jpg": assorted,
  "banana.jpg": banana,
  "cheesebread.jpg": cheesebread,
  "cheesedesal.jpg": cheesedesal,
  "chocoroll.jpg": chocoroll,
  "customize.jpg": customize,
  "donuts.jpg": donuts,
  "eggpie.jpg": eggpie,
  "ensaymada.jpg": ensaymada,
  "garlic.jpg": garlic,
  "kababayan.jpg": kababayan,
  "loaf.jpg": loaf,
  "mangoroll.jpg": mangoroll,
  "mocharoll.jpg": mocharoll,
  "pandecoco.jpg": pandecoco,
  "pandesal.jpg": pandesal,
  "pianono.jpg": pianono,
  "raisin.jpg": raisin,
  "spanish.jpg": spanish,
  "ubedesal.jpg": ubedesal,
  "ubeensaymada.jpg": ubeensaymada,
};

// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL = "http://localhost:5000";

// =====================================================
// IMAGE HELPER
// =====================================================

function getProductImage(image) {
  if (!image) {
    return customize;
  }

  const imageString = String(image).trim();

  if (!imageString) {
    return customize;
  }

  const filename = imageString.split("/").pop();

  // Existing Vite/local image
  if (productImages[filename]) {
    return productImages[filename];
  }

  // Backend uploaded image
  if (imageString.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageString}`;
  }

  // New product image
  // Saved to frontend src/assets/products
  if (imageString.startsWith("/src-assets/products/")) {
    return `${API_BASE_URL}${imageString}`;
  }

  // Full URL
  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  return customize;
}

// =====================================================
// ADMIN PRODUCTS
// =====================================================

function AdminProducts() {
  // ===================================================
  // PRODUCTS
  // ===================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ===================================================
  // CATEGORIES
  // ===================================================

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoriesError, setCategoriesError] = useState("");

  // ===================================================
  // EDITING PRODUCT
  // ===================================================

  const [editingProduct, setEditingProduct] = useState(null);

  // ===================================================
  // ADDING PRODUCT
  // ===================================================

  const [addingProduct, setAddingProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    category_id: "",
    name: "",
    description: "",
    unit_description: "",
    price: "",
    customizable: false,
    is_available: true,
  });

  const [newProductFile, setNewProductFile] = useState(null);

  const [newProductPreview, setNewProductPreview] = useState(null);

  const [creatingProduct, setCreatingProduct] = useState(false);

  // ===================================================
  // SELECTED IMAGE FOR EDIT
  // ===================================================

  const [selectedFile, setSelectedFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  // ===================================================
  // SAVING
  // ===================================================

  const [savingProduct, setSavingProduct] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  // ===================================================
  // TOKEN
  // ===================================================

  function getToken() {
    return localStorage.getItem("bakedrop-token");
  }

  // ===================================================
  // SAFE JSON RESPONSE
  // ===================================================
  //
  // This prevents the confusing:
  //
  // Unexpected token '<', "<!DOCTYPE..."
  //
  // error from hiding the actual HTTP error.
  // ===================================================

  async function parseJsonResponse(response) {
    const contentType =
      response.headers.get("content-type") || "";

    const responseText = await response.text();

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText} instead of JSON.`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Invalid JSON response:", responseText);

      throw new Error(
        "The server returned invalid JSON."
      );
    }
  }

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ===================================================
  // LOAD PRODUCTS
  // ===================================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/products`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load products."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (error) {
      console.error(
        "Admin products error:",
        error
      );

      setError(
        error.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  async function fetchCategories() {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");

      const token = getToken();

      // IMPORTANT:
      //
      // Correct endpoint:
      // /api/products/categories
      //
      // NOT:
      // /api/categories
      //
      const response = await fetch(
        `${API_BASE_URL}/api/products/categories`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load categories."
        );
      }

      const loadedCategories =
        Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data)
          ? data
          : [];

      setCategories(
        loadedCategories
      );
    } catch (error) {
      console.error(
        "Categories error:",
        error
      );

      setCategoriesError(
        error.message ||
          "Failed to load categories."
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  // ===================================================
  // OPEN ADD PRODUCT
  // ===================================================

  function handleOpenAddProduct() {
    setNewProduct({
      category_id: "",
      name: "",
      description: "",
      unit_description: "",
      price: "",
      customizable: false,
      is_available: true,
    });

    setNewProductFile(null);

    setNewProductPreview(null);

    setAddingProduct(true);

    // Refresh categories when opening modal
    fetchCategories();
  }

  // ===================================================
  // CLOSE ADD PRODUCT
  // ===================================================

  function handleCloseAddProduct() {
    if (creatingProduct) {
      return;
    }

    setAddingProduct(false);

    setNewProduct({
      category_id: "",
      name: "",
      description: "",
      unit_description: "",
      price: "",
      customizable: false,
      is_available: true,
    });

    setNewProductFile(null);

    setNewProductPreview(null);
  }

  // ===================================================
  // NEW PRODUCT IMAGE
  // ===================================================

  function handleNewProductFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please choose a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert(
        "Image must be 5 MB or smaller."
      );

      event.target.value = "";

      return;
    }

    // Revoke previous preview
    if (newProductPreview) {
      URL.revokeObjectURL(
        newProductPreview
      );
    }

    setNewProductFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setNewProductPreview(previewUrl);
  }

  // ===================================================
  // CREATE PRODUCT
  // ===================================================

  async function handleCreateProduct() {
    // ===============================================
    // CATEGORY
    // ===============================================

    const categoryId = Number(
      newProduct.category_id
    );

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      alert(
        "Please select a product category."
      );

      return;
    }

    // ===============================================
    // NAME
    // ===============================================

    if (!newProduct.name.trim()) {
      alert(
        "Please enter a product name."
      );

      return;
    }

    // ===============================================
    // DESCRIPTION
    // ===============================================

    if (!newProduct.description.trim()) {
      alert(
        "Please enter a product description."
      );

      return;
    }

    // ===============================================
    // PRICE
    // ===============================================

    const price = Number(
      newProduct.price
    );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert(
        "Please enter a valid product price."
      );

      return;
    }

    // ===============================================
    // IMAGE
    // ===============================================

    if (!newProductFile) {
      alert(
        "Please select a product image."
      );

      return;
    }

    try {
      setCreatingProduct(true);

      const token = getToken();

      const formData = new FormData();

      // CATEGORY
      formData.append(
        "category_id",
        String(categoryId)
      );

      // NAME
      formData.append(
        "name",
        newProduct.name.trim()
      );

      // DESCRIPTION
      formData.append(
        "description",
        newProduct.description.trim()
      );

      // UNIT DESCRIPTION
      formData.append(
        "unit_description",
        newProduct.unit_description.trim()
      );

      // PRICE
      formData.append(
        "price",
        String(price)
      );

      // CUSTOMIZABLE
      formData.append(
        "customizable",
        newProduct.customizable
          ? "true"
          : "false"
      );

      // AVAILABILITY
      formData.append(
        "is_available",
        newProduct.is_available
          ? "true"
          : "false"
      );

      // IMAGE
      formData.append(
        "image",
        newProductFile
      );

      // =============================================
      // SEND REQUEST
      // =============================================

      const response = await fetch(
        `${API_BASE_URL}/api/products`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data =
        await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create product."
        );
      }

      // =============================================
      // ADD PRODUCT TO LIST
      // =============================================

      if (data.product) {
        setProducts(
          (currentProducts) =>
            [
              ...currentProducts,
              data.product,
            ].sort((a, b) =>
              String(
                a.name
              ).localeCompare(
                String(b.name)
              )
            )
        );
      } else {
        await fetchProducts();
      }

      // =============================================
      // CLOSE MODAL
      // =============================================

      setAddingProduct(false);

      // =============================================
      // RESET FORM
      // =============================================

      setNewProduct({
        category_id: "",
        name: "",
        description: "",
        unit_description: "",
        price: "",
        customizable: false,
        is_available: true,
      });

      if (newProductPreview) {
        URL.revokeObjectURL(
          newProductPreview
        );
      }

      setNewProductFile(null);

      setNewProductPreview(null);

      alert(
        "Product created successfully."
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      alert(
        error.message ||
          "Failed to create product."
      );
    } finally {
      setCreatingProduct(false);
    }
  }

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================

  function handleEditProduct(product) {
    setEditingProduct({
      id: product.id,

      name: product.name,

      description:
        product.description || "",

      unit_description:
        product.unit_description || "",

      price: product.price,

      is_available: Boolean(
        product.is_available
      ),

      customizable: Boolean(
        product.customizable
      ),

      image: product.image,
    });

    setSelectedFile(null);

    setImagePreview(null);
  }

  // ===================================================
  // CLOSE EDIT MODAL
  // ===================================================

  function handleCloseEdit() {
    if (
      uploadingImage ||
      savingProduct
    ) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setEditingProduct(null);

    setSelectedFile(null);

    setImagePreview(null);
  }

  // ===================================================
  // EDIT IMAGE
  // ===================================================

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please choose a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert(
        "Image must be 5 MB or smaller."
      );

      event.target.value = "";

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // ===================================================
  // UPLOAD EDIT IMAGE
  // ===================================================

  async function handleUploadImage() {
    if (!editingProduct) {
      return;
    }

    if (!selectedFile) {
      alert(
        "Please select an image first."
      );

      return;
    }

    try {
      setUploadingImage(true);

      const token = getToken();

      const formData = new FormData();

      formData.append(
        "image",
        selectedFile
      );

      const response = await fetch(
        `${API_BASE_URL}/api/products/${editingProduct.id}/image`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data =
        await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload image."
        );
      }

      setProducts(
        (currentProducts) =>
          currentProducts.map(
            (product) =>
              Number(product.id) ===
              Number(
                editingProduct.id
              )
                ? {
                    ...product,
                    image:
                      data.product
                        ?.image ||
                      product.image,
                  }
                : product
          )
      );

      setEditingProduct(
        (current) => ({
          ...current,

          image:
            data.product?.image ||
            current.image,
        })
      );

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setSelectedFile(null);

      setImagePreview(null);

      alert(
        "Product image updated successfully."
      );
    } catch (error) {
      console.error(
        "Upload image error:",
        error
      );

      alert(
        error.message ||
          "Failed to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  // ===================================================
  // SAVE PRODUCT
  // ===================================================

  async function handleSaveProduct() {
    if (!editingProduct) {
      return;
    }

    try {
      const price = Number(
        editingProduct.price
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        alert(
          "Please enter a valid product price."
        );

        return;
      }

      setSavingProduct(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/products/${editingProduct.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            price,

            is_available:
              editingProduct.is_available,

            daily_order_limit: 0,
          }),
        }
      );

      const data =
        await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update product."
        );
      }

      setProducts(
        (currentProducts) =>
          currentProducts.map(
            (product) =>
              Number(product.id) ===
              Number(
                editingProduct.id
              )
                ? {
                    ...product,
                    ...(data.product ||
                      {}),
                  }
                : product
          )
      );

      setEditingProduct(null);

      setSelectedFile(null);

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImagePreview(null);

      alert(
        "Product updated successfully."
      );
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      alert(
        error.message ||
          "Failed to update product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  // ===================================================
  // FORMAT PRICE
  // ===================================================

  function formatPrice(price) {
    return Number(
      price || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNavbar />

        <main className="admin-main">
          <section className="admin-page">
            <div className="admin-container">
              <div className="admin-loading">
                Loading products...
              </div>
            </div>
          </section>
        </main>

        <AdminFooter />
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main">
        <section className="admin-page">
          <div className="admin-container">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="admin-page-header">
              <div>
                <span className="admin-eyebrow">
                  BAKEDROP ADMIN
                </span>

                <h1>
                  Product <em>Management</em>
                </h1>

                <p>
                  Manage product prices,
                  availability, categories,
                  and images.
                </p>
              </div>

              <button
                type="button"
                className="admin-button"
                onClick={
                  handleOpenAddProduct
                }
              >
                + Add Product
              </button>
            </div>

            {/* =========================================
                ERROR
            ========================================= */}

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {/* =========================================
                CATEGORY ERROR
            ========================================= */}

            {categoriesError && (
              <div className="admin-error">
                {categoriesError}
              </div>
            )}

            {/* =========================================
                PRODUCT LIST
            ========================================= */}

            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-eyebrow">
                    PRODUCTS
                  </span>

                  <h2>
                    BakeDrop Menu
                  </h2>
                </div>

                <span>
                  {products.length} products
                </span>
              </div>

              <div className="admin-product-management-list">

                {products.length === 0 ? (
                  <div className="admin-empty-state">
                    No products found.
                  </div>
                ) : (
                  products.map(
                    (product) => (
                      <div
                        key={product.id}
                        className="admin-product-management-row"
                      >

                        {/* IMAGE */}

                        <div className="admin-product-image">
                          <img
                            src={getProductImage(
                              product.image
                            )}
                            alt={
                              product.name
                            }
                          />
                        </div>

                        {/* INFORMATION */}

                        <div className="admin-product-management-info">
                          <span className="admin-eyebrow">
                            {product.category_name ||
                              "Bakery"}
                          </span>

                          <h3>
                            {product.name}
                          </h3>

                          <strong>
                            ₱
                            {formatPrice(
                              product.price
                            )}
                          </strong>
                        </div>

                        {/* AVAILABILITY */}

                        <div className="admin-product-availability">
                          <span>
                            AVAILABILITY
                          </span>

                          <strong>
                            {product.is_available
                              ? "Available"
                              : "Unavailable"}
                          </strong>
                        </div>

                        {/* ACTION */}

                        <button
                          type="button"
                          className="admin-button-small"
                          onClick={() =>
                            handleEditProduct(
                              product
                            )
                          }
                        >
                          Edit
                        </button>
                      </div>
                    )
                  )
                )}

              </div>
            </section>
          </div>
        </section>
      </main>

      {/* =================================================
          EDIT PRODUCT MODAL
      ================================================= */}

      {editingProduct && (
        <div
          className="admin-modal-backdrop"
          onClick={
            handleCloseEdit
          }
        >
          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  PRODUCT MANAGEMENT
                </span>

                <h2>
                  {editingProduct.name}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  handleCloseEdit
                }
              >
                ×
              </button>
            </div>

            {/* IMAGE */}

            <div className="admin-product-edit-image">
              <img
                src={
                  imagePreview ||
                  getProductImage(
                    editingProduct.image
                  )
                }
                alt={
                  editingProduct.name
                }
              />
            </div>

            {/* CHANGE IMAGE */}

            <div className="admin-detail-section">
              <h3>
                Product Image
              </h3>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
                disabled={
                  uploadingImage ||
                  savingProduct
                }
              />

              <small>
                JPG, JPEG, PNG, or WEBP.
                Maximum 5 MB.
              </small>

              {selectedFile && (
                <div className="admin-image-upload-actions">
                  <span>
                    {selectedFile.name}
                  </span>

                  <button
                    type="button"
                    className="admin-button-small"
                    onClick={
                      handleUploadImage
                    }
                    disabled={
                      uploadingImage
                    }
                  >
                    {uploadingImage
                      ? "Uploading..."
                      : "Upload Image"}
                  </button>
                </div>
              )}
            </div>

            {/* PRICE */}

            <div className="admin-detail-section">
              <h3>
                Price
              </h3>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  editingProduct.price
                }
                onChange={(event) =>
                  setEditingProduct(
                    (current) => ({
                      ...current,
                      price:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  savingProduct
                }
              />
            </div>

            {/* AVAILABILITY */}

            <div className="admin-detail-section">
              <h3>
                Availability
              </h3>

              <select
                value={
                  editingProduct.is_available
                    ? "available"
                    : "unavailable"
                }
                onChange={(event) =>
                  setEditingProduct(
                    (current) => ({
                      ...current,
                      is_available:
                        event.target.value ===
                        "available",
                    })
                  )
                }
                disabled={
                  savingProduct
                }
              >
                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>
              </select>
            </div>

            {/* BUTTONS */}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={
                  handleCloseEdit
                }
                disabled={
                  savingProduct ||
                  uploadingImage
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-button"
                onClick={
                  handleSaveProduct
                }
                disabled={
                  savingProduct ||
                  uploadingImage
                }
              >
                {savingProduct
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADD PRODUCT MODAL
      ================================================= */}

      {addingProduct && (
        <div
          className="admin-modal-backdrop"
          onClick={
            handleCloseAddProduct
          }
        >
          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  PRODUCT MANAGEMENT
                </span>

                <h2>
                  Add New Product
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  handleCloseAddProduct
                }
                disabled={
                  creatingProduct
                }
              >
                ×
              </button>
            </div>

            {/* IMAGE PREVIEW */}

            <div className="admin-product-edit-image">
              <img
                src={
                  newProductPreview ||
                  customize
                }
                alt="New product preview"
              />
            </div>

            {/* PRODUCT IMAGE */}

            <div className="admin-detail-section">
              <h3>
                Product Image
              </h3>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={
                  handleNewProductFileChange
                }
                disabled={
                  creatingProduct
                }
              />

              <small>
                JPG, JPEG, PNG, or WEBP.
                Maximum 5 MB.
              </small>

              {newProductFile && (
                <div className="admin-image-upload-actions">
                  <span>
                    {newProductFile.name}
                  </span>
                </div>
              )}
            </div>

            {/* PRODUCT NAME */}

            <div className="admin-detail-section">
              <h3>
                Product Name
              </h3>

              <input
                type="text"
                value={
                  newProduct.name
                }
                placeholder="Enter product name"
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      name:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              />
            </div>

            {/* CATEGORY */}

            <div className="admin-detail-section">
              <h3>
                Category
              </h3>

              <select
                value={
                  newProduct.category_id
                }
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      category_id:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  creatingProduct ||
                  categoriesLoading
                }
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>

              {categories.length ===
                0 &&
                !categoriesLoading && (
                  <small>
                    No active categories
                    were found.
                  </small>
                )}
            </div>

            {/* DESCRIPTION */}

            <div className="admin-detail-section">
              <h3>
                Description
              </h3>

              <textarea
                value={
                  newProduct.description
                }
                placeholder="Enter product description"
                rows="4"
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      description:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              />
            </div>

            {/* UNIT DESCRIPTION */}

            <div className="admin-detail-section">
              <h3>
                Unit Description
              </h3>

              <input
                type="text"
                value={
                  newProduct.unit_description
                }
                placeholder="Example: per piece, per box, 500g"
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      unit_description:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              />

              <small>
                Optional. This appears as
                the product's unit or serving
                description.
              </small>
            </div>

            {/* CUSTOMIZABLE */}

            <div className="admin-detail-section">
              <h3>
                Customizable
              </h3>

              <select
                value={
                  newProduct.customizable
                    ? "yes"
                    : "no"
                }
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      customizable:
                        event.target.value ===
                        "yes",
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>
              </select>
            </div>

            {/* PRICE */}

            <div className="admin-detail-section">
              <h3>
                Price
              </h3>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  newProduct.price
                }
                placeholder="0.00"
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      price:
                        event.target.value,
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              />
            </div>

            {/* AVAILABILITY */}

            <div className="admin-detail-section">
              <h3>
                Availability
              </h3>

              <select
                value={
                  newProduct.is_available
                    ? "available"
                    : "unavailable"
                }
                onChange={(event) =>
                  setNewProduct(
                    (current) => ({
                      ...current,
                      is_available:
                        event.target.value ===
                        "available",
                    })
                  )
                }
                disabled={
                  creatingProduct
                }
              >
                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>
              </select>
            </div>

            {/* BUTTONS */}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={
                  handleCloseAddProduct
                }
                disabled={
                  creatingProduct
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-button"
                onClick={
                  handleCreateProduct
                }
                disabled={
                  creatingProduct ||
                  categoriesLoading
                }
              >
                {creatingProduct
                  ? "Creating..."
                  : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFooter />
    </div>
  );
}

export default AdminProducts;
