import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import { StarIcon } from "@chakra-ui/icons";
import type { Venue } from "@/types";

import { Box, Text, Flex, Avatar, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import Link from "next/link";

// Shapes returned by the backend endpoints we call here.
type DashboardSummary = {
  totalApplications: number;
  savedVenues: number;
  averageRating: number;
  totalRatings: number;
};

type SavedVenueRow = { savedVenueID: number; venue: Venue };

type BookingRow = {
  applicationID: number;
  eventName: string;
  eventDate: string;
  status: string;
  venue?: { name: string; location: string };
  booking?: { vendorRating: number } | null;
};

export default function HirerDashboard() {
  // This page is only for hirers - redirect if not logged in as hirer
  const { user } = useAuth("hirer");

  const [summary, setSummary] = useState<DashboardSummary>({
    totalApplications: 0,
    savedVenues: 0,
    averageRating: 0,
    totalRatings: 0,
  });
  const [savedPreview, setSavedPreview] = useState<SavedVenueRow[]>([]);
  const [bookingsPreview, setBookingsPreview] = useState<BookingRow[]>([]);
  const [credibilityPercentage, setCredibilityPercentage] = useState(0);

  // Load everything the dashboard needs from the database.
  useEffect(() => {
    if (!user) return;

    hirerApi
      .getDashboard()
      .then((data: DashboardSummary) => setSummary(data))
      .catch((error) => console.error("Failed to load dashboard", error));

    hirerApi
      .getSavedVenues()
      .then((rows) => setSavedPreview(rows.slice(0, 4)))
      .catch((error) => console.error("Failed to load saved venues", error));

    hirerApi
      .getMyBookings()
      .then((data: BookingRow[]) => setBookingsPreview(data.slice(0, 4)))
      .catch((error) => console.error("Failed to load bookings", error));

    hirerApi
      .getCompliance()
      .then((data: { complianceScore: number }) =>
        setCredibilityPercentage(Math.round((data.complianceScore / 5) * 100)),
      )
      .catch((error) => console.error("Failed to load compliance", error));
  }, [user]);

  // Star icons for a rating out of 5
  function renderStarRating(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={i} color={i < Math.round(rating) ? "yellow.500" : "gray.300"} boxSize={3} />,
      );
    }
    return <Flex gap={0.5}>{stars}</Flex>;
  }

  function statusColor(status: string) {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  }

  // Don't render anything until we know who the user is
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
            {/* Welcome section */}
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
                    View your profile →
                  </Text>
                </Link>
              </Box>
            </Flex>

            {/* Credibility rating section */}
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

          {/* Dashboard title */}
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              My Dashboard
            </Text>
            <Text fontSize="sm" color="gray.500">
              Review and manage your venue applications
            </Text>
          </Box>

          {/* Stats cards row */}
          <Flex gap={4} mb={6}>
            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Total bookings</Text>
              <Text fontSize="2xl" fontWeight="bold">{summary.totalApplications}</Text>
            </Box>

            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Saved Venues</Text>
              <Text fontSize="2xl" fontWeight="bold">{summary.savedVenues}</Text>
              <Link href="/hirer/savedVenues">
                <Text fontSize="xs" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                  View saved →
                </Text>
              </Link>
            </Box>

            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Avg Rating</Text>
              <Flex justifyContent="center" alignItems="center" gap={1}>
                <StarIcon color="yellow.500" boxSize={4} />
                <Text fontSize="2xl" fontWeight="bold">{summary.averageRating}</Text>
              </Flex>
            </Box>

            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Total Ratings</Text>
              <Text fontSize="2xl" fontWeight="bold">{summary.totalRatings}</Text>
            </Box>
          </Flex>

          {/* Saved venues preview table */}
          <Box mb={6} border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            <Flex bg="brand.primary" color="white" px={4} py={3} justifyContent="space-between" alignItems="center">
              <Text fontWeight="semibold">Saved Venues</Text>
              <Link href="/hirer/savedVenues">
                <Text fontSize="sm" _hover={{ textDecoration: "underline" }} color="white">
                  View all →
                </Text>
              </Link>
            </Flex>

            {savedPreview.length === 0 ? (
              <Box p={4}>
                <Text color="gray.500">No preferred venues have been saved.</Text>
              </Box>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Venue Name</Th>
                    <Th>Location</Th>
                    <Th>Capacity</Th>
                    <Th>Price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {savedPreview.map((row) => (
                    <Tr key={row.savedVenueID}>
                      <Td>{row.venue.name}</Td>
                      <Td>{row.venue.location}</Td>
                      <Td>Max {row.venue.capacity}</Td>
                      <Td>${row.venue.pricePerDay.toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>

          {/* Booking history preview table */}
          <Box mb={6} border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            <Flex bg="brand.primary" color="white" px={4} py={3} justifyContent="space-between" alignItems="center">
              <Text fontWeight="semibold">Your Booking History</Text>
              <Flex gap={4} alignItems="center">
                <Text fontSize="sm">Total: {summary.totalApplications}</Text>
                <Link href="/hirer/bookingHistory">
                  <Text fontSize="sm" _hover={{ textDecoration: "underline" }} color="white">
                    View all →
                  </Text>
                </Link>
              </Flex>
            </Flex>

            {bookingsPreview.length === 0 ? (
              <Box p={4}>
                <Text color="gray.500">No bookings yet.</Text>
              </Box>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Venue Name</Th>
                    <Th>Location</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Rating from Vendor</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bookingsPreview.map((b) => (
                    <Tr key={b.applicationID}>
                      <Td>{b.venue?.name ?? "-"}</Td>
                      <Td>{b.venue?.location ?? "-"}</Td>
                      <Td>
                        {b.eventDate
                          ? new Date(b.eventDate).toLocaleDateString("en-AU")
                          : "-"}
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColor(b.status)} fontSize="xs">
                          {b.status}
                        </Badge>
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
