// all state and logic to get vendors venues

import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { useAuth } from "@/hooks/useAuth";
import type { Venue } from "@/types";

export function useVendorVenues() {
  const { user } = useAuth("vendor");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchVenues();
    }
  }, [user]);

  const fetchVenues = async () => {
    try {
      const data = await vendorApi.getVendorsVenues(user!.id);
      setVenues(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching venues", error);
      setIsLoading(false);
    }
  };

  return { venues, isLoading, fetchVenues };
}
