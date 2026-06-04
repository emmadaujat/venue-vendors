// useVenueBlockouts.ts - fetches, creates, and deletes blocked date periods for a vendor venue.
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { useAuth } from "@/hooks/useAuth";
import type { VenueBlockedDates } from "@/types";

export function useVenueBlockouts(venueId: number | null) {
  const { user } = useAuth("vendor");

  const [blockedDates, setBlockedDates] = useState<VenueBlockedDates[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user && venueId) {
      fetchBlockedDates();
    }
  }, [user, venueId]);

  const fetchBlockedDates = async () => {
    try {
      setIsLoading(true);
      const data = await vendorApi.getVenueBlockedDates(venueId!);
      setBlockedDates(data);
    } catch (error) {
      console.error("Error fetching blocked dates", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBlockout = async (
    startDate: string,
    endDate: string,
    reason: string,
  ): Promise<void> => {
    await vendorApi.createVenueBlockedDates(venueId!, startDate, endDate, reason);
    await fetchBlockedDates();
  };

  const deleteBlockout = async (blockedID: number): Promise<void> => {
    await vendorApi.deleteVenueBlockedDates(venueId!, blockedID);
    await fetchBlockedDates();
  };

  return { blockedDates, isLoading, createBlockout, deleteBlockout };
}
