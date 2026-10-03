import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const API_BASE =
  "http://127.0.0.1:5000";

// =====================================================
// LOAD ALL BAKEdrop PRODUCT IMAGES
// =====================================================

const productImages =
  import.meta.glob(
    "../assets/products/*",
    {
      eager: true,
      query: "?url",
      import: "default",
    }
  );


// =====================================================
// FIND PRODUCT IMAGE
// =====================================================

function getProductImage(
  imagePath
) {
  if (!imagePath) {
    return null;
  }

  const fileName =
    imagePath
      .split("/")
      .pop();

  if (!fileName) {
    return null;
  }

  const imageKey =
    `../assets/products/${fileName}`;

  return (
    productImages[
      imageKey
    ] || null
  );
}


// =====================================================
// FLASH DEALS
// =====================================================

function FlashDeals() {

  const {
    addToCart,
  } = useCart();

  const [
    deals,
    setDeals,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ===================================================
  // LOAD TODAY'S FLASH DEALS
  // ===================================================

  useEffect(() => {

    async function loadFlashDeals() {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/flash-deals/today`
          );


        const data =
          await response.json();


        if (response.ok) {

          setDeals(
            data.deals || []
          );

        }

      } catch (error) {

        console.error(
          "FLASH DEALS ERROR:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadFlashDeals();

  }, []);


  // ===================================================
  // ADD FLASH DEAL TO CART
  // ===================================================

  const handleAddToCart = (
    deal
  ) => {

    addToCart({

      id:
        deal.product_id,

      product_id:
        deal.product_id,

      flash_deal_id:
        deal.id,

      name:
        deal.product_name,

      price:
        Number(
          deal.flash_price
        ),

      original_price:
        Number(
          deal.original_price
        ),

      image:
        getProductImage(
          deal.image
        ),

      description:
        deal.description ||
        "",

      unit_description:
        deal.unit_description ||
        "",

      category:
        "Flash Deals",

      customizable:
        false,

      quantity:
        1,

    });

  };


  // ===================================================
  // EMPTY
  // ===================================================

  if (
    loading ||
    deals.length === 0
  ) {

    return null;

  }


  return (

    <section
      className="flash-deals-section"
    >

      <div
        className="flash-deals-header"
      >

        <span className="eyebrow">
          TODAY ONLY
        </span>


        <h2>
          Flash <em>Deals.</em>
        </h2>


        <p>
          Selected items are available
          at 50% off while supplies last.
        </p>

      </div>


      <div
        className="flash-deals-grid"
      >

        {deals.map(
          (deal) => {

            const image =
              getProductImage(
                deal.image
              );


            return (

              <article
                className="flash-deal-card"
                key={deal.id}
              >

                {image && (

                  <img
                    src={image}
                    alt={
                      deal.product_name
                    }
                    className="flash-deal-image"
                  />

                )}


                <div
                  className="flash-deal-content"
                >

                  <span
                    className="flash-deal-badge"
                  >
                    50% OFF
                  </span>


                  <h3>
                    {deal.product_name}
                  </h3>


                  <div
                    className="flash-deal-price"
                  >

                    <span
                      className="flash-deal-original"
                    >
                      ₱
                      {Number(
                        deal.original_price
                      ).toFixed(2)}
                    </span>


                    <strong>
                      ₱
                      {Number(
                        deal.flash_price
                      ).toFixed(2)}
                    </strong>

                  </div>


                  <p>
                    {deal.quantity} available
                  </p>


                  <button
                    type="button"
                    className="flash-deal-add-button"
                    onClick={() =>
                      handleAddToCart(
                        deal
                      )
                    }
                  >
                    ADD TO CART
                  </button>

                </div>

              </article>

            );

          }
        )}

      </div>

    </section>

  );

}

export default FlashDeals;