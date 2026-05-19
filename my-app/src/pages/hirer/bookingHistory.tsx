import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import { StarIcon } from "@chakra-ui/icons";

import {
  Box,
  Text,
  Flex,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import Link from "next/link";

// One application row as returned by GET /api/hirer/bookings.
type BookingRow = {
  applicationID: number;
  eventName: string;
  eventDate: string;
  status: string; // pending | approved | rejected
  venue?: { name: string; location: string };
  booking?: { vendorRating: number } | null;
};

export default function HirerBookingHistory() {
  // Only hirers can access this page
  const { user } = useAuth("hirer");

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [credibilityPercentage, setCredibilityPercentage] = useState(0);

  useEffect(() => {
    if (!user) return;

    hirerApi
      .getMyBookings()
      .then((data: BookingRow[]) => setBookings(data))
      .catch((error) => console.error("Failed to load bookings", error));

    hirerApi
      .getCompliance()
      .then((data: { complianceScore: number }) =>
        setCredibilityPercentage(Math.round((data.complianceScore / 5) * 100)),
      )
      .catch((error) => console.error("Failed to load compliance", error));
  }, [user]);

  // Stats: only count applications the vendor actually rated.
  const totalBookingsCount = bookings.length;
  const ratedBookings = bookings.filter(
    (b) => b.booking && b.booking.vendorRating > 0,
  );
  let averageRatingValue = 0;
  if (ratedBookings.length > 0) {
    const ratingSum = ratedBookings.reduce(
      (sum, b) => sum + (b.booking?.vendorRating ?? 0),
      0,
    );
    averageRatingValue = parseFloat((ratingSum / ratedBookings.length).toFixed(1));
  }

  // Star icons for a rating out of 5
  function renderStarRating(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          color={i < Math.round(rating) ? "yellow.500" : "gray.300"}
          boxSize={3}
        />,
      );
    }
    return <Flex gap={0.5}>{stars}</Flex>;
  }

  // Map a status string to a Chakra colour scheme.
  function statusColor(status: string) {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange"; // pending
  }

  if (!user) return null;

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      <Flex flex="1">
        {/* Left sidebar */}
        <HirerSidebar />

        {/* Main content */}
        <Box flex="1" p={6}>
          {/* Welcome + credibility row */}
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={8}
            bg="gray.50"
            borderRadius="lg"
            p={6}
            border="1px solid"
            borderColor="gray.200"
          >
            <Flex alignItems="center" gap={4}>
              <Avatar
                name={user.firstName + " " + user.lastName}
                bg="brand.secondary"
                color="brand.primary"
                size="lg"
              />
              <Box>
                <Text fontSize="xl" fontWeight="bold">
                  Welcome Back,
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Text>
                <Link href="/hirer/myDetails">
                  <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                    View your details →
                  </Text>
                </Link>
              </Box>
            </Flex>

            <Box textAlign="center">
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Current Credibility Rating:
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="brand.primary">
                {credibilityPercentage}%
              </Text>
              <Link href="/hirer/complianceDocuments">
                <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                  Add more Compliance Documents →
                </Text>
              </Link>
            </Box>
          </Flex>

          {/* Page title + stats */}
          <Flex justifyContent="space-between" alignItems="flex-start" mb={6}>
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                My Booking History
              </Text>
              <Text fontSize="sm" color="gray.500">
                View your booking history and see your ratings
              </Text>
            </Box>

            <Flex gap={4}>
              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
                textAlign="center"
                minW="120px"
              >
                <Text fontSize="sm" color="gray.500">Avg Rating</Text>
                <Flex justifyContent="center" alignItems="center" gap={1}>
                  <StarIcon color="yellow.500" boxSize={4} />
                  <Text fontSize="2xl" fontWeight="bold">{averageRatingValue}</Text>
                </Flex>
              </Box>

              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
                textAlign="center"
                minW="120px"
              >
                <Text fontSize="sm" color="gray.500">Total Bookings</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalBookingsCount}</Text>
              </Box>
            </Flex>
          </Flex>

          {/* Booking history table */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            <Box bg="brand.primary" color="white" px={4} py={3}>
              <Text fontWeight="semibold">Your Booking History</Text>
            </Box>

            {bookings.length === 0 ? (
              <Box p={6}>
                <Text color="gray.500">No bookings yet.</Text>
              </Box>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Venue Name</Th>
                    <Th>Location</Th>
                    <Th>Date</Th>
                    <Th>Rating from Vendor</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bookings.map((b) => (
                    <Tr key={b.applicationID}>
                      <Td fontWeight="medium">{b.venue?.name ?? "-"}</Td>
                      <Td>{b.venue?.location ?? "-"}</Td>
                      <Td>
                        {b.eventDate
                          ? new Date(b.eventDate).toLocaleDateString("en-AU")
                          : "-"}
                      </Td>
                      <Td>
                        {b.booking && b.booking.vendorRating > 0 ? (
                          <Flex alignItems="center" gap={2}>
                            {renderStarRating(b.booking.vendorRating)}
                            <Text fontSize="sm">{b.booking.vendorRating} / 5</Text>
                          </Flex>
                        ) : (
                          <Text fontSize="sm" color="gray.400">N/A</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColor(b.status)} fontSize="xs">
                          {b.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}
