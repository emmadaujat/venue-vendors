import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_BOOKINGS } from "@/dummyData";
import { StarIcon } from "@chakra-ui/icons";
import type { Venue, Booking, Application, User } from "@/types";
import { Box, Text, Flex, Avatar, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import Link from "next/link";
import { authApi } from "@/services/authApi";

export default function UserProfile() {
  // This page is only for hirers - redirect if not logged in as hirer
  const { user } = useAuth("hirer");
  const [profile, setProfile] = useState<User | null>(null);

  // Get profile from api/backend
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getProfile(user!.id);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // State for saved venues loaded from localStorage
  const [savedVenuesList, setSavedVenuesList] = useState<Venue[]>([]);
  const [hirerBookings, setHirerBookings] = useState<Booking[]>([]);
  const [credibilityPercentage, setCredibilityPercentage] = useState(0);

  // Load saved venues and bookings from localStorage on page load
  useEffect(() => {
    if (!user) return;

    // Load saved venues from localStorage
    //TODO: get saved venues from database
    const savedVenuesFromStorage = localStorage.getItem("savedVenues");
    if (savedVenuesFromStorage) {
      setSavedVenuesList(JSON.parse(savedVenuesFromStorage));
    }

    //TODO: get booking history from database
    // Load bookings - use localStorage if available, otherwise use default data
    const bookingsFromStorage = localStorage.getItem("hirerBookings");
    let loadedBookings: Booking[] = [];
    if (bookingsFromStorage) {
      loadedBookings = JSON.parse(bookingsFromStorage);
    } else {
      loadedBookings = DEFAULT_BOOKINGS.filter((booking) => booking.hirerId === user.id);
    }

    // Merge in vendor Approved/Declined status updates from applicationStatuses
    const storedApps = localStorage.getItem("hirerApplications");
    const storedStatuses = localStorage.getItem("applicationStatuses");
    if (storedApps && storedStatuses) {
      const apps: Application[] = JSON.parse(storedApps);
      const statuses: Record<string, string> = JSON.parse(storedStatuses);
      loadedBookings = loadedBookings.map((booking) => {
        const matchingApp = apps.find(
          (a) =>
            a.hirerId === booking.hirerId &&
            a.venueId === booking.venueId &&
            a.eventName === booking.eventName,
        );
        if (matchingApp && statuses[matchingApp.id]) {
          return { ...booking, status: statuses[matchingApp.id] };
        }
        return booking;
      });
    }
    setHirerBookings(loadedBookings);

    // TODO: get credibility score from database
    // Load credibility score from localStorage
    const savedCredibility = localStorage.getItem("credibilityScore");
    if (savedCredibility) {
      setCredibilityPercentage(Number(savedCredibility));
    }
  }, [user]);

  // Calculate stats from bookings
  const totalBookingsCount = hirerBookings.length;
  const savedVenuesCount = savedVenuesList.length;

  // Only count bookings that have been rated (vendorRating > 0)
  const ratedBookings = hirerBookings.filter((b) => b.vendorRating > 0);
  const totalRatingsCount = ratedBookings.length;

  // Calculate average rating from vendor ratings on bookings
  let averageRatingValue = 0;
  if (ratedBookings.length > 0) {
    const ratingSum = ratedBookings.reduce((sum, b) => sum + b.vendorRating, 0);
    averageRatingValue = parseFloat((ratingSum / ratedBookings.length).toFixed(1));
  }

  // Show max 4 saved venues and max 4 bookings in the preview tables
  const savedVenuesPreview = savedVenuesList.slice(0, 2);
  const bookingsPreview = hirerBookings.slice(0, 2);

  // Helper to render star icons for a given rating out of 5
  function renderStarRating(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={i} color={i < Math.round(rating) ? "yellow.500" : "gray.300"} boxSize={3} />,
      );
    }
    return <Flex gap={0.5}>{stars}</Flex>;
  }

  // Don't render anything until we know who the user is
  if (!profile) return <Box>Loading...</Box>;

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      <Flex flex="1">
        {/* Left sidebar */}
        <HirerSidebar />

        {/* Main content */}
        <Box flex="1" p={6} bg="gray.50">
          {/* Two column layout */}
          <Flex gap={10} alignItems="flex-start">
            {/* ===================== LEFT PANEL — Profile details ===================== */}
            <Box
              w="280px"
              flexShrink={0}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
            >
              {/* Purple header banner */}
              <Box bg="brand.primary" h="80px" />
              {/* Avatar overlapping banner */}
              <Flex flexDirection="column" alignItems="center" px={6} pb={6}>
                <Avatar
                  name={profile.firstName + " " + profile.lastName}
                  bg="brand.secondary"
                  color="brand.primary"
                  size="xl"
                  mt="-40px"
                  border="4px solid white"
                />
                <Text fontSize="lg" fontWeight="bold" mt={3} textAlign="center">
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={4}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Account
                </Text>

                {/* Divider */}
                <Box w="100%" h="1px" bg="gray.100" mb={4} />

                {/* Profile details list */}
                <Box w="100%" fontSize="sm">
                  <Flex justifyContent="space-between" mb={3}>
                    <Text color="gray.500">Email</Text>
                    <Text fontWeight="semibold" textAlign="right" maxW="160px" noOfLines={1}>
                      {profile.email}
                    </Text>
                  </Flex>

                  <Flex justifyContent="space-between" mb={3}>
                    <Text color="gray.500">Phone</Text>
                    <Text fontWeight="semibold">{profile.phoneNumber || "—"}</Text>
                  </Flex>

                  <Flex justifyContent="space-between" mb={3}>
                    <Text color="gray.500">Member since</Text>
                    <Text fontWeight="semibold">
                      {profile.joinedDate
                        ? new Date(profile.joinedDate).toLocaleDateString("en-AU", {
                            month: "short",
                            year: "numeric",
                          })
                        : "date"}
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between" mb={3}>
                    <Text color="gray.500">Credibility</Text>
                    <Text fontWeight="semibold" color="green.500">
                      {/* TODO: update once api is built */}
                      {credibilityPercentage}%
                    </Text>
                  </Flex>
                </Box>
                {/* Divider */}
                <Box w="100%" h="1px" bg="gray.100" my={4} />

                {/* Edit details link */}
                <Link href="/hirer/myDetails">
                  <Text
                    fontSize="sm"
                    color="brand.primary"
                    mt={2}
                    _hover={{ textDecoration: "underline" }}
                  >
                    Edit your details →
                  </Text>
                </Link>
                <Link href="/hirer/complianceDocuments">
                  <Text
                    fontSize="sm"
                    color="brand.primary"
                    mt={2}
                    _hover={{ textDecoration: "underline" }}
                  >
                    Add Compliance Documents →
                  </Text>
                </Link>
              </Flex>
            </Box>

            {/* ===================== RIGHT PANEL — Stats + Tables ===================== */}
            <Box flex="1">
              {/* Stats cards row */}
              <Flex gap={10} mb={6}>
                <Box
                  flex="1"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={4}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="gray.500">
                    Total bookings
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {/* TODO: update once api is built */}
                    {totalBookingsCount}
                  </Text>
                </Box>

                {/* Saved venues card */}
                <Box
                  flex="1"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={4}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="gray.500">
                    Saved Venues
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {/* TODO: update once api is built */}
                    {savedVenuesCount}
                  </Text>
                  <Link href="/hirer/savedVenues">
                    <Text
                      fontSize="xs"
                      color="brand.primary"
                      _hover={{ textDecoration: "underline" }}
                    >
                      View saved →
                    </Text>
                  </Link>
                </Box>

                {/* Average rating card */}
                <Box
                  flex="1"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="gray.500">
                    Avg Rating
                  </Text>
                  <Flex justifyContent="center" alignItems="center" gap={1}>
                    <StarIcon color="yellow.500" boxSize={4} />
                    <Text fontSize="2xl" fontWeight="bold">
                      {/* TODO: update once api is built */}
                      {averageRatingValue}
                    </Text>
                  </Flex>
                </Box>

                {/* Total ratings card */}
                <Box
                  flex="1"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="gray.500">
                    Total Ratings
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {/* TODO: update once api is built */}
                    {totalRatingsCount}
                  </Text>
                </Box>
              </Flex>

              {/* Saved venues preview table */}
              <Box
                mb={6}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
              >
                <Flex
                  bg="brand.primary"
                  color="white"
                  px={4}
                  py={3}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="semibold">Saved Venues</Text>
                  <Link href="/hirer/savedVenues">
                    <Text fontSize="sm" _hover={{ textDecoration: "underline" }} color="white">
                      View all →
                    </Text>
                  </Link>
                </Flex>

                {/* TODO: update once api is built */}
                {savedVenuesPreview.length === 0 ? (
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
                      {savedVenuesPreview.map((venue) => (
                        <Tr key={venue.id}>
                          <Td>{venue.name}</Td>
                          <Td>{venue.location}</Td>
                          <Td>Max {venue.capacity}</Td>
                          <Td>${venue.pricePerDay.toLocaleString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>

              {/* Booking history preview table */}
              <Box
                mb={6}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
              >
                <Flex
                  bg="brand.primary"
                  color="white"
                  px={4}
                  py={3}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="semibold">Your Booking History</Text>
                  <Flex gap={4} alignItems="center">
                    {/* TODO: update once api is built */}
                    <Text fontSize="sm">Total: {totalBookingsCount}</Text>
                    <Link href="/hirer/bookingHistory">
                      <Text fontSize="sm" _hover={{ textDecoration: "underline" }} color="white">
                        View all →
                      </Text>
                    </Link>
                  </Flex>
                </Flex>

                {/* TODO: update once api is built */}
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
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bookingsPreview.map((booking) => (
                        <Tr key={booking.id}>
                          <Td>{booking.venueName}</Td>
                          <Td>{booking.venueLocation}</Td>
                          <Td>{new Date(booking.eventDate).toLocaleDateString("en-AU")}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                booking.status === "Approved"
                                  ? "green"
                                  : booking.status === "Declined"
                                    ? "red"
                                    : booking.status === "Pending"
                                      ? "orange"
                                      : booking.status === "Saved Draft"
                                        ? "purple"
                                        : "gray"
                              }
                              fontSize="xs"
                            >
                              {booking.status}
                            </Badge>
                          </Td>
                          <Td>
                            {booking.vendorRating > 0 ? (
                              <Flex alignItems="center" gap={2}>
                                {renderStarRating(booking.vendorRating)}
                                <Text fontSize="sm">{booking.vendorRating} / 5</Text>
                              </Flex>
                            ) : (
                              <Text fontSize="sm" color="gray.400">
                                N/A
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Link href="/hirer/bookingHistory">
                              <Text
                                fontSize="sm"
                                color="brand.primary"
                                _hover={{ textDecoration: "underline" }}
                              >
                                View details →
                              </Text>
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </Box>
            {/* ===================== END RIGHT PANEL ===================== */}
          </Flex>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}
