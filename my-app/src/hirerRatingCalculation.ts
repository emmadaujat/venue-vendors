import type { Booking } from "@/types";

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
