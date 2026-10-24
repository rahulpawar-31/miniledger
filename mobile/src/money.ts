// Shows 2500 as "₹2,500" (Indian digit grouping) and 1200.5 as "₹1,200.50" (two decimals when there are any).
export const rupees = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
