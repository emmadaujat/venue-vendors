// hook to check who is logged in
// both hirer pages and vendor pages use this

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { User } from "@/types";

const STORAGE_KEY = "user";

// pass "hirer" or "vendor" to lock a page to that role
export function useAuth(requireLogin?: "hirer" | "vendor") {

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const router = useRouter();

  // on first load, check localStorage for a saved user
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setLoggedInUser(JSON.parse(saved));
    }
    setCheckedStorage(true);
  }, []);

  // if page requires a role, redirect if wrong user or not logged in
  useEffect(() => {
    if (!checkedStorage) return;

    if (requireLogin === "hirer") {
      if (loggedInUser === null || loggedInUser.role !== "hirer") {
        router.push("/signin");
        return;
      }
    }

    if (requireLogin === "vendor") {
      if (loggedInUser === null || loggedInUser.role !== "vendor") {
        router.push("/signin");
        return;
      }
    }
  }, [checkedStorage, loggedInUser, requireLogin, router]);

  // saves user to localStorage
  function login(usr: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usr));
    setLoggedInUser(usr);
  }

  // removes user and goes to signin
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setLoggedInUser(null);
    router.push("/signin");
  }

  let isLoggedIn = false;
  if (loggedInUser !== null) isLoggedIn = true;

  let isHirer = false;
  if (loggedInUser !== null && loggedInUser.role === "hirer") isHirer = true;

  let isVendor = false;
  if (loggedInUser !== null && loggedInUser.role === "vendor") isVendor = true;

  return {
    user: loggedInUser,
    isLoggedIn,
    isHirer,
    isVendor,
    login,
    logout,
  };
}
