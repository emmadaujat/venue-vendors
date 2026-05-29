// Fetches full booking history for a specific hirer across
// all venues. Used on the vendor's hirer profile detail page.
// ===========================================================
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { Booking } from "@/types";

export function useHirerBookingHistory(hirerID: number) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if hirerID is not yet available (e.g. router not ready)
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
