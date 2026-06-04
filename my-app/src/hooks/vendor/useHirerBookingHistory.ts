// useHirerBookingHistory.ts - fetches a specific hirer's full booking history across all venues.
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { Booking } from "@/types";

export function useHirerBookingHistory(hirerID: number) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hirerID || isNaN(hirerID)) return;

    async function fetchBookings() {
      try {
        setIsLoading(true);
        const data = await vendorApi.getHirerBookingHistory(hirerID);
        setBookings(data);
      } catch (err) {
        setError("Failed to load hirer booking history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [hirerID]);

  return { bookings, isLoading, error };
}
