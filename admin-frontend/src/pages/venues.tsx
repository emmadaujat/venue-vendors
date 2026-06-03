import { useState } from "react";
import {
  Box,
  Flex,
  Spinner,
  Input,
  Text,
  Button,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
} from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { Link } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import { useQuery, gql, useMutation } from "@apollo/client";

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
      capacity
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

// Update venue featured status
const SET_FEATURED = gql`
  mutation SetFeatured($venueId: ID!, $featured: Boolean!) {
    setFeatured(venueId: $venueId, featured: $featured) {
      venueID
      isFeatured
    }
  }
`;

export default function Venues() {
  // Fetch dashboard stats
  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS);

  // Fetch all venues
  const { data: venuesData, loading: venuesLoading } = useQuery(GET_VENUES);

  // setFeatured mutation - refetches venues after toggle so UI updates
  const [setFeatured] = useMutation(SET_FEATURED, {
    refetchQueries: [{ query: GET_VENUES }],
  });

  const isLoading = statsLoading || venuesLoading;

  const [searchText, setSearchText] = useState("");

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

  // Filter venues by name, location or vendor name based on search text
  const filteredVenues = venues.filter((venue) => {
    const search = searchText.toLowerCase();
    const vendorName = venue.vendor
      ? `${venue.vendor.firstName} ${venue.vendor.lastName}`.toLowerCase()
      : "";
    return (
      venue.name.toLowerCase().includes(search) ||
      venue.location.toLowerCase().includes(search) ||
      vendorName.includes(search)
    );
  });

  return (
    <AdminDashboardLayout>
      {/* Header - welcome */}
      <Flex justify="space-between">
        {/* search bar */}
        <Flex flex={1} maxW="400px">
          <InputGroup>
            <InputLeftElement>
              <SearchIcon color={"gray.400"} />
            </InputLeftElement>
            <Input
              variant="outline"
              placeholder="Search venues, locations or vendors..."
              borderRadius={"8px"}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </Flex>

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
      <Flex justify="space-between">
        <Box mt={8} mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Venues Overview
          </Text>
          <Text fontSize="sm" color="gray.500">
            View and manage your VenueVendors Venues
          </Text>
        </Box>

        {/* Stats row */}
        <Flex gap={4} mb={8} mt={10}>
          {/* Total Venues */}
          <Box
            bg="#F6F6F5"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            flex="1"
          >
            <Text fontSize="sm" color="gray.500" mb={2} whiteSpace={"nowrap"}>
              Total Venues
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {stats?.totalVenues ?? 0}
            </Text>
          </Box>

          {/* Total Vendors */}
          <Box
            bg="#F6F6F5"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            flex="1"
          >
            <Text fontSize="sm" color="gray.500" mb={2} whiteSpace={"nowrap"}>
              Total Vendors
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {stats?.totalVendors ?? 0}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* Venues table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Venues
          </Text>
          <Text color="white" fontSize="md">
            Total: {stats?.totalVenues ?? 0}
          </Text>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Venue Name</Th>
              <Th>Location</Th>
              <Th>Assigned Vendor</Th>
              <Th>Capacity</Th>
              <Th>Featured</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {filteredVenues.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.400">
                  No venues
                </Td>
              </Tr>
            ) : (
              filteredVenues.map((venue) => (
                <Tr key={venue.venueID}>
                  <Td fontWeight="semibold">{venue.name}</Td>
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
                  <Td>{venue.capacity} ppl</Td>
                  {/* Change a venue to be featured */}
                  <Td>
                    <Flex align="center" gap={2}>
                      <Switch
                        isChecked={venue.isFeatured}
                        colorScheme="green"
                        onChange={() =>
                          setFeatured({
                            variables: {
                              venueId: venue.venueID,
                              featured: !venue.isFeatured,
                            },
                          })
                        }
                        _hover={{ opacity: 0.8 }}
                      ></Switch>
                      <Text fontSize="sm">{venue.isFeatured ? "Yes" : "No"}</Text>
                    </Flex>
                  </Td>

                  {/* Link to individual venue page */}
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
    </AdminDashboardLayout>
  );
}
