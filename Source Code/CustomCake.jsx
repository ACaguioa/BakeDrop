import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";

import customize from "../assets/products/customize.jpg";


// =====================================================
// IMAGE HELPER
// =====================================================

function getCakeImage(image) {
  if (!image) {
    return customize;
  }

  const filename =
    String(image)
      .split("/")
      .pop();

  // Database stores "customize.jpg"
  // but Cart needs the imported Vite asset.
  if (filename === "customize.jpg") {
    return customize;
  }

  return image;
}


// =====================================================
// CUSTOM CAKE
// =====================================================

function CustomCake() {
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart } = useCart();


  // ===================================================
  // PRODUCT FROM MENU
  // ===================================================

  const selectedProduct =
    location.state?.product;


  // ===================================================
  // SCHEDULE DATE PASSED FROM MENU
  // ===================================================

  const passedScheduleDate =
    location.state?.scheduleDate ||
    selectedProduct?.schedule_date ||
    null;


  // ===================================================
  // RESERVATION DATE
  // ===================================================

  const [reservationDate, setReservationDate] =
    useState(passedScheduleDate);


  // ===================================================
  // LOAD RESERVATION DATE
  // ===================================================

  useEffect(() => {

    if (passedScheduleDate) {
      setReservationDate(
        passedScheduleDate
      );

      return;
    }

    const savedReservation =
      sessionStorage.getItem(
        "bakedropReservation"
      );

    if (!savedReservation) {
      return;
    }

    try {

      const reservation =
        JSON.parse(
          savedReservation
        );

      if (reservation?.date) {

        setReservationDate(
          reservation.date
        );

      }

    } catch (error) {

      console.error(
        "Custom cake reservation data error:",
        error
      );

    }

  }, [passedScheduleDate]);


  // ===================================================
  // FALLBACK PRODUCT
  // ===================================================

  const cakeProduct =
    selectedProduct || {
      id: 5,
      name: "Customizable Cake",
      category: "Cakes",
      image: customize,
      customizable: true,
      is_available: true,

      // New date-specific fields
      product_date_disabled: false,
      product_limit_reached: false,
      schedule_disabled: false,
      overall_capacity_reached: false,

      maximum_quantity: 0,
      reserved_quantity: 0,
      remaining_quantity: null,
    };


  // ===================================================
  // CAKE OPTIONS
  // ===================================================

  const sizes = [
    {
      name: "6 Inch",
      value: "6",
      price: 650,
    },
    {
      name: "8 Inch",
      value: "8",
      price: 850,
    },
    {
      name: "10 Inch",
      value: "10",
      price: 1050,
    },
  ];


  const flavors = [
    "Chocolate",
    "Vanilla",
    "Red Velvet",
    "Ube",
    "Mocha",
  ];


  const frostings = [
    "Vanilla",
    "Chocolate",
    "Strawberry",
    "Ube",
    "Cream Cheese",
  ];


  const toppings = [
    "Rainbow Sprinkles",
    "Chocolate Chips",
    "Oreo Crumbs",
    "Almonds",
    "Marshmallows",
  ];


  const decorations = [
    "Chocolate Drip",
    "Chocolate Shavings",
    "Chocolate Pieces",
    "Chocolate Curls",
  ];


  // ===================================================
  // STATE
  // ===================================================

  const [size, setSize] =
    useState(sizes[0]);


  const [flavor, setFlavor] =
    useState("Chocolate");


  const [frosting, setFrosting] =
    useState("Vanilla");


  const [
    selectedToppings,
    setSelectedToppings,
  ] = useState([]);


  const [decoration, setDecoration] =
    useState("Chocolate Drip");


  const [message, setMessage] =
    useState("");


  // ===================================================
  // FLAVOR COLORS
  // ===================================================

  const flavorColors = {
    Chocolate: "#5a3825",
    Vanilla: "#f4e7c5",
    "Red Velvet": "#9e3030",
    Ube: "#8060a8",
    Mocha: "#795548",
  };


  const flavorColor =
    flavorColors[flavor];


  // ===================================================
  // FROSTING COLORS
  // ===================================================

  const frostingColors = {
    Vanilla: "#fff5dc",
    Chocolate: "#4a2b1b",
    Strawberry: "#f2a1b5",
    Ube: "#9672b8",
    "Cream Cheese": "#fffdf2",
  };


  const frostingColor =
    frostingColors[frosting];


  // ===================================================
  // TOPPING LOGIC
  // MAXIMUM OF 2
  // ===================================================

  function toggleTopping(topping) {

    setSelectedToppings(
      (current) => {

        if (
          current.includes(
            topping
          )
        ) {

          return current.filter(
            (item) =>
              item !== topping
          );

        }


        if (
          current.length >= 2
        ) {

          alert(
            "You can only choose up to 2 toppings."
          );

          return current;
        }


        return [
          ...current,
          topping,
        ];

      }
    );

  }


  // ===================================================
  // PRICE CALCULATION
  // ===================================================

  function calculatePrice() {

    let price =
      size.price;


    // -------------------------------
    // FLAVOR
    // -------------------------------

    if (
      flavor === "Red Velvet"
    ) {
      price += 100;
    }


    if (
      flavor === "Ube"
    ) {
      price += 80;
    }


    if (
      flavor === "Mocha"
    ) {
      price += 50;
    }


    // -------------------------------
    // FROSTING
    // -------------------------------

    if (
      frosting === "Cream Cheese"
    ) {
      price += 100;
    }


    if (
      frosting === "Ube"
    ) {
      price += 50;
    }


    // -------------------------------
    // TOPPINGS
    // -------------------------------

    selectedToppings.forEach(
      (topping) => {

        if (
          topping ===
          "Chocolate Chips"
        ) {
          price += 30;
        }


        if (
          topping ===
          "Oreo Crumbs"
        ) {
          price += 40;
        }


        if (
          topping ===
          "Almonds"
        ) {
          price += 50;
        }


        if (
          topping ===
          "Marshmallows"
        ) {
          price += 40;
        }


        if (
          topping ===
          "Rainbow Sprinkles"
        ) {
          price += 20;
        }

      }
    );


    // -------------------------------
    // DECORATION
    // -------------------------------

    if (
      decoration ===
      "Chocolate Shavings"
    ) {
      price += 50;
    }


    if (
      decoration ===
      "Chocolate Pieces"
    ) {
      price += 80;
    }


    if (
      decoration ===
      "Chocolate Curls"
    ) {
      price += 60;
    }


    return price;
  }


  const totalPrice =
    calculatePrice();


  // ===================================================
  // CHECK CAKE AVAILABILITY
  // ===================================================

  function checkCakeAvailability() {

    // -------------------------------------------------
    // GLOBAL PRODUCT AVAILABILITY
    // -------------------------------------------------

    if (
      !cakeProduct.is_available &&
      cakeProduct.is_available !== 1 &&
      cakeProduct.is_available !== "1"
    ) {

      return {
        available: false,

        message:
          "This cake is currently unavailable.",
      };

    }


    // -------------------------------------------------
    // DATE-SPECIFIC DISABLED
    // -------------------------------------------------

    if (
      cakeProduct.product_date_disabled
    ) {

      return {
        available: false,

        message:
          reservationDate
            ? `Customizable Cake is unavailable for ${reservationDate}.`
            : "Customizable Cake is unavailable for the selected date.",
      };

    }


    // -------------------------------------------------
    // WHOLE SCHEDULE DISABLED
    // -------------------------------------------------

    if (
      cakeProduct.schedule_disabled
    ) {

      return {
        available: false,

        message:
          reservationDate
            ? `Ordering is disabled for ${reservationDate}.`
            : "Ordering is disabled for the selected date.",
      };

    }


    // -------------------------------------------------
    // OVERALL DATE CAPACITY
    // -------------------------------------------------

    if (
      cakeProduct.overall_capacity_reached
    ) {

      return {
        available: false,

        message:
          reservationDate
            ? `All order slots for ${reservationDate} are already reserved.`
            : "All order slots for the selected date are already reserved.",
      };

    }


    // -------------------------------------------------
    // PRODUCT-SPECIFIC CAPACITY
    // -------------------------------------------------

    if (
      cakeProduct.product_limit_reached
    ) {

      return {
        available: false,

        message:
          reservationDate
            ? `Customizable Cake is fully booked for ${reservationDate}.`
            : "Customizable Cake is fully booked for the selected date.",
      };

    }


    // -------------------------------------------------
    // EXPLICIT REMAINING QUANTITY
    // -------------------------------------------------

    if (
      cakeProduct.remaining_quantity !==
        null &&
      cakeProduct.remaining_quantity !==
        undefined
    ) {

      const remainingQuantity =
        Number(
          cakeProduct.remaining_quantity
        );


      if (
        remainingQuantity <= 0
      ) {

        return {
          available: false,

          message:
            reservationDate
              ? `Customizable Cake is fully booked for ${reservationDate}.`
              : "Customizable Cake is fully booked for the selected date.",
        };

      }

    }


    return {
      available: true,
      message: "",
    };

  }


  // ===================================================
  // ADD CUSTOMIZED CAKE TO CART
  // ===================================================

  function handleAddToCart() {

    const availability =
      checkCakeAvailability();


    if (
      !availability.available
    ) {

      alert(
        availability.message
      );

      navigate("/menu");

      return;
    }


    // =================================================
    // CREATE CART ITEM
    // =================================================

    const customCake = {

      // Unique cart ID.
      // This keeps differently customized
      // cakes as separate cart items.
      id:
        `custom-cake-${Date.now()}`,


      // Actual database product ID.
      // Important for order_items later.
      product_id:
        cakeProduct.id,


      name:
        cakeProduct.name ||
        "Customizable Cake",


      category:
        cakeProduct.category_name ||
        cakeProduct.category ||
        "Cakes",


      description:
        cakeProduct.description ||
        "Customized cake",


      price:
        Number(
          totalPrice
        ),


      // FIXED IMAGE
      image:
        getCakeImage(
          cakeProduct.image
        ),


      quantity: 1,


      customizable: true,


      // Save the complete customization.
      customization: {

        size:
          size.name,

        flavor:
          flavor,

        frosting:
          frosting,

        toppings:
          selectedToppings,

        decoration:
          decoration,

        message:
          message,

        // Save schedule date
        // as extra information inside
        // customization.
        schedule_date:
          reservationDate || null,

      },

    };


    // Add to global cart.
    addToCart(
      customCake
    );


    // Go to Cart.
    navigate("/cart");

  }


  // ===================================================
  // CAKE STATUS
  // ===================================================

  const cakeAvailability =
    checkCakeAvailability();


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <section className="custom-cake-page">

      <div className="custom-cake-container">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="custom-cake-header">

          <span className="eyebrow">
            BAKE YOUR OWN
          </span>


          <h1>
            Customize your
            <br />
            <em>cake.</em>
          </h1>


          <p>
            Create a cake made especially
            for your celebration.
          </p>


          {/* =========================================
              SCHEDULE INFORMATION
          ========================================= */}

          {reservationDate && (

            <div className="custom-cake-schedule">

              <span>
                SCHEDULED FOR
              </span>

              <strong>
                {reservationDate}
              </strong>

            </div>

          )}


          {/* =========================================
              AVAILABILITY WARNING
          ========================================= */}

          {!cakeAvailability.available && (

            <div className="custom-cake-unavailable">

              <strong>
                {cakeAvailability.message}
              </strong>

            </div>

          )}

        </div>


        {/* =============================================
            CUSTOMIZER
        ============================================= */}

        <div
          className="customizer-layout"
        >


          {/* ===========================================
              CAKE PREVIEW
          =========================================== */}

          <div className="cake-preview-section">

            <div className="cake-preview">


              {/* SHADOW */}

              <div className="cake-shadow"></div>


              {/* CAKE BODY */}

              <div
                className={`cake-body cake-size-${size.value} flavor-${flavor
                  .toLowerCase()
                  .replace(
                    " ",
                    "-"
                  )}`}
              >


                {/* FLAVOR */}

                <div
                  className="cake-layer cake-flavor"

                  style={{
                    backgroundColor:
                      flavorColor,
                  }}
                ></div>


                {/* FROSTING */}

                <div
                  className="cake-frosting"

                  style={{
                    backgroundColor:
                      frostingColor,
                  }}
                ></div>


                <div className="cake-bottom"></div>

              </div>


              {/* ======================================
                  TOPPINGS
              ====================================== */}

              <div className="cake-toppings">

                {selectedToppings.includes(
                  "Rainbow Sprinkles"
                ) && (

                  <span className="topping-sprinkles">
                    • • • • • • •
                  </span>

                )}


                {selectedToppings.includes(
                  "Chocolate Chips"
                ) && (

                  <span className="topping-chips">
                    ● ● ● ●
                  </span>

                )}


                {selectedToppings.includes(
                  "Oreo Crumbs"
                ) && (

                  <span className="topping-oreo">
                    ● ● ● ●
                  </span>

                )}


                {selectedToppings.includes(
                  "Almonds"
                ) && (

                  <span className="topping-almonds">
                    ◆ ◆ ◆
                  </span>

                )}


                {selectedToppings.includes(
                  "Marshmallows"
                ) && (

                  <span className="topping-marshmallow">
                    ■ ■ ■
                  </span>

                )}

              </div>


              {/* ======================================
                  DECORATION
              ====================================== */}

              {decoration ===
                "Chocolate Drip" && (

                <div className="cake-drip"></div>

              )}


              {decoration ===
                "Chocolate Shavings" && (

                <div className="cake-shavings">
                  ~ ~ ~ ~
                </div>

              )}


              {decoration ===
                "Chocolate Pieces" && (

                <div className="cake-pieces">
                  ◆ ◆ ◆
                </div>

              )}


              {decoration ===
                "Chocolate Curls" && (

                <div className="cake-curls">
                  ∿ ∿ ∿
                </div>

              )}


              {/* ======================================
                  MESSAGE
              ====================================== */}

              {message && (

                <div className="cake-message">
                  {message}
                </div>

              )}

            </div>


            {/* ========================================
                PREVIEW DETAILS
            ======================================== */}

            <div className="preview-details">

              <span>
                {size.name}
              </span>


              <span>
                {flavor}
              </span>


              <span>
                {frosting}
              </span>


              {selectedToppings.length >
                0 && (

                <span>
                  {
                    selectedToppings.length
                  }{" "}
                  topping
                  {selectedToppings.length >
                    1
                    ? "s"
                    : ""}
                </span>

              )}

            </div>

          </div>


          {/* ===========================================
              CUSTOMIZATION PANEL
          =========================================== */}

          <div className="customization-panel">


            {/* ========================================
                STEP 1
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  01
                </span>


                <div>

                  <h2>
                    Cake Size
                  </h2>


                  <p>
                    Choose your cake size.
                  </p>

                </div>

              </div>


              <div className="custom-options">

                {sizes.map(
                  (item) => (

                    <button
                      type="button"

                      key={
                        item.value
                      }

                      className={
                        size.value ===
                        item.value
                          ? "custom-option active"
                          : "custom-option"
                      }

                      onClick={() =>
                        setSize(item)
                      }

                      disabled={
                        !cakeAvailability.available
                      }
                    >

                      <span>

                        {size.value ===
                        item.value
                          ? "✓"
                          : ""}

                      </span>


                      {
                        item.name
                      }

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ========================================
                STEP 2
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  02
                </span>


                <div>

                  <h2>
                    Flavor
                  </h2>


                  <p>
                    Choose your cake flavor.
                  </p>

                </div>

              </div>


              <div className="custom-options">

                {flavors.map(
                  (item) => (

                    <button
                      type="button"

                      key={item}

                      className={
                        flavor ===
                        item
                          ? "custom-option active"
                          : "custom-option"
                      }

                      onClick={() =>
                        setFlavor(
                          item
                        )
                      }

                      disabled={
                        !cakeAvailability.available
                      }
                    >

                      <span>

                        {flavor ===
                        item
                          ? "✓"
                          : ""}

                      </span>


                      {item}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ========================================
                STEP 3
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  03
                </span>


                <div>

                  <h2>
                    Frosting
                  </h2>


                  <p>
                    Choose your frosting.
                  </p>

                </div>

              </div>


              <div className="custom-options">

                {frostings.map(
                  (item) => (

                    <button
                      type="button"

                      key={item}

                      className={
                        frosting ===
                        item
                          ? "custom-option active"
                          : "custom-option"
                      }

                      onClick={() =>
                        setFrosting(
                          item
                        )
                      }

                      disabled={
                        !cakeAvailability.available
                      }
                    >

                      <span>

                        {frosting ===
                        item
                          ? "✓"
                          : ""}

                      </span>


                      {item}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ========================================
                STEP 4
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  04
                </span>


                <div>

                  <h2>
                    Toppings
                  </h2>


                  <p>
                    Choose up to 2 toppings.
                  </p>

                </div>

              </div>


              <div className="custom-options">

                {toppings.map(
                  (item) => (

                    <button
                      type="button"

                      key={item}

                      className={
                        selectedToppings.includes(
                          item
                        )
                          ? "custom-option active"
                          : "custom-option"
                      }

                      onClick={() =>
                        toggleTopping(
                          item
                        )
                      }

                      disabled={
                        !cakeAvailability.available
                      }
                    >

                      <span>

                        {selectedToppings.includes(
                          item
                        )
                          ? "✓"
                          : ""}

                      </span>


                      {item}

                    </button>

                  )
                )}

              </div>


              <p className="topping-counter">

                {
                  selectedToppings.length
                }{" "}
                / 2 toppings selected

              </p>

            </div>


            {/* ========================================
                STEP 5
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  05
                </span>


                <div>

                  <h2>
                    Chocolate Decoration
                  </h2>


                  <p>
                    Choose your chocolate
                    decoration.
                  </p>

                </div>

              </div>


              <div className="custom-options">

                {decorations.map(
                  (item) => (

                    <button
                      type="button"

                      key={item}

                      className={
                        decoration ===
                        item
                          ? "custom-option active"
                          : "custom-option"
                      }

                      onClick={() =>
                        setDecoration(
                          item
                        )
                      }

                      disabled={
                        !cakeAvailability.available
                      }
                    >

                      <span>

                        {decoration ===
                        item
                          ? "✓"
                          : ""}

                      </span>


                      {item}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ========================================
                STEP 6
            ======================================== */}

            <div className="custom-step">

              <div className="custom-step-title">

                <span>
                  06
                </span>


                <div>

                  <h2>
                    Personal Message
                  </h2>


                  <p>
                    Add a message to your cake.
                  </p>

                </div>

              </div>


              <textarea
                className="cake-message-input"

                rows="4"

                maxLength="60"

                placeholder="Happy Birthday, Maria!"

                value={
                  message
                }

                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }

                disabled={
                  !cakeAvailability.available
                }
              />


              <small className="message-counter">

                {
                  message.length
                }{" "}
                / 60

              </small>

            </div>


            {/* ========================================
                TOTAL
            ======================================== */}

            <div className="custom-total">

              <span>
                TOTAL
              </span>


              <strong>

                ₱
                {totalPrice.toLocaleString(
                  "en-PH"
                )}

              </strong>

            </div>


            {/* ========================================
                ADD TO CART
            ======================================== */}

            <button
              type="button"

              className="btn btn-gold custom-add-button"

              onClick={
                handleAddToCart
              }

              disabled={
                !cakeAvailability.available
              }
            >

              {!cakeAvailability.available
                ? "Cake Unavailable"
                : "Add Custom Cake to Bag"}

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}


export default CustomCake;