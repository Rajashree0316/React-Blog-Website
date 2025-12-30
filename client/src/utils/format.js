// utils/format.js
export const formatDate = (dateStr) => {
  if (!dateStr) return "Invalid date";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};
