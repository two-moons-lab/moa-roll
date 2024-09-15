export const isBrowser = () => {
  return typeof window !== "undefined";
};

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in document.documentElement;
};
