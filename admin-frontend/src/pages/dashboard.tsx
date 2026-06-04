import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { Link } from "react-router-dom";
import { StarIcon } from "@chakra-ui/icons";
import { useQuery, gql } from "@apollo/client";

// Fetch dashbaord stat cards
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalVenues
      totalVendors
      totalHirers
      totalBookings
      avgRating
    }
  }
`;

// Fetch venues with vendor info
const GET_VENUES = gql`
  query GetVenues {
    venues {
      venueID
      name
      location
      isFeatured
      availabilityStatus
      vendor {
        userID
        firstName
        lastName
        email
        phoneNumber
        joinedDate
      }
    }
  }
`;

const GET_TOP_RATED_VENDORS = gql`
  query GetTopRatedVendors {
    topRatedVendors {
      userID
      firstName
      lastName
      email
      joinedDate
      totalVenues
      totalBookings
      avgRating
    }
  }
`;

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS);

  // Fetch all venues
  const { data: venuesData, loading: venuesLoading } = useQuery(GET_VENUES);

  // Fetch top rated vendors
  const { data: topVendorsData, loading: topVendorsLoading } = useQuery(GET_TOP_RATED_VENDORS);

  const isLoading = statsLoading || venuesLoading || topVendorsLoading;

  if (isLoading)
    return (
      <AdminDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </AdminDashboardLayout>
    );

  const stats = statsData?.dashboardStats;
  const venues: any[] = venuesData?.venues ?? [];

  const topVendors: any[] = topVendorsData?.topRatedVendors ?? [];

  const recentVenues = [...venues].reverse().slice(0, 4);

  // Top 3 rated vendors
  const topRatedVendors = [...topVendors];

  // Featured venues only
  const featuredVenues = venues.filter((v) => v.isFeatured);

  // Convert timestamp to readable date
  function formatDate(timestamp: string | number): string {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp)).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Helper to render star icons based on rating
  function renderStars(rating: number) {
    return Array.from({ length: rating }).map((_, i) => (
      <StarIcon key={i} color="yellow.400" boxSize={3} />
    ));
  }

  return (
    <AdminDashboardLayout>
      {/* Header - welcome */}
      <Flex justify={"space-between"}>
        <Text fontWeight="semibold" color="brand.primary" fontSize="3xl">
          Welcome, Admin
        </Text>
        <Link to="/addVenue">
          <Button
            bg="brand.primary"
            color={"white"}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            + Add Venue
          </Button>
        </Link>
      </Flex>

      {/* Dashboard title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          VenueVendors Overview
        </Text>
        <Text fontSize="sm" color="gray.500">
          Review and manage your VenueVendors users
        </Text>
      </Box>

      {/* Stats row */}
      <Flex gap={4} mb={8}>
        {/* Total Venues */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Venues
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {stats?.totalVenues ?? 0}
          </Text>
          <Link to="/venues">
            <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
              View all →
            </Text>
          </Link>
        </Box>

        {/* Total Vendors */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Vendors
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {stats?.totalVendors ?? 0}
          </Text>
        </Box>

        {/* Total Hirers */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Hirers
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {stats?.totalHirers ?? 0}
          </Text>
        </Box>

        {/* Total Completed Bookings */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Bookings
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {stats?.totalBookings ?? 0}
          </Text>
        </Box>

        {/* Total Avg Vendor Rating  */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Avg Vendor Rating
          </Text>
          <Flex align="center" gap={2}>
            <StarIcon color="yellow.400" />
            <Text fontSize="2xl" fontWeight="bold">
              {stats?.avgRating?.toFixed(2) ?? "0.0"}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Recently Added Venues table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Recently Added Venues
          </Text>
          <Link to="/venues">
            <Text color={"white"} fontSize={"md"} _hover={{ textDecoration: "underline" }}>
              View all venues →
            </Text>
          </Link>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Venue Name</Th>
              <Th>Location</Th>
              <Th>Vendor Name</Th>
              <Th>Featured</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {recentVenues.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" color="gray.400">
                  No venues yet
                </Td>
              </Tr>
            ) : (
              recentVenues.map((venue) => (
                <Tr key={venue.venueID}>
                  <Td fontWeight={"semibold"}>{venue.name}</Td>
                  <Td>{venue.location}</Td>
                  <Td>
                    {venue.vendor ? (
                      <Box>
                        <Text>
                          {venue.vendor.firstName} {venue.vendor.lastName}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {venue.vendor.email}
                        </Text>
                      </Box>
                    ) : (
                      <Text color="gray.400">Unassigned</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge
                      borderRadius={"lg"}
                      p={2}
                      colorScheme={venue.isFeatured ? "green" : "red"}
                    >
                      {venue.isFeatured ? "Yes" : "No"}
                    </Badge>
                  </Td>
                  <Td>
                    <Link to={`/manageVenue/${venue.venueID}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="brand.primary"
                        color="brand.primary"
                        _hover={{ bg: "brand.secondary" }}
                      >
                        Manage →
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Top 3-4 Rated Vendors */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Top Rated Vendors
          </Text>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Vendor Name</Th>
              <Th>Total Venues</Th>
              <Th>Date Joined</Th>
              <Th>Total Bookings</Th>
              <Th>Avg Rating</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {topRatedVendors.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign={"center"} color={"gray.400"}>
                  No Rated Vendors yet
                </Td>
              </Tr>
            ) : (
              topRatedVendors.map((vendor) => (
                <Tr key={vendor.userID}>
                  <Td>
                    <Box>
                      <Text fontWeight={"semibold"}>
                        {" "}
                        {vendor.firstName} {vendor.lastName}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {vendor.email}
                      </Text>
                    </Box>
                  </Td>
                  <Td>{vendor.totalVenues} Venue listings</Td>
                  <Td>{formatDate(vendor.joinedDate)}</Td>
                  <Td>{vendor.totalBookings} Bookings</Td>
                  <Td>
                    <Flex gap={2} align="center">
                      {renderStars(vendor.avgRating)}
                      <Text gap={4} fontSize="xs">
                        {vendor.avgRating.toFixed(0)} / 5
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Featured Venues - Quick Glance */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Featured Venues - quick glance
          </Text>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Vendor Name</Th>
              <Th>Location</Th>
              <Th>Vendor Name</Th>
              <Th>Featured</Th>
              <Th>Avg Rating</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {featuredVenues.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" color="gray.400">
                  No featured venues yet
                </Td>
              </Tr>
            ) : (
              featuredVenues.map((venue) => (
                <Tr key={venue.venueID}>
                  <Td fontWeight={"semibold"}>{venue.name}</Td>
                  <Td>{venue.location}</Td>
                  <Td>
                    {" "}
                    {venue.vendor ? (
                      <Box>
                        <Text>
                          {venue.vendor.firstName} {venue.vendor.lastName}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {venue.vendor.email}
                        </Text>
                      </Box>
                    ) : (
                      <Text color={"gray.400"}>Unassigned</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme="green">Yes</Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </AdminDashboardLayout>
  );
}
