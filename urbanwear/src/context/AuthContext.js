import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredSession, fetchCurrentUser, getStoredSession } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const session = getStoredSession();
      if (!session?.token || !session?.user) {
        if (isMounted) {
          setCurrentUser(null);
          setIsAuthLoading(false);
        }
        return;
      }

      if (isMounted) {
        setCurrentUser(session.user);
      }

      try {
        const verifiedUser = await fetchCurrentUser(session.token);
        if (isMounted) {
          setCurrentUser(verifiedUser);
        }
      } catch (error) {
        clearStoredSession();
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthLoading,
      logout: async () => {
        clearStoredSession();
        setCurrentUser(null);
      },
      setCurrentUser,
    }),
    [currentUser, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
