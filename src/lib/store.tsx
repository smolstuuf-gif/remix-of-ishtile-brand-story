import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  cartSubtotal,
  cartTotal,
  itemCount,
  lineKey,
  makeOrderNumber,
  MAX_QTY,
  shippingFor,
  type CartLine,
  type Order,
} from "@/lib/commerce";
import type { Product } from "@/lib/catalog";

const STORAGE_KEY = "ishtile.store.v1";

type Persisted = { lines: CartLine[]; wishlist: string[]; orders: Order[] };

export type OrderDetails = Pick<
  Order,
  "name" | "phone" | "email" | "address" | "city" | "postal" | "method"
>;

type Store = {
  lines: CartLine[];
  wishlist: string[];
  orders: Order[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  addItem: (product: Product, opts: { size: string; color: string; qty?: number }) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleWish: (productId: string) => void;
  isWished: (productId: string) => boolean;
  placeOrder: (details: OrderDetails) => Order;
};

const CartContext = createContext<Store | null>(null);

function readStored(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], wishlist: [], orders: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { lines: [], wishlist: [], orders: [] };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Nothing may be written back before the stored basket has been read,
  // otherwise the first render would wipe a returning shopper's cart.
  const [ready, setReady] = useState(false);
  const seq = useRef(Math.floor(Math.random() * 900) + 100);

  useEffect(() => {
    const stored = readStored();
    setLines(stored.lines);
    setWishlist(stored.wishlist);
    setOrders(stored.orders);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, wishlist, orders }));
    } catch {
      /* private mode / quota — the basket still works for this visit */
    }
  }, [ready, lines, wishlist, orders]);

  const addItem = useCallback<Store["addItem"]>((product, { size, color, qty = 1 }) => {
    const key = lineKey(product.id, size, color);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      }
      return [
        ...prev,
        { key, productId: product.id, name: product.name, image: product.image, price: product.price, size, color, qty },
      ];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const placeOrder = useCallback<Store["placeOrder"]>(
    (details) => {
      const placedAt = new Date();
      const subtotal = cartSubtotal(lines);
      const shipping = shippingFor(subtotal);
      const order: Order = {
        number: makeOrderNumber(placedAt, seq.current++),
        placedAt: placedAt.toISOString(),
        lines,
        subtotal,
        shipping,
        total: subtotal + shipping,
        ...details,
      };
      setOrders((prev) => [order, ...prev]);
      setLines([]);
      return order;
    },
    [lines],
  );

  const value = useMemo<Store>(() => {
    const subtotal = cartSubtotal(lines);
    return {
      lines,
      wishlist,
      orders,
      subtotal,
      shipping: shippingFor(subtotal),
      total: cartTotal(lines),
      count: itemCount(lines),
      cartOpen,
      searchOpen,
      menuOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      addItem,
      removeLine,
      setQty,
      clearCart,
      toggleWish,
      isWished: (productId) => wishlist.includes(productId),
      placeOrder,
    };
  }, [lines, wishlist, orders, cartOpen, searchOpen, menuOpen, addItem, removeLine, setQty, clearCart, toggleWish, placeOrder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
