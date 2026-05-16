// ===========================================================
// AuthContext.tsx — one shared place that remembers who is
// logged in, for the WHOLE frontend app
// ===========================================================
// Before this, every page read/wrote localStorage by itself
// (see hooks/useAuth.ts). That still works, but (S7) 
// asks for a single React Context so any page can call
// useAuth() and get { user, login, logout, signup } without
// passing props around.
//
// We use React Context + useReducer (the pattern asked for in
// the plan). useReducer is just useState's bigger sibling: all
// the ways the auth state can change live in ONE reducer
// function, which keeps the logic easy to follow.
//
// Backwards-compatible on purpose: it still stores the user
// under the "user" localStorage key so existing pages that use
// the old hooks/useAuth.ts keep working while pages are migrated.
// It additionally stores the JWT under "vv_token" so the shared
// Axios client (services/api.ts) can attach it to requests.
//
// NOTE: Emma's sign-in endpoint (S5) will return a `token` field
// once it calls signToken() from the backend's utils/jwt.ts.
// Until then this context simply works without a token (the user
// is still remembered) no page breaks in the meantime.
// ===========================================================

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

const USER_KEY = "user"; // same key the old useAuth hook uses

// ---- The shape of the auth state -------------------------------
interface AuthState {
  user: User | null;
  // false until we have checked localStorage on first load, so
  // pages don't redirect to /signin before we know the answer.
  ready: boolean;
}

// ---- The actions the reducer understands -----------------------
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

// What pages get back when they call useAuth().
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

  // On first load, see if a user was already saved last time.
  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY);
    dispatch({ type: "RESTORE", user: saved ? JSON.parse(saved) : null });
  }, []);

  // Sign in: ask the backend, then remember the user (and token).
  async function login(email: string, password: string): Promise<User> {
    const result = await authApi.signIn({ email, password });
    const user: User = result.user;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Emma's S5 endpoint will include result.token; store it when
    // present so the Axios interceptor can use it.
    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
    }

    dispatch({ type: "LOGIN", user });
    return user; // returned so the page can redirect by role
  }

  // Sign up: create the account. We do NOT auto-login here so the
  // existing flow (redirect to /signin afterwards) is unchanged.
  async function signup(details: SignUpDetails): Promise<void> {
    await authApi.signUp(details);
  }

  // Sign out: forget everything.
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

// Small helper so pages just write: const { user } = useAuth();
// Throws a clear error if someone forgets the <AuthProvider>.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}
