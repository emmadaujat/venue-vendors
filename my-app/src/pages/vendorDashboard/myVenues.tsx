import { DEFAULT_BOOKINGS, DEFAULT_VENUES } from "../../dummyData";
import { Text, Flex, Box, Button, Grid, Image, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function MyVenues() {
  const { user } = useAuth("vendor");

  // Filter data to only show this vendor's data
  const vendorVenues = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id);

  // Helper - get total completed bookings for a venue
  function getTotalBookings(venueId: string) {
    return DEFAULT_BOOKINGS.filter((b) => b.venueId === venueId && b.status === "Completed").length;
  }

  // Helper - availability badge colour
  function getAvailabilityColor(status: string) {
    if (status === "Available") return "green";
    if (status === "Limited Availability") return "orange";
    return "red";
  }

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
        {vendorVenues.map((venue) => {
          const totalBookings = getTotalBookings(venue.id);

          return (
            <Box
              key={venue.id}
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
                src={venue.imageUrl}
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
                  {totalBookings} completed {totalBookings === 1 ? "booking" : "bookings"}
                </Text>

                {/* Manage availability button */}
                <NextLink href={`/vendorDashboard/calendar/${venue.id}`}>
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
