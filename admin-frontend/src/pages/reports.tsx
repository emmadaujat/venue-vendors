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
} from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { useQuery, gql, NetworkStatus } from "@apollo/client";

// Fetch Top applicant
const GET_TOP_APPLICANT = gql`
  query GetTopApplicant {
    topApplicants {
      userID
      firstName
      lastName
      email
      totalApplications
      approvedBookings
      joinedDate
    }
  }
`;

const GET_POPULAR_VENUES = gql`
  query GetPopularVenues {
    topVenues {
      venueID
      name
      location
      totalApplications
      mostPopularDay
      mostPopularTimeslot
      vendorName
      vendorEmail
    }
  }
`;

export default function Reports() {
  const {
    data: topApplicantData,
    loading: topApplicantLoading,
    refetch: refetchApplicants,
    networkStatus: applicantNetworkStatus,
  } = useQuery(GET_TOP_APPLICANT, { notifyOnNetworkStatusChange: true });

  const {
    data: topVenuesData,
    loading: topVenuesLoading,
    refetch: refetchVenues,
    networkStatus: venuesNetworkStatus,
  } = useQuery(GET_POPULAR_VENUES, { notifyOnNetworkStatusChange: true });

  const isApplicantsRefetching = applicantNetworkStatus === NetworkStatus.refetch;
  const isVenuesRefetching = venuesNetworkStatus === NetworkStatus.refetch;

  // Only show full page spinner on initial load of either query, not refetch
  const isLoading =
    (topApplicantLoading && applicantNetworkStatus === NetworkStatus.loading) ||
    (topVenuesLoading && venuesNetworkStatus === NetworkStatus.loading);

  const topApplicants: any[] = topApplicantData?.topApplicants ?? [];
  const topVenues: any[] = topVenuesData?.topVenues ?? [];

  // Calculate success ratio as a percentage (approved bookings / total applications)
  // Returns 0 if no applications to avoid division by zero
  const calcSuccessRatio = (approvedBookings: number, totalApplications: number): number => {
    if (totalApplications === 0) return 0;
    return Math.round((approvedBookings / totalApplications) * 100);
  };

  // Convert timestamp to readable date
  function formatDate(timestamp: string | number): string {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp)).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (isLoading)
    return (
      <AdminDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </AdminDashboardLayout>
    );

  return (
    <AdminDashboardLayout>
      {/* Header - welcome */}

      {/* Dashboard title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Reports Overview
        </Text>
        <Text fontSize="sm" color="gray.500">
          Statistical overview of VenueVendors
        </Text>
      </Box>

      {/* Top 3: Popular Venues table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Top 3: Popular Venues
          </Text>
          <Button
            bg="white"
            color="brand.primary"
            onClick={() => refetchVenues()}
            isDisabled={isLoading}
          >
            Refresh
          </Button>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Venue Name</Th>
              <Th>Location</Th>
              <Th>Assigned Vendor</Th>
              <Th>Most Popular Day</Th>
              <Th>Most Popular Timeslot</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {/* Show spinner row while refetching */}
            {isVenuesRefetching ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={6}>
                  <Flex justify="center">
                    <Spinner size="md" color="brand.primary" />
                  </Flex>
                </Td>
              </Tr>
            ) : topVenues.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.400">
                  No venues
                </Td>
              </Tr>
            ) : (
              topVenues.map((venue) => (
                <Tr key={venue.venueID}>
                  <Td fontWeight="semibold">{venue.name}</Td>
                  <Td>{venue.location}</Td>
                  <Td>
                    {venue.vendorName ? (
                      <Box>
                        <Text>{venue.vendorName}</Text>
                        <Text fontSize="xs" color="gray.400">
                          {venue.vendorEmail}
                        </Text>
                      </Box>
                    ) : (
                      <Text color="gray.400">Unassigned</Text>
                    )}
                  </Td>
                  <Td>{venue.mostPopularDay}</Td>
                  <Td>{venue.mostPopularTimeslot}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Top 3: Most Active Applicants table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify={"space-between"}
          align="center"
        >
          <Text color="white" fontWeight={"semibold"}>
            Top 3: Most Active Applicants
          </Text>
          <Button
            bg="white"
            color="brand.primary"
            onClick={() => refetchApplicants()}
            isDisabled={isLoading}
          >
            Refresh
          </Button>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Applicant Name</Th>
              <Th>Total Applications</Th>
              <Th>Approved Bookings</Th>
              <Th>Success Ratio</Th>
              <Th>Date Joined</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">
            {/* Show spinner row while refetching */}
            {isApplicantsRefetching ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={6}>
                  <Flex justify="center">
                    <Spinner size="md" color="brand.primary" />
                  </Flex>
                </Td>
              </Tr>
            ) : topApplicants.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.400">
                  No applicants
                </Td>
              </Tr>
            ) : (
              topApplicants.map((applicant) => (
                <Tr key={applicant.userID}>
                  <Td fontWeight="semibold">
                    <Box>
                      <Text>
                        {applicant.firstName} {applicant.lastName}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {applicant.email}
                      </Text>
                    </Box>
                  </Td>
                  <Td>{applicant.totalApplications}</Td>
                  <Td>{applicant.approvedBookings}</Td>
                  <Td>
                    {calcSuccessRatio(applicant.approvedBookings, applicant.totalApplications)}%
                  </Td>
                  <Td>{formatDate(applicant.joinedDate)}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </AdminDashboardLayout>
  );
}
