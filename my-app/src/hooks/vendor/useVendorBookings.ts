import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/types";

export function useVendorBookings() {
  const { user } = useAuth("vendor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const data = await vendorApi.getVendorBookings(user!.id);
      setBookings(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching bookings", error); //log any error
      setIsLoading(false);
    }
  };

  return { bookings, isLoading, fetchBookings };
}
