import { useRouter } from "next/router";
import { useEffect } from "react";

import store from "@/redux/store";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ReactModal from "react-modal";
import { clearAuth, fetchCurrentUser, getDashboardPath, getStoredAuth, normalizeRole, persistAuth } from "@/utils/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";

import "../styles/globals.css";
import "../styles/dashboard.css";

const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
  "768004342999-p4ivhapdmh7sm1pv02vft691vlt9d38n.apps.googleusercontent.com";

const publicRoutes = ["/"];

const routeRoleMap = {
  "/admin-dashboard": ["admin"],
  "/manager-dashboard": ["admin"],
  "/trainers-dashboard": ["trainer"],
  "/member-dashboard": ["member"],
  "/users-dashboard": ["member"],
  "/cafe-dashboard": ["cafeManager"],
  "/reception-dashboard": ["reception"],
};

const getAllowedRolesForPath = (pathname) => {
  const matchedRoute = Object.keys(routeRoleMap).find((route) =>
    pathname === route || pathname.startsWith(`${route}/`),
  );
  return matchedRoute ? routeRoleMap[matchedRoute] : null;
};

function AuthGate({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return;

    let cancelled = false;

    const guardRoute = async () => {
      const isPublicRoute = publicRoutes.includes(router.pathname);
      const { token, user } = getStoredAuth();

      if (!token || !user) {
        if (!isPublicRoute) router.replace("/");
        return;
      }

      try {
        const freshUser = await fetchCurrentUser(token);
        if (cancelled) return;
        persistAuth(token, freshUser);

        if (isPublicRoute) {
          router.replace(getDashboardPath(freshUser.role));
          return;
        }

        const allowedRoles = getAllowedRolesForPath(router.pathname);
        const currentRole = normalizeRole(freshUser.role);
        if (allowedRoles && !allowedRoles.includes(currentRole)) {
          router.replace(getDashboardPath(currentRole));
        }
      } catch (error) {
        if (cancelled) return;
        clearAuth();
        if (!isPublicRoute) router.replace("/");
      }
    };

    guardRoute();
    return () => {
      cancelled = true;
    };
  }, [router, router.isReady, router.pathname]);

  return children;
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      ReactModal.setAppElement("body");
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthGate>
            <Component {...pageProps} />
          </AuthGate>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
