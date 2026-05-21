import { Text, Flex, Box, Button, Grid, Image, Badge, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

// Import custom hooks
import { useVendorVenues } from "@/hooks/vendor/useVendorVenues";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";

export default function MyVenues() {
  const { user } = useAuth("vendor");

  // Fetch from custom hooks
  const { bookings, isLoading: bookingsLoading } = useVendorBookings();
  const { venues, isLoading: venuesLoading } = useVendorVenues();

  // isLoading combines both loading states from custom hooks — page shows spinner until all are ready
  const isLoading = venuesLoading || bookingsLoading;

  // Helper - get total completed bookings for a venue
  function totalBookings(venueID: number) {
    return bookings.filter(
      (b) => b.application.venue.venueID === venueID && b.status === "Completed",
    ).length;
  }

  // Helper - availability badge colour
  function getAvailabilityColor(status: string) {
    if (status === "Available") return "green";
    if (status === "Limited Availability") return "orange";
    return "red";
  }

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

  return (
    <VendorDashboardLayout>
      {/* Page title */}
      <Flex justify="space-between">
        <Box mt={8} mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            My Venues
          </Text>
          <Text fontSize="sm" color="gray.500">
            Manage your listed venues and availability
          </Text>
        </Box>

        {/* Add Venue button — navigates to the add venue form */}
        <NextLink href="/vendorDashboard/addVenue">
          <Button
            bg="brand.primary"
            color={"white"}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            + Add Venue
          </Button>
        </NextLink>
      </Flex>

      {/* =========================== EMPTY STATE =========================== */}
      {/* if no venues  */}
      {venues.length === 0 && (
        <Box textAlign="center" color="gray.400" mt={10}>
          <Text>No venues yet — list your first venue now!</Text>
          <Flex>
            <NextLink href={`/vendorDashboard/addVenue/{vendorID}`}></NextLink>
          </Flex>
        </Box>
      )}

      {/* Venue cards */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4} alignItems="stretch">
        {venues.map((venue) => {
          return (
            <Box
              key={venue.venueID}
              display="flex"
              flexDirection="column"
              p={10}
              flex="1"
              borderColor="grey"
              boxShadow="lg"
              bg="white"
              borderRadius={8}
              h="100%"
            >
              {/* Venue image */}
              <Image
                src={venue.imageURL}
                alt={venue.name}
                objectFit="cover"
                fallbackSrc="https://picsum.photos/400/200"
              />

              {/* Availability badge */}
              <Badge
                mt={3}
                colorScheme={getAvailabilityColor(venue.availabilityStatus)}
                alignSelf="flex-start"
              >
                {venue.availabilityStatus}
              </Badge>

              {/* Venue name and location */}
              <Text mt={2} fontWeight="bold" fontSize="xl" color="brand.primary">
                {venue.name}
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {venue.location}
              </Text>

              <Box mt="auto">
                {/* price row */}
                <Flex justify="space-between" align="center">
                  <Text mt={4} color="brand.primary" fontWeight="semibold">
                    ${venue.pricePerDay}/day
                  </Text>
                </Flex>

                {/* Total completed bookings */}
                <Text fontSize="sm" color="gray.500" mb={3}>
                  {totalBookings(venue.venueID)} completed{" "}
                  {totalBookings(venue.venueID) === 1 ? "booking" : "bookings"}
                </Text>

                {/* Manage availability button -- links to calendar page */}
                <NextLink href={`/vendorDashboard/calendar/${venue.venueID}`}>
                  <Button
                    bg="brand.primary"
                    color="white"
                    width="100%"
                    mt="auto"
                    _hover={{
                      bg: "transparent",
                      border: "2px solid",
                      borderColor: "brand.primary",
                      color: "brand.primary",
                    }}
                  >
                    Manage Availability
                  </Button>
                </NextLink>

                {/* Manage Venue button — links to edit venue form */}
                <NextLink href={`/vendorDashboard/editVenue/${venue.venueID}`}>
                  <Button
                    variant="outline"
                    borderColor="brand.primary"
                    color="brand.primary"
                    width="100%"
                    mt={4}
                    _hover={{ bg: "brand.primary", color: "white" }}
                  >
                    Manage Venue
                  </Button>
                </NextLink>
              </Box>
            </Box>
          );
        })}
      </Grid>
    </VendorDashboardLayout>
  );
}
