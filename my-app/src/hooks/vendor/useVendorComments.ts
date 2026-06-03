import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { useAuth } from "@/hooks/useAuth";
import type { VendorComment } from "@/types";

export function useVendorComments() {
  const { user } = useAuth("vendor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [vendorComments, setVendorComments] = useState<VendorComment[]>([]);

  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      const data = await vendorApi.getVendorComments();
      setVendorComments(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching comments", error);
      setIsLoading(false);
    }
  };

  return { vendorComments, isLoading, fetchComments };
}
