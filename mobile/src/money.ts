// Shows 2500 as "₹2,500" (Indian digit grouping, no decimals unless needed).
export const rupees = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
