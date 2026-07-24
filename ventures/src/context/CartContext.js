import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "ventures_cart_v1";
const CartContext = createContext(null);

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selection = {}) => {
    setCartItems((prev) => {
      const key = `${product.id}_${selection.size || "M"}_${selection.color || "Black"}`;
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size: selection.size || "M",
          color: selection.color || "Black",
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.key !== itemKey));
  };

  const increaseQuantity = (itemKey) => {
    setCartItems((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (itemKey) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.key === itemKey ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const clearCart = () => setCartItems([]);

  const value = useMemo(
    () => ({
      cartItems,
      itemCount,
      totalPrice,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    }),
    [cartItems, itemCount, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
