import { API_ORIGIN } from "@/config/api";

export const CAFE_PLACEHOLDER_IMAGE = "/assets/img/logo.png";

export function getCafeMenuImage(img) {
  if (!img) return CAFE_PLACEHOLDER_IMAGE;
  if (String(img).startsWith("http://") || String(img).startsWith("https://")) return img;
  return `${API_ORIGIN}/uploads/${String(img).replace(/^\/+/, "")}`;
}
