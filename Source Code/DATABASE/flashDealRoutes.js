const express = require("express");
const router = express.Router();

const db = require("../config/db");


// =====================================================
// GET TODAY'S FLASH DEALS
// GET /api/flash-deals/today
// =====================================================

router.get(
  "/today",
  async (req, res) => {

    try {

      const [
        deals
      ] = await db.query(
        `
        SELECT

          fd.id,

          fd.source_order_id,

          fd.product_id,

          fd.product_name,

          fd.quantity,

          fd.original_price,

          fd.discount_percent,

          fd.flash_price,

          fd.deal_date,

          fd.is_available,

          p.image,

          p.description,

          p.unit_description,

          p.is_available AS product_is_available,

          p.customizable

        FROM flash_deals fd

        INNER JOIN products p
          ON p.id = fd.product_id

        WHERE fd.deal_date = CURDATE()

          AND fd.is_available = TRUE

          AND p.is_available = TRUE

          AND (
            p.customizable = FALSE
            OR p.customizable IS NULL
          )

        ORDER BY
          fd.created_at ASC,

          fd.product_name ASC
        `
      );


      // =================================================
      // FORMAT DEALS
      // =================================================

      const formattedDeals =
        deals.map(
          (deal) => {

            const originalPrice =
              Number(
                deal.original_price
              );

            const flashPrice =
              Number(
                deal.flash_price
              );

            const quantity =
              Number(
                deal.quantity
              );

            const discountPercent =
              Number(
                deal.discount_percent
              );


            return {

              id:
                Number(
                  deal.id
                ),

              source_order_id:
                Number(
                  deal.source_order_id
                ),

              product_id:
                Number(
                  deal.product_id
                ),

              product_name:
                deal.product_name,

              quantity,

              original_price:
                originalPrice,

              discount_percent:
                discountPercent,

              flash_price:
                flashPrice,

              deal_date:
                deal.deal_date,

              is_available:
                Boolean(
                  deal.is_available
                ),

              image:
                deal.image,

              description:
                deal.description,

              unit_description:
                deal.unit_description,

              customizable:
                Boolean(
                  deal.customizable
                )

            };

          }
        );


      return res.json({

        success: true,

        dealDate:
          new Date()
            .toISOString()
            .slice(
              0,
              10
            ),

        count:
          formattedDeals.length,

        deals:
          formattedDeals

      });


    } catch (error) {

      console.error(
        "GET TODAY FLASH DEALS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load today's Flash Deals."

      });

    }

  }
);


// =====================================================
// GET SINGLE FLASH DEAL
// GET /api/flash-deals/:id
// =====================================================

router.get(
  "/:id",
  async (req, res) => {

    try {

      const dealId =
        Number(
          req.params.id
        );


      if (
        !Number.isInteger(
          dealId
        ) ||
        dealId <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid Flash Deal ID."

        });

      }


      const [
        rows
      ] = await db.query(
        `
        SELECT

          fd.id,

          fd.source_order_id,

          fd.product_id,

          fd.product_name,

          fd.quantity,

          fd.original_price,

          fd.discount_percent,

          fd.flash_price,

          fd.deal_date,

          fd.is_available,

          p.image,

          p.description,

          p.unit_description,

          p.customizable

        FROM flash_deals fd

        INNER JOIN products p
          ON p.id = fd.product_id

        WHERE fd.id = ?

          AND fd.deal_date = CURDATE()

          AND fd.is_available = TRUE

          AND p.is_available = TRUE

          AND (
            p.customizable = FALSE
            OR p.customizable IS NULL
          )

        LIMIT 1
        `,
        [
          dealId
        ]
      );


      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Flash Deal not found or is no longer available."

        });

      }


      const deal =
        rows[0];


      return res.json({

        success: true,

        deal: {

          ...deal,

          id:
            Number(
              deal.id
            ),

          source_order_id:
            Number(
              deal.source_order_id
            ),

          product_id:
            Number(
              deal.product_id
            ),

          quantity:
            Number(
              deal.quantity
            ),

          original_price:
            Number(
              deal.original_price
            ),

          discount_percent:
            Number(
              deal.discount_percent
            ),

          flash_price:
            Number(
              deal.flash_price
            ),

          is_available:
            Boolean(
              deal.is_available
            ),

          customizable:
            Boolean(
              deal.customizable
            )

        }

      });


    } catch (error) {

      console.error(
        "GET FLASH DEAL ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load Flash Deal."

      });

    }

  }
);


module.exports = router;