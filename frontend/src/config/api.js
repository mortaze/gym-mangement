export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://gym-mangement-backend.vercel.app"
).replace(/\/$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const apiUrl = (path = "") => {
  const normalizedPath = String(path).replace(/^\/+/, "");
  return normalizedPath ? `${API_BASE_URL}/${normalizedPath}` : API_BASE_URL;
};

export const assetUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
};
