const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function toFlag(value) {
  if (value === undefined || value === null) return false;
  return TRUE_VALUES.has(String(value).trim().toLowerCase());
}

const hidePriceFlag = import.meta.env.VITE_HIDE_PRODUCT_PRICES;
export const HIDE_PRODUCT_PRICES =
  hidePriceFlag === undefined ? true : toFlag(hidePriceFlag);
export const NON_COMMERCIAL_DISCLAIMER =
  "We are still not commercially operational and cannot process any order.";
