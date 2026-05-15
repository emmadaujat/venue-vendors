import { Text, Flex, Box, Button, Grid, Image, Badge, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { vendorApi } from "@/services/vendorApi";
import { useState, useEffect } from "react";
import type { Venue, Booking } from "@/types";

export default function MyVenues() {
  const { user } = useAuth("vendor");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // -------------------------------------------------------------------
  // ------------------ GET LOGGED IN VENDOR VENUES --------------------
  // -------------------------------------------------------------------
  useEffect(() => {
    // useEffect runs when the component loads and whenever 'user' changes
    if (user) {
      Promise.all([fetchVenues(), fetchBookings()]).then(() => setIsLoading(false));
    }
  }, [user]); // the [user] means "re-run this effect whenever user changes"

  // async function that calls the backend API to get this vendor's venues
  const fetchVenues = async () => {
    try {
      // user!.id is the logged in vendor's ID — the ! tells TypeScript we know user is not null here
      // we pass it to getVendorsVenues which sends GET /api/{vendorID}/venues to the backend
      const data = await vendorApi.getVendorsVenues(user!.id);
      // store the returned array of venues in state so the page can display them
      setVenues(data);
    } catch (error) {
      console.log("Error fetching venues", error); //log any error
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await vendorApi.getVendorBookings(user!.id);
      setBookings(data);
    } catch (error) {
      console.log("Error fetching bookings", error); //log any error
    }
  };

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
        <Button
          bg="brand.primary"
          color={"white"}
          _hover={{ bg: "brand.secondary", color: "brand.primary" }}
        >
          + Add Venue
        </Button>
      </Flex>
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
              {/* if no venues  */}
              {venues.length === 0 && (
                <Box textAlign="center" color="gray.400">
                  No venues yet, list a venue now!
                  <Flex>
                    <NextLink href={`/vendorDashboard/addVenue/{vendorID}`}></NextLink>
                  </Flex>
                </Box>
              )}
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

                {/* Manage availability button */}
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
              </Box>
            </Box>
          );
        })}
      </Grid>
    </VendorDashboardLayout>
  );
}
