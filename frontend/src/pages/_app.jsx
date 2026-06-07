// frontend\src\pages\_app.jsx
import { useRouter } from "next/router";
import { useEffect } from "react";

import store from "@/redux/store";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ReactModal from "react-modal";

import "../styles/globals.css";
import "../styles/dashboard.css";

const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
  "768004342999-p4ivhapdmh7sm1pv02vft691vlt9d38n.apps.googleusercontent.com";

// نقش‌های مجاز برای هر مسیر
const routeRoleMap = {
  "/users-dashboard": ["user"],
  "/trainers-dashboard": ["trainer", "coach"],
  "/manager-dashboard": ["admin"],
  "/cafe-dashboard": ["cafe"],
  "/reception-dashboard": ["reception"],
};

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // ⭐ Route Guard
  useEffect(() => {
    if (typeof window === "undefined") return;

    const publicRoutes = ["/"]; // فقط صفحه لاگین
    const currentUserRaw = sessionStorage.getItem("currentUser");
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    // اگر صفحه عمومی نیست و کاربر لاگین نکرده
    if (!currentUser && !publicRoutes.includes(router.pathname)) {
      router.replace("/");
      return;
    }

    // چک نقش کاربر برای مسیرهای محدود
    const allowedRoles = routeRoleMap[router.pathname];
    if (allowedRoles && currentUser) {
      if (!allowedRoles.includes(currentUser.role)) {
        // نقش مجاز نیست → ریدایرکت به داشبورد خودش
        switch (currentUser.role) {
          case "user":
            router.replace("/users-dashboard");
            break;
          case "trainer":
            router.replace("/trainers-dashboard");
            break;
          case "admin":
            router.replace("/manager-dashboard");
            break;
          case "cafe":
            router.replace("/cafe-dashboard");
            break;
          case "reception":
            router.replace("/reception-dashboard");
            break;
          default:
            router.replace("/");
        }
      }
    }
  }, [router.pathname]);

  // React Modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      ReactModal.setAppElement("body");
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </GoogleOAuthProvider>
  );
}
