// AuthContext.tsx - React context providing user state and auth actions (login, logout, signup)
// to the entire frontend via the useAuth() hook.
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "@/services/authApi";
import { TOKEN_KEY } from "@/services/api";
import type { User } from "@/types";

const USER_KEY = "user";

interface AuthState {
  user: User | null;
  // false until localStorage has been checked on first load, preventing premature redirects.
  ready: boolean;
}

type AuthAction =
  | { type: "RESTORE"; user: User | null }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTORE":
      // Called once on page load after reading localStorage.
      return { user: action.user, ready: true };
    case "LOGIN":
      return { user: action.user, ready: true };
    case "LOGOUT":
      return { user: null, ready: true };
    default:
      return state;
  }
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  isLoggedIn: boolean;
  isHirer: boolean;
  isVendor: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (details: SignUpDetails) => Promise<void>;
  logout: () => void;
}

interface SignUpDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    ready: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY);
    dispatch({ type: "RESTORE", user: saved ? JSON.parse(saved) : null });
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const result = await authApi.signIn({ email, password });
    const user: User = result.user;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
    }

    dispatch({ type: "LOGIN", user });
    return user;
  }

  async function signup(details: SignUpDetails): Promise<void> {
    await authApi.signUp(details);
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: "LOGOUT" });
  }

  const value: AuthContextValue = {
    user: state.user,
    ready: state.ready,
    isLoggedIn: state.user !== null,
    isHirer: state.user?.role === "hirer",
    isVendor: state.user?.role === "vendor",
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Throws a descriptive error if used outside <AuthProvider>.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}
