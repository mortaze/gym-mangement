import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser, getStoredAuth, persistAuth } from "@/utils/auth";
import { userLoggedIn, userLoggedOut } from "@/redux/features/auth/authSlice";

export default function useAuthCheck() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyStoredSession = async () => {
      const { token, user } = getStoredAuth();
      if (!token) {
        dispatch(userLoggedOut());
        if (mounted) setAuthChecked(true);
        return;
      }

      try {
        const freshUser = await fetchCurrentUser(token);
        persistAuth(token, freshUser);
        dispatch(userLoggedIn({ accessToken: token, user: freshUser }));
      } catch (error) {
        dispatch(userLoggedOut());
      } finally {
        if (mounted) setAuthChecked(true);
      }
    };

    verifyStoredSession();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return authChecked;
}
