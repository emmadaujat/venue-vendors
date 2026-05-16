import type { Booking } from "@/types";

// works out the avg rating and total bookings for a vendor
// export function getVendorStats(vendorId: string) {
//   const myVenues = DEFAULT_VENUES.filter((v) => v.vendorId === vendorId);
//   const myBookingCount = DEFAULT_BOOKINGS.filter((b) =>
//     myVenues.some((v) => v.id === b.venueId),
//   ).length;
//   const avgRat = (myVenues.reduce((sum, v) => sum + v.rating, 0) / myVenues.length).toFixed(1);

//   return { avgRating: avgRat, totalBookings: myBookingCount };
// }

// // works out the avg rating and total bookings for a hirer
// export function getHirerStats(hirerId: string) {
//   const myBookings = DEFAULT_BOOKINGS.filter((b) => b.hirerId === hirerId);
//   const rated = myBookings.filter((b) => b.vendorRating !== 0);
//   const avgRat = (rated.reduce((sum, b) => sum + b.vendorRating, 0) / rated.length).toFixed(1);

//   return { avgRating: avgRat, totalBookings: myBookings.length };
// }

// get hirerReputationRating from bookings
export function getHirerAvgRating(hirerID: number, bookings: Booking[]) {
  const hirerBookings = bookings.filter(
    (booking) => booking.application.hirer.userID === hirerID && booking.hirerReputationRating > 0,
  );
  if (hirerBookings.length === 0) return null;
  return (
    hirerBookings.reduce((acc, booking) => acc + booking.hirerReputationRating, 0) /
    hirerBookings.length
  );
}

// Helper - reputation badge label and colour
export function getReputationBadge(hirerID: number, bookings: Booking[]) {
  const score = getHirerAvgRating(hirerID, bookings);
  if (!score) return { label: "No rating", color: "gray" };
  if (score >= 4.0) return { label: "Verified", color: "green" };
  if (score <= 3.9 && score >= 3.0) return { label: "Good standing", color: "blue" };
  return { label: "Unverified", color: "red" };
}
