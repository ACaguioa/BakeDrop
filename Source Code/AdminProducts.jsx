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
// IMAGE HELPER
// =====================================================

function getProductImage(image) {
  if (!image) {
    return customize;
  }

  const filename =
    String(image)
      .split("/")
      .pop();

  // Existing Vite/local image
  if (productImages[filename]) {
    return productImages[filename];
  }

  // Uploaded image from backend
  if (
    String(image).startsWith(
      "/uploads/"
    )
  ) {
    return `http://localhost:5000${image}`;
  }

  // Full URL
  if (
    String(image).startsWith(
      "http://"
    ) ||
    String(image).startsWith(
      "https://"
    )
  ) {
    return image;
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

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ===================================================
  // EDITING PRODUCT
  // ===================================================

  const [editingProduct, setEditingProduct] =
    useState(null);


  // ===================================================
  // SELECTED IMAGE
  // ===================================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);


  // ===================================================
  // SAVING
  // ===================================================

  const [savingProduct, setSavingProduct] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);


  // ===================================================
  // TOKEN
  // ===================================================

  function getToken() {
    return localStorage.getItem(
      "bakedrop-token"
    );
  }


  // ===================================================
  // LOAD PRODUCTS
  // ===================================================

  useEffect(() => {
    fetchProducts();
  }, []);


  async function fetchProducts() {

    try {

      setLoading(true);
      setError("");


      const token =
        getToken();


      const response =
        await fetch(
          "http://localhost:5000/api/admin/products",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to load products."
        );

      }


      setProducts(
        Array.isArray(
          data.products
        )
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
  // OPEN EDIT MODAL
  // ===================================================

  function handleEditProduct(
    product
  ) {

    setEditingProduct({
      id:
        product.id,

      name:
        product.name,

      price:
        product.price,

      is_available:
        Boolean(
          product.is_available
        ),

      image:
        product.image,

    });


    setSelectedFile(
      null
    );

    setImagePreview(
      null
    );

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


    setEditingProduct(
      null
    );

    setSelectedFile(
      null
    );

    setImagePreview(
      null
    );

  }


  // ===================================================
  // FILE SELECT
  // ===================================================

  function handleFileChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        "Please choose a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value =
        "";

      return;
    }


    const maximumSize =
      5 * 1024 * 1024;


    if (
      file.size >
      maximumSize
    ) {

      alert(
        "Image must be 5 MB or smaller."
      );

      event.target.value =
        "";

      return;
    }


    setSelectedFile(
      file
    );


    const previewUrl =
      URL.createObjectURL(
        file
      );


    setImagePreview(
      previewUrl
    );

  }


  // ===================================================
  // UPLOAD IMAGE
  // ===================================================

  async function handleUploadImage() {

    if (
      !editingProduct
    ) {
      return;
    }


    if (!selectedFile) {

      alert(
        "Please select an image first."
      );

      return;
    }


    try {

      setUploadingImage(
        true
      );


      const token =
        getToken();


      const formData =
        new FormData();


      formData.append(
        "image",
        selectedFile
      );


      const response =
        await fetch(
          `http://localhost:5000/api/products/${editingProduct.id}/image`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              formData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to upload image."
        );

      }


      // Update product list
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


      // Update modal
      setEditingProduct(
        (current) => ({
          ...current,

          image:
            data.product
              ?.image ||
            current.image,
        })
      );


      setSelectedFile(
        null
      );

      setImagePreview(
        null
      );


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

      setUploadingImage(
        false
      );

    }

  }


  // ===================================================
  // SAVE PRODUCT DETAILS
  // ===================================================

  async function handleSaveProduct() {

    if (
      !editingProduct
    ) {
      return;
    }


    try {

      const price =
        Number(
          editingProduct.price
        );


      if (
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {

        alert(
          "Please enter a valid product price."
        );

        return;
      }


      setSavingProduct(
        true
      );


      const token =
        getToken();


      const response =
        await fetch(
          `http://localhost:5000/api/admin/products/${editingProduct.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                price,

                is_available:
                  editingProduct.is_available,

                // Keep the database field
                // unchanged because product
                // schedule capacity is now
                // controlled separately.
                daily_order_limit:
                  0,
              }),
          }
        );


      const data =
        await response.json();


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

                    ...data.product,
                  }
                : product
          )
      );


      setEditingProduct(
        null
      );


      setSelectedFile(
        null
      );


      setImagePreview(
        null
      );


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

      setSavingProduct(
        false
      );

    }

  }


  // ===================================================
  // FORMAT PRICE
  // ===================================================

  function formatPrice(
    price
  ) {

    return Number(
      price || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
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


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-page-header">

              <span className="admin-eyebrow">
                BAKEDROP ADMIN
              </span>


              <h1>
                Product <em>Management</em>
              </h1>


              <p>
                Manage product prices,
                availability, and images.
              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="admin-error">
                {error}
              </div>

            )}


            {/* =================================================
                PRODUCT LIST
            ================================================= */}

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
                  {products.length}{" "}
                  products
                </span>

              </div>


              <div className="admin-product-management-list">

                {products.map(
                  (product) => (

                    <div
                      key={
                        product.id
                      }

                      className="admin-product-management-row"
                    >


                      {/* =====================================
                          IMAGE
                      ===================================== */}

                      <div className="admin-product-image">

                        <img
                          src={
                            getProductImage(
                              product.image
                            )
                          }

                          alt={
                            product.name
                          }
                        />

                      </div>


                      {/* =====================================
                          INFORMATION
                      ===================================== */}

                      <div className="admin-product-management-info">

                        <span className="admin-eyebrow">
                          {
                            product.category_name ||
                            "Bakery"
                          }
                        </span>


                        <h3>
                          {
                            product.name
                          }
                        </h3>


                        <strong>
                          ₱
                          {
                            formatPrice(
                              product.price
                            )
                          }
                        </strong>

                      </div>


                      {/* =====================================
                          AVAILABILITY
                      ===================================== */}

                      <div className="admin-product-availability">

                        <span>
                          AVAILABILITY
                        </span>


                        <strong>
                          {
                            product.is_available
                              ? "Available"
                              : "Unavailable"
                          }
                        </strong>

                      </div>


                      {/* =====================================
                          ACTION
                      ===================================== */}

                      <button
                        type="button"
                        className="admin-button-small"
                        onClick={() =>
                            handleEditProduct(product)
                        }
                        >
                        Edit
                        </button>

                    </div>

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


            {/* =============================================
                HEADER
            ============================================= */}

            <div className="admin-modal-header">

              <div>

                <span className="admin-eyebrow">
                  PRODUCT MANAGEMENT
                </span>


                <h2>
                  {
                    editingProduct.name
                  }
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


            {/* =============================================
                PRODUCT IMAGE
            ============================================= */}

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


            {/* =============================================
                CHANGE IMAGE
            ============================================= */}

            <div className="admin-detail-section">

              <h3>
                Product Image
              </h3>


              <input
                type="file"

                accept="
                  image/jpeg,
                  image/jpg,
                  image/png,
                  image/webp
                "

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
                    {
                      selectedFile.name
                    }
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


            {/* =============================================
                PRICE
            ============================================= */}

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
                        event.target
                          .value,
                    })
                  )
                }

                disabled={
                  savingProduct
                }
              />

            </div>


            {/* =============================================
                AVAILABILITY
            ============================================= */}

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
                        event.target
                          .value ===
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


            {/* =============================================
                BUTTONS
            ============================================= */}

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


      <AdminFooter />

    </div>
  );
}


export default AdminProducts;