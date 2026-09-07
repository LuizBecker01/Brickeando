import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthSessionResponse } from "../services/api";

type AuthUser = AuthSessionResponse["user"];

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (session: AuthSessionResponse) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadUser(): AuthUser | null {
  try {
    if (!localStorage.getItem("@Brickeando:token")) {
      return null;
    }
    const user = localStorage.getItem("@Brickeando:user");
    return user ? (JSON.parse(user) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const signIn = (session: AuthSessionResponse) => {
    localStorage.setItem("@Brickeando:token", session.token);
    localStorage.setItem("@Brickeando:user", JSON.stringify(session.user));
    localStorage.setItem("brickeando_session", JSON.stringify(session));
    setUser(session.user);
  };

  const signOut = () => {
    localStorage.removeItem("@Brickeando:token");
    localStorage.removeItem("@Brickeando:user");
    localStorage.removeItem("brickeando_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
