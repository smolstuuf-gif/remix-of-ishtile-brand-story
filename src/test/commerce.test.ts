import { describe, expect, it } from "vitest";

import {
  cartSubtotal,
  cartTotal,
  FREE_SHIPPING_OVER,
  isBdPhone,
  isEmail,
  isPostalCode,
  itemCount,
  makeOrderNumber,
  SHIPPING_FLAT,
  shippingFor,
  type CartLine,
} from "@/lib/commerce";

const line = (price: number, qty = 1): CartLine => ({
  key: `x-${price}-${qty}`,
  productId: "x",
  name: "X",
  image: "",
  price,
  size: "M",
  color: "Black",
  qty,
});

describe("basket totals", () => {
  it("adds up price x quantity", () => {
    expect(cartSubtotal([line(2490, 2), line(1490)])).toBe(6470);
  });

  it("charges the flat delivery fee below the free-shipping threshold", () => {
    expect(FREE_SHIPPING_OVER).toBe(3000);
    expect(SHIPPING_FLAT).toBe(80);
    expect(shippingFor(2990)).toBe(80);
  });

  it("drops the delivery fee once the basket reaches the threshold", () => {
    expect(shippingFor(FREE_SHIPPING_OVER)).toBe(0);
    expect(shippingFor(3010)).toBe(0);
  });

  it("charges nothing for an empty basket", () => {
    expect(shippingFor(0)).toBe(0);
    expect(cartTotal([])).toBe(0);
  });

  it("puts delivery on top of the subtotal", () => {
    expect(cartTotal([line(1490)])).toBe(1570);
    expect(cartTotal([line(3490)])).toBe(3490);
  });

  it("counts every unit, not every line", () => {
    expect(itemCount([line(1490, 3), line(1990, 1)])).toBe(4);
  });
});

describe("checkout field rules", () => {
  it("accepts a Bangladeshi mobile number", () => {
    expect(isBdPhone("01712345678")).toBe(true);
    expect(isBdPhone("+8801712345678")).toBe(true);
    expect(isBdPhone("8801712345678")).toBe(true);
    expect(isBdPhone("017-1234-5678")).toBe(true);
  });

  it("rejects numbers that are not Bangladeshi mobiles", () => {
    expect(isBdPhone("0123456789")).toBe(false);
    expect(isBdPhone("0171234567")).toBe(false);
    expect(isBdPhone("017123456789")).toBe(false);
    expect(isBdPhone("1712345678")).toBe(false);
    expect(isBdPhone("")).toBe(false);
  });

  it("accepts a 4 to 6 digit postal code only", () => {
    expect(isPostalCode("1207")).toBe(true);
    expect(isPostalCode("1207 ")).toBe(true);
    expect(isPostalCode("120")).toBe(false);
    expect(isPostalCode("12071234")).toBe(false);
  });

  it("accepts a normal email address only", () => {
    expect(isEmail("shahid@example.com")).toBe(true);
    expect(isEmail("shahid@example")).toBe(false);
    expect(isEmail("shahid example")).toBe(false);
  });
});

describe("order numbers", () => {
  it("reads #IS + yyMM + a 3-digit sequence", () => {
    expect(makeOrderNumber(new Date(2025, 7, 24), 247)).toBe("#IS2508247");
    expect(makeOrderNumber(new Date(2026, 0, 5), 7)).toBe("#IS2601007");
  });

  it("always produces 7 digits after the prefix", () => {
    expect(makeOrderNumber(new Date(2025, 10, 1), 999)).toMatch(/^#IS\d{7}$/);
  });
});
