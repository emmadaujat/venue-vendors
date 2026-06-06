import { StarIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";

// Helper to get badge colour based on application status
export function getStatusColor(status: string) {
  if (status === "Approved" || status === "approved") return "green";
  if (status === "Declined" || status === "declined") return "red";
  if (status === "Rejected" || status === "rejected") return "red";
  return "gray";
}

// Helper to render star icons based on rating
export function renderStars(rating: number) {
  return Array.from({ length: rating }).map((_, i) => (
    <StarIcon key={i} color="yellow.400" boxSize={3} />
  ));
}
