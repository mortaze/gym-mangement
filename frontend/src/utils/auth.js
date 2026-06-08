import { API_BASE_URL } from "@/config/api";

export const ROLE_REDIRECTS = {
  admin: "/admin-dashboard",
  trainer: "/trainers-dashboard",
  member: "/member-dashboard",
  reception: "/reception-dashboard",
  cafeManager: "/cafe-dashboard",
  finance: "/manager-dashboard/finance",
};

export const ROLE_LABELS = {
  admin: "مدیر سیستم",
  trainer: "مربی",
  member: "ورزشکار",
  reception: "پذیرش",
  cafeManager: "مدیر کافه",
  finance: "مالی",
};

const ROLE_ALIASES = {
  admin: "admin",
  manager: "admin",
  trainer: "trainer",
  coach: "trainer",
  member: "member",
  user: "member",
  reception: "reception",
  cafe: "cafeManager",
  cafemanager: "cafeManager",
  finance: "finance",
};

export const normalizeRole = (role) => ROLE_ALIASES[String(role || "").trim().toLowerCase()] || String(role || "").trim();

export const getDashboardPath = (role) => ROLE_REDIRECTS[normalizeRole(role)] || "/";

export const getStoredAuth = () => {
  if (typeof window === "undefined") return { token: null, user: null };

  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user") || sessionStorage.getItem("currentUser");
  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (error) {
      user = null;
    }
  }

  return { token, user };
};

export const persistAuth = (token, user) => {
  if (typeof window === "undefined") return;
  const normalizedUser = user ? { ...user, role: normalizeRole(user.role) } : null;

  if (token) localStorage.setItem("token", token);
  if (normalizedUser) {
    const serializedUser = JSON.stringify(normalizedUser);
    localStorage.setItem("user", serializedUser);
    sessionStorage.setItem("currentUser", serializedUser);
  }
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("currentUser");
};

export const fetchCurrentUser = async (token) => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });

  if (!res.ok) throw new Error("Invalid auth session");
  const data = await res.json();
  if (!data?.user) throw new Error("User not found in auth response");
  return { ...data.user, role: normalizeRole(data.user.role) };
};
