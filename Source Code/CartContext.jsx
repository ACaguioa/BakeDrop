import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();

const CART_STORAGE_KEY =
  "bakedrop-cart";


// =====================================================
// LOAD SAVED CART
// =====================================================

function getSavedCart() {
  try {
    const savedCart =
      localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!savedCart) {
      return [];
    }

    const parsedCart =
      JSON.parse(savedCart);

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];

  } catch (error) {
    console.error(
      "Failed to load saved cart:",
      error
    );

    return [];
  }
}


// =====================================================
// CART PROVIDER
// =====================================================

export function CartProvider({
  children,
}) {

  const [cart, setCart] =
    useState(getSavedCart);


  const [
    selectedItems,
    setSelectedItems,
  ] = useState(() =>
    getSavedCart().map(
      (item) =>
        String(item.id)
    )
  );


  // ===================================================
  // SAVE CART
  // ===================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart]);


  // ===================================================
  // KEEP SELECTED ITEMS VALID
  // ===================================================

  useEffect(() => {
    const currentIds =
      cart.map(
        (item) =>
          String(item.id)
      );

    setSelectedItems(
      (currentSelected) =>
        currentSelected.filter(
          (id) =>
            currentIds.includes(
              String(id)
            )
        )
    );

  }, [cart]);


  // ===================================================
  // ADD TO CART
  // Supports normal products and Flash Deals
  // ===================================================

  const addToCart = (
    product
  ) => {

    const isFlashDeal =
      Boolean(
        product.flash_deal_id
      );


    const cartItemId =
      isFlashDeal
        ? `flash-deal-${product.flash_deal_id}`
        : product.id;


    setCart(
      (currentCart) => {

        const existingItem =
          currentCart.find(
            (item) =>
              String(item.id) ===
              String(cartItemId)
          );


        // =============================================
        // EXISTING ITEM
        // =============================================

        if (existingItem) {

          return currentCart.map(
            (item) =>
              String(item.id) ===
              String(cartItemId)
                ? {
                    ...item,

                    quantity:
                      Number(
                        item.quantity || 0
                      ) + 1,

                    customization:
                      product.customization ??
                      item.customization ??
                      null,
                  }
                : item
          );
        }


        // =============================================
        // NEW ITEM
        // =============================================

        return [
          ...currentCart,

          {
            ...product,

            id:
              cartItemId,

            product_id:
              product.product_id ??
              product.id,

            flash_deal_id:
              product.flash_deal_id ??
              null,

            original_price:
              product.original_price ??
              null,

            price:
              Number(
                product.price ??
                product.flash_price ??
                0
              ),

            quantity:
              Number(
                product.quantity
              ) || 1,

            customization:
              product.customization ||
              null,
          },
        ];
      }
    );


    // ===============================================
    // AUTO SELECT NEW ITEM
    // ===============================================

    setSelectedItems(
      (currentSelected) => {

        const id =
          String(
            cartItemId
          );


        if (
          currentSelected.includes(
            id
          )
        ) {
          return currentSelected;
        }


        return [
          ...currentSelected,
          id,
        ];
      }
    );
  };


  // ===================================================
  // TOGGLE ITEM SELECTION
  // ===================================================

  const toggleItemSelection = (
    id
  ) => {

    const itemId =
      String(id);


    setSelectedItems(
      (currentSelected) => {

        if (
          currentSelected.includes(
            itemId
          )
        ) {

          return currentSelected.filter(
            (selectedId) =>
              selectedId !==
              itemId
          );
        }


        return [
          ...currentSelected,
          itemId,
        ];
      }
    );
  };


  // ===================================================
  // SELECT ALL
  // ===================================================

  const toggleSelectAll = () => {

    if (
      selectedItems.length ===
      cart.length
    ) {

      setSelectedItems([]);

      return;
    }


    setSelectedItems(
      cart.map(
        (item) =>
          String(item.id)
      )
    );
  };


  // ===================================================
  // CHECK ITEM SELECTION
  // ===================================================

  const isItemSelected = (
    id
  ) => {

    return selectedItems.includes(
      String(id)
    );
  };


  // ===================================================
  // SELECTED CART ITEMS
  // ===================================================

  const selectedCartItems =
    useMemo(() => {

      return cart.filter(
        (item) =>
          selectedItems.includes(
            String(item.id)
          )
      );

    }, [
      cart,
      selectedItems,
    ]);


  // ===================================================
  // SELECTED TOTAL PRICE
  // ===================================================

  const selectedTotalPrice =
    useMemo(() => {

      return selectedCartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.price || 0
          ) *
            Number(
              item.quantity || 0
            ),
        0
      );

    }, [
      selectedCartItems,
    ]);


  // ===================================================
  // SELECTED TOTAL ITEMS
  // ===================================================

  const selectedTotalItems =
    useMemo(() => {

      return selectedCartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );

    }, [
      selectedCartItems,
    ]);


  // ===================================================
  // ALL SELECTED
  // ===================================================

  const isAllSelected =
    cart.length > 0 &&
    selectedItems.length ===
      cart.length;


  // ===================================================
  // INCREASE QUANTITY
  // ===================================================

  const increaseQuantity = (
    id
  ) => {

    setCart(
      (currentCart) =>
        currentCart.map(
          (item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity || 0
                    ) + 1,
                }
              : item
        )
    );
  };


  // ===================================================
  // DECREASE QUANTITY
  // ===================================================

  const decreaseQuantity = (
    id
  ) => {

    setCart(
      (currentCart) =>
        currentCart
          .map(
            (item) =>
              String(item.id) ===
              String(id)
                ? {
                    ...item,

                    quantity:
                      Number(
                        item.quantity || 0
                      ) - 1,
                  }
                : item
          )
          .filter(
            (item) =>
              Number(
                item.quantity
              ) > 0
          )
    );
  };


  // ===================================================
  // REMOVE FROM CART
  // ===================================================

  const removeFromCart = (
    id
  ) => {

    const itemId =
      String(id);


    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            String(item.id) !==
            itemId
        )
    );


    setSelectedItems(
      (currentSelected) =>
        currentSelected.filter(
          (selectedId) =>
            selectedId !==
            itemId
        )
    );
  };


  // ===================================================
  // CLEAR CART
  // ===================================================

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
  };


  // ===================================================
  // TOTAL PRICE
  // ===================================================

  const totalPrice =
    useMemo(() => {

      return cart.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.price || 0
          ) *
            Number(
              item.quantity || 0
            ),
        0
      );

    }, [
      cart,
    ]);


  // ===================================================
  // TOTAL ITEMS
  // ===================================================

  const totalItems =
    useMemo(() => {

      return cart.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );

    }, [
      cart,
    ]);


  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = {

    cart,

    totalPrice,

    totalItems,

    selectedItems,

    selectedCartItems,

    selectedTotalPrice,

    selectedTotalItems,

    isAllSelected,

    addToCart,

    increaseQuantity,

    decreaseQuantity,

    removeFromCart,

    clearCart,

    toggleItemSelection,

    toggleSelectAll,

    isItemSelected,

  };


  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}


// =====================================================
// USE CART
// =====================================================

export function useCart() {

  const context =
    useContext(
      CartContext
    );


  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );

  }


  return context;
}