import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import products from "../data/products";

function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = [
    "All",
    "Breads",
    "Filipino Breads",
    "Cakes",
    "Pastries",
    "Assorted",
  ];

  // =========================
  // URL PARAMETERS
  // =========================

  const selectedCategory =
    searchParams.get("category") || "All";

  const searchQuery =
    searchParams.get("search")?.toLowerCase().trim() || "";


  // =========================
  // CATEGORY FILTER
  // =========================

  function handleCategoryChange(category) {
    const newParams = new URLSearchParams(searchParams);

    if (category === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }

    setSearchParams(newParams);
  }


  // =========================
  // FILTER PRODUCTS
  // =========================

  const filteredProducts = products.filter((product) => {

    // CATEGORY FILTER
    const productCategory =
      product.category?.trim().toLowerCase();

    const selected =
      selectedCategory.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === "All" ||
      productCategory === selected;


    // SEARCH FILTER
    const matchesSearch =
      !searchQuery ||
      product.name
        ?.toLowerCase()
        .includes(searchQuery) ||
      product.category
        ?.toLowerCase()
        .includes(searchQuery) ||
      product.description
        ?.toLowerCase()
        .includes(searchQuery);


    return matchesCategory && matchesSearch;
  });


  // =========================
  // CLEAR SEARCH
  // =========================

  function clearSearch() {
    const newParams = new URLSearchParams(searchParams);

    newParams.delete("search");

    setSearchParams(newParams);
  }


  return (
    <div className="page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="page-header">

        <SectionTitle
          eyebrow="OUR COLLECTION"
          title="The Menu"
          description="Freshly baked creations prepared with care."
          center
        />

      </section>


      {/* =========================
          MENU
      ========================= */}

      <section className="menu-page section">

        {/* SEARCH RESULT */}

        {searchQuery && (
          <div className="search-result-info">

            <div>
              <span className="eyebrow">
                SEARCH RESULTS
              </span>

              <h3>
                Results for "{searchQuery}"
              </h3>
            </div>

            <button
              className="clear-search"
              onClick={clearSearch}
            >
              Clear Search
            </button>

          </div>
        )}


        {/* =========================
            FILTERS
        ========================= */}

        <div className="category-filter">

          {categories.map((item) => (

            <button
              key={item}

              className={
                selectedCategory.toLowerCase() ===
                item.toLowerCase()
                  ? "filter-active"
                  : ""
              }

              onClick={() =>
                handleCategoryChange(item)
              }
            >
              {item}
            </button>

          ))}

        </div>


        {/* =========================
            PRODUCTS
        ========================= */}

        <div className="product-grid">

          {filteredProducts.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}

        </div>


        {/* =========================
            EMPTY STATE
        ========================= */}

        {filteredProducts.length === 0 && (

          <div className="no-products">

            <span className="eyebrow">

              {searchQuery
                ? "SEARCH"
                : selectedCategory}

            </span>

            <h3>
              No products found.
            </h3>

            <p>

              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}".`
                : "We couldn't find any products in this category."}

            </p>


            <div className="empty-actions">

              {searchQuery && (
                <button
                  className="btn btn-outline"
                  onClick={clearSearch}
                >
                  Clear Search
                </button>
              )}

              <button
                className="btn btn-gold"
                onClick={() =>
                  handleCategoryChange("All")
                }
              >
                View All Products
              </button>

            </div>

          </div>

        )}

      </section>

    </div>
  );
}

export default Menu;