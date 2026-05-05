import { DEFAULT_VENUES, DEFAULT_BOOKINGS } from "@/dummyData";

// works out the avg rating and total bookings for a vendor
export function getVendorStats(vendorId: string) {
  const myVenues = DEFAULT_VENUES.filter((v) => v.vendorId === vendorId);
  const myBookingCount = DEFAULT_BOOKINGS.filter((b) =>
    myVenues.some((v) => v.id === b.venueId),
  ).length;
  const avgRat = (
    myVenues.reduce((sum, v) => sum + v.rating, 0) / myVenues.length
  ).toFixed(1);

  return { avgRating: avgRat, totalBookings: myBookingCount };
}

// works out the avg rating and total bookings for a hirer
export function getHirerStats(hirerId: string) {
  const myBookings = DEFAULT_BOOKINGS.filter((b) => b.hirerId === hirerId);
  const rated = myBookings.filter((b) => b.vendorRating !== 0);
  const avgRat = (
    rated.reduce((sum, b) => sum + b.vendorRating, 0) / rated.length
  ).toFixed(1);

  return { avgRating: avgRat, totalBookings: myBookings.length };
}
