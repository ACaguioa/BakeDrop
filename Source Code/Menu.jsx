import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";


// =====================================================
// LOCAL PRODUCT IMAGES
// =====================================================

import assorted from "../assets/products/assorted.jpg";
import banana from "../assets/products/banana.jpg";
import cheesebread from "../assets/products/cheesebread.jpg";
import cheesedesal from "../assets/products/cheesedesal.jpg";
import chocoroll from "../assets/products/chocoroll.jpg";
import customize from "../assets/products/customize.jpg";
import donuts from "../assets/products/donuts.jpg";
import eggpie from "../assets/products/eggpie.jpg";
import ensaymada from "../assets/products/ensaymada.jpg";
import garlic from "../assets/products/garlic.jpg";
import kababayan from "../assets/products/kababayan.jpg";
import loaf from "../assets/products/loaf.jpg";
import mangoroll from "../assets/products/mangoroll.jpg";
import mocharoll from "../assets/products/mocharoll.jpg";
import pandecoco from "../assets/products/pandecoco.jpg";
import pandesal from "../assets/products/pandesal.jpg";
import pianono from "../assets/products/pianono.jpg";
import raisin from "../assets/products/raisin.jpg";
import spanish from "../assets/products/spanish.jpg";
import ubedesal from "../assets/products/ubedesal.jpg";
import ubeensaymada from "../assets/products/ubeensaymada.jpg";


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

  const filename = image.split("/").pop();

  return (
    productImages[filename] ||
    customize
  );
}


// =====================================================
// PRODUCT CARD
// =====================================================

function ProductCard({
  product,
  onAdd,
  scheduleDate,
}) {

  // MySQL tinyint(1) may return:
  // true, 1, or "1"
  const isCustomizable =
    product.customizable === true ||
    product.customizable === 1 ||
    product.customizable === "1";


  const unavailable =
    !product.is_available;


  const productLimitReached =
    Boolean(
      product.product_limit_reached
    );


  const productDateDisabled =
    Boolean(
      product.product_date_disabled
    );


  const scheduleDisabled =
    Boolean(
      product.schedule_disabled
    );


  const overallCapacityReached =
    Boolean(
      product.overall_capacity_reached
    );


  const cannotOrder =
    unavailable ||
    productLimitReached ||
    productDateDisabled ||
    scheduleDisabled ||
    overallCapacityReached;


  // ===================================================
  // BUTTON TEXT
  // ===================================================

  let buttonText =
    isCustomizable
      ? "Customize"
      : "Add to Cart";


  if (unavailable) {

    buttonText =
      "Unavailable";

  } else if (scheduleDisabled) {

    buttonText =
      "Date Unavailable";

  } else if (productDateDisabled) {

    buttonText =
      "Unavailable for Date";

  } else if (productLimitReached) {

    buttonText =
      "Fully Booked";

  } else if (overallCapacityReached) {

    buttonText =
      "Date Fully Booked";

  }


  return (
    <div
      className={`product-card ${
        cannotOrder
          ? "product-card-unavailable"
          : ""
      }`}
    >


      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="product-image">

        <img
          src={getProductImage(
            product.image
          )}
          alt={product.name}
        />


        {/* GLOBAL UNAVAILABLE */}

        {unavailable && (
          <div className="product-status-overlay">
            Unavailable
          </div>
        )}


        {/* PRODUCT DISABLED FOR SELECTED DATE */}

        {!unavailable &&
          productDateDisabled && (
            <div className="product-status-overlay">
              Unavailable for Date
            </div>
          )}


        {/* PRODUCT CAPACITY FULL */}

        {!unavailable &&
          !productDateDisabled &&
          productLimitReached && (
            <div className="product-status-overlay">
              Fully Booked
            </div>
          )}


        {/* OVERALL DATE FULL */}

        {!unavailable &&
          !productDateDisabled &&
          !productLimitReached &&
          overallCapacityReached && (
            <div className="product-status-overlay">
              Date Fully Booked
            </div>
          )}

      </div>


      {/* =================================================
          INFO
      ================================================= */}

      <div className="product-info">

        <span className="product-category">
          {product.category_name ||
            "Bakery"}
        </span>


        <h3>
          {product.name}
        </h3>


        {product.description && (
          <p>
            {product.description}
          </p>
        )}


        {product.unit_description && (
          <small className="product-unit">
            {product.unit_description}
          </small>
        )}


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="product-bottom">


          <strong className="product-price">

            ₱
            {Number(
              product.price
            ).toLocaleString(
              "en-PH",
              {
                minimumFractionDigits: 2,
              }
            )}

          </strong>


          {/* =================================================
              REMAINING FOR SELECTED SCHEDULE DATE
          ================================================= */}

          {scheduleDate &&
            product.remaining_quantity !==
              null &&
            product.is_available &&
            !productLimitReached &&
            !productDateDisabled &&
            !scheduleDisabled &&
            !overallCapacityReached && (

              <span className="product-remaining">

                {product.remaining_quantity}{" "}
                left for {scheduleDate}

              </span>

            )}


          {/* =================================================
              UNLIMITED
          ================================================= */}

          {scheduleDate &&
            product.remaining_quantity ===
              null &&
            product.is_available &&
            !productDateDisabled &&
            !scheduleDisabled &&
            !overallCapacityReached && (

              <span className="product-remaining">

                Unlimited for {scheduleDate}

              </span>

            )}


          {/* =================================================
              ACTION
          ================================================= */}

          <button
            type="button"

            className="add-text"

            disabled={
              cannotOrder
            }

            onClick={() =>
              onAdd(product)
            }
          >

            {buttonText}

          </button>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// MENU
// =====================================================

function Menu() {

  // ===================================================
  // NAVIGATION
  // ===================================================

  const navigate =
    useNavigate();


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
  // SCHEDULE DATE
  // ===================================================

  const [scheduleDate, setScheduleDate] =
    useState(null);


  const [scheduleInfo, setScheduleInfo] =
    useState({
      maximumOrders: 30,
      reservedOrders: 0,
      remainingSlots: 30,
      disabled: false,
    });


  // ===================================================
  // CATEGORY
  // ===================================================

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");


  // ===================================================
  // SEARCH
  // ===================================================

  const [
    searchParams,
  ] = useSearchParams();


  const searchQuery =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() || "";


  // ===================================================
  // CART
  // ===================================================

  const {
    cart,
    addToCart,
  } = useCart();


  // ===================================================
  // LOAD SAVED RESERVATION
  // ===================================================

  useEffect(() => {

    const savedReservation =
      sessionStorage.getItem(
        "bakedropReservation"
      );


    if (!savedReservation) {

      setScheduleDate(
        null
      );

      return;
    }


    try {

      const reservation =
        JSON.parse(
          savedReservation
        );


      if (
        reservation?.date
      ) {

        setScheduleDate(
          reservation.date
        );

      } else {

        setScheduleDate(
          null
        );

      }

    } catch (error) {

      console.error(
        "Reservation data error:",
        error
      );

      setScheduleDate(
        null
      );

    }

  }, []);


  // ===================================================
  // FETCH PRODUCTS
  // ===================================================

  useEffect(() => {

    let cancelled = false;


    async function loadProducts() {

      try {

        setLoading(true);

        setError("");


        const url =
          scheduleDate

            ? `http://127.0.0.1:5000/api/products?date=${encodeURIComponent(
                scheduleDate
              )}`

            : "http://127.0.0.1:5000/api/products";


        const response =
          await fetch(url);


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Failed to load menu."
          );

        }


        if (!cancelled) {

          setProducts(
            Array.isArray(
              data.products
            )
              ? data.products
              : Array.isArray(data)
                ? data
                : []
          );


          if (
            data.schedule
          ) {

            setScheduleInfo({

              maximumOrders:
                Number(
                  data.schedule
                    .maximum_orders ||
                    30
                ),

              reservedOrders:
                Number(
                  data.schedule
                    .reserved_orders ||
                    0
                ),

              remainingSlots:
                Number(
                  data.schedule
                    .remaining_order_slots ||
                    0
                ),

              disabled:
                Boolean(
                  data.schedule
                    .disabled
                ),

            });

          }

        }

      } catch (error) {

        console.error(
          "MENU ERROR:",
          error
        );


        if (!cancelled) {

          setError(
            error.message ||
              "Failed to load menu."
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }


    loadProducts();


    return () => {
      cancelled = true;
    };

  }, [scheduleDate]);


  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories =
    useMemo(() => {

      const names =
        products
          .map(
            (product) =>
              product.category_name
          )
          .filter(Boolean);


      return [
        "All",

        ...Array.from(
          new Set(names)
        ),
      ];

    }, [products]);


  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filteredProducts =
    useMemo(() => {

      return products.filter(
        (product) => {

          const matchesCategory =
            selectedCategory ===
              "All" ||
            product.category_name ===
              selectedCategory;


          const matchesSearch =
            !searchQuery ||
            product.name
              .toLowerCase()
              .includes(
                searchQuery
              ) ||

            (
              product.description ||
              ""
            )
              .toLowerCase()
              .includes(
                searchQuery
              );


          return (
            matchesCategory &&
            matchesSearch
          );

        }
      );

    }, [
      products,
      selectedCategory,
      searchQuery,
    ]);


  // ===================================================
  // ADD TO CART / CUSTOMIZE
  // ===================================================

  function handleAddToCart(
    product
  ) {


    // =================================================
    // GLOBAL PRODUCT AVAILABILITY
    // =================================================

    if (
      !product.is_available
    ) {
      return;
    }


    // =================================================
    // SCHEDULE DISABLED
    // =================================================

    if (
      product.schedule_disabled
    ) {

      alert(
        `Ordering is disabled for ${
          scheduleDate ||
          "this date"
        }.`
      );

      return;
    }


    // =================================================
    // PRODUCT DATE DISABLED
    // =================================================

    if (
      product.product_date_disabled
    ) {

      alert(
        `${product.name} is unavailable for ${
          scheduleDate ||
          "the selected date"
        }.`
      );

      return;
    }


    // =================================================
    // PRODUCT FULL
    // =================================================

    if (
      product.product_limit_reached
    ) {

      alert(
        `${product.name} is fully booked for ${
          scheduleDate ||
          "the selected date"
        }.`
      );

      return;
    }


    // =================================================
    // OVERALL DATE FULL
    // =================================================

    if (
      product.overall_capacity_reached
    ) {

      alert(
        `All order slots for ${
          scheduleDate ||
          "the selected date"
        } are already reserved.`
      );

      return;
    }


    // =================================================
    // CHECK CUSTOMIZATION
    // =================================================

    const isCustomizable =
      product.customizable === true ||
      product.customizable === 1 ||
      product.customizable === "1";


    // =================================================
    // CUSTOMIZABLE PRODUCT
    // =================================================

    if (isCustomizable) {

      console.log(
        "Opening customizer for:",
        product
      );


      navigate(
        "/custom-cake",
        {
          state: {
            product:
              product,

            scheduleDate:
              scheduleDate,
          },
        }
      );


      return;
    }


    // =================================================
    // NORMAL PRODUCT
    // =================================================

    const cartItem =
      cart.find(
        (item) =>
          Number(item.id) ===
          Number(product.id)
      );


    const currentCartQuantity =
      cartItem
        ? Number(
            cartItem.quantity
          )
        : 0;


    // =================================================
    // CHECK DATE-SPECIFIC QUANTITY
    // =================================================

    if (
      product.remaining_quantity !==
        null
    ) {

      const remaining =
        Number(
          product.remaining_quantity
        );


      const availableToAdd =
        Math.max(
          remaining -
            currentCartQuantity,
          0
        );


      if (
        availableToAdd <= 0
      ) {

        alert(
          `${product.name} only has ${remaining} remaining for ${
            scheduleDate ||
            "the selected date"
          }.`
        );

        return;
      }

    }


    // =================================================
    // ADD NORMAL PRODUCT
    // =================================================

    addToCart({

      id:
        product.id,

      name:
        product.name,

      category:
        product.category_name,

      description:
        product.description,

      price:
        Number(
          product.price
        ),

      image:
        getProductImage(
          product.image
        ),

      customizable:
        product.customizable === true ||
        product.customizable === 1 ||
        product.customizable === "1",

    });

  }


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <section className="page">

        <div className="page-header">

          <span className="eyebrow">
            BAKED FRESH FOR YOU
          </span>


          <h1>
            Our <em>menu.</em>
          </h1>


          <p>

            {scheduleDate
              ? `Checking availability for ${scheduleDate}...`
              : "Loading our freshly baked selection..."}

          </p>

        </div>

      </section>
    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

    return (
      <section className="page">

        <div className="page-header">

          <span className="eyebrow">
            BAKEDROP MENU
          </span>


          <h1>
            Menu <em>unavailable.</em>
          </h1>


          <p>
            {error}
          </p>

        </div>

      </section>
    );

  }


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <section className="page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <span className="eyebrow">
          BAKED FRESH FOR YOU
        </span>


        <h1>
          Our <em>menu.</em>
        </h1>


        <p>
          Freshly baked favorites,
          prepared for your next order.
        </p>


        {/* =================================================
            SCHEDULE INFORMATION
        ================================================= */}

        {scheduleDate && (

          <div className="menu-schedule-info">

            <strong>
              Scheduled for:
            </strong>{" "}

            <span>
              {scheduleDate}
            </span>


            {!scheduleInfo.disabled && (
              <span>
                {" • "}
                {scheduleInfo.remainingSlots}{" "}
                order slot
                {scheduleInfo.remainingSlots ===
                1
                  ? ""
                  : "s"}{" "}
                remaining
              </span>
            )}


            {scheduleInfo.disabled && (
              <span>
                {" • "}
                Ordering disabled
              </span>
            )}

          </div>

        )}

      </div>


      {/* =================================================
          CATEGORY FILTER
      ================================================= */}

      <div className="section">

        <div className="category-filter">

          {categories.map(
            (category) => (

              <button
                key={category}

                type="button"

                className={
                  selectedCategory ===
                  category
                    ? "filter-active"
                    : ""
                }

                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              >

                {category}

              </button>

            )
          )}

        </div>


        {/* =================================================
            PRODUCTS
        ================================================= */}

        {filteredProducts.length ===
        0 ? (

          <div className="no-products">

            <span className="eyebrow">
              NO PRODUCTS
            </span>


            <h3>
              Nothing found.
            </h3>


            <p>
              Try another category or
              search term.
            </p>

          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={
                    product.id
                  }

                  product={
                    product
                  }

                  scheduleDate={
                    scheduleDate
                  }

                  onAdd={
                    handleAddToCart
                  }
                />

              )
            )}

          </div>

        )}

      </div>

    </section>
  );
}


export default Menu;