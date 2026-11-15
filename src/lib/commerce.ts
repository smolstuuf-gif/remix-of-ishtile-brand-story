/** Pure commerce rules. No React, no browser APIs — safe to import anywhere and test. */

export type CartLine = {
  /** productId|size|color — one line per variant. */
  key: string;
  productId: string;
  name: string;
  image: string;
  /** Price in taka at the moment the item was added. */
  price: number;
  size: string;
  color: string;
  qty: number;
};

export type Order = {
  number: string;
  placedAt: string;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  method: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal: string;
};

/** Delivery is free once the basket reaches this many taka. */
export const FREE_SHIPPING_OVER = 3000;
/** Flat delivery charge in taka below that threshold. */
export const SHIPPING_FLAT = 80;
export const MAX_QTY = 10;

export function lineKey(productId: string, size: string, color: string) {
  return `${productId}|${size}|${color}`;
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
}

export function cartTotal(lines: CartLine[]) {
  const subtotal = cartSubtotal(lines);
  return subtotal + shippingFor(subtotal);
}

export function itemCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

/** Bangladeshi mobile numbers: 01X XXXXXXXX, or the same with +880 / 880. */
export function isBdPhone(value: string) {
  const digits = value.replace(/[\s-().]/g, "");
  return /^(?:0|(\+?88)0)1[3-9]\d{8}$/.test(digits);
}

/** Bangladesh postal codes are 4 digits; allow 5–6 for safety. */
export function isPostalCode(value: string) {
  return /^\d{4,6}$/.test(value.trim());
}

export function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

/**
 * Order numbers read `#IS` + yyMM + a 3-digit sequence, e.g. #IS2508247
 * for sequence 247 in August 2025.
 */
export function makeOrderNumber(placedAt: Date, sequence: number) {
  const yy = String(placedAt.getFullYear()).slice(-2);
  const mm = String(placedAt.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.abs(Math.trunc(sequence)) % 1000).padStart(3, "0");
  return `#IS${yy}${mm}${seq}`;
}
