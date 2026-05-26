import {
  Text,
  Avatar,
  Flex,
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useVendorApplications } from "@/hooks/vendor/useVendorApplications";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";
import { getReputationBadge, getHirerAvgRating } from "@/hirerRatingCalculation";

export default function HirerProfiles() {
  const { user } = useAuth("vendor");
  const { applications, isLoading: applicationsLoading } = useVendorApplications();
  const { bookings, isLoading: bookingsLoading } = useVendorBookings();
  const isLoading = applicationsLoading || bookingsLoading;

  // Credibility score from localStorage
  // Saved by the hirer when they submit their application
  // This is a single global value (not per hirer) since only
  // one hirer is logged in at a time
  const [credibilityScore, setCredibilityScore] = useState<number>(0);

  // Helper - check local storage and dummy data for status and comment updates
  // useEffect(() => {
  //   if (!user?.id) return;
  //   // Load all applications from dummyData + localStorage (new submissions + status updates)
  //   setApplications(getAllApplications());
  //   // Credibility score saved on application submit
  //   const storedScore = localStorage.getItem("credibilityScore");
  //   if (storedScore) setCredibilityScore(Number(storedScore));
  // }, [user?.id]);

  {
    /*TODO: update getting data from database*/
  }
  // Deduplicate hirers - one row per unique hirerId
  // A hirer may have applied to multiple venues so we only
  // want to show them once in the list
  const uniqueHirerIds = [...new Map(applications.map((a) => [a.hirer.userID, a.hirer])).values()];

  {
    /*TODO: update getting data from database*/
  }
  // Build hirer rows with all display data pre-calculated
  const hirerRows = uniqueHirerIds.map((hirer) => {
    const hirerApplications = applications.filter((a) => a.hirer.userID === hirer.userID);
    const reputation = getReputationBadge(hirer.userID, bookings);
    const avgRating = getHirerAvgRating(hirer.userID, bookings);
    const pendingCount = hirerApplications.filter((a) => a.status === "pending").length;
    const approvedCount = hirerApplications.filter((a) => a.status === "approved").length;
    const declinedCount = hirerApplications.filter((a) => a.status === "Declined").length;

    return {
      hirer,
      reputation,
      avgRating,
      pendingCount,
      approvedCount,
      declinedCount,
      totalApplications: hirerApplications.length,
    };
  });

  return (
    <VendorDashboardLayout>
      {/* Header - welcome + add venue */}
      <Flex justify="space-between">
        <Flex alignItems={"center"} gap={3}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            bg="brand.secondary"
            color="brand.primary"
            size="xl"
          />

          <Box>
            <Text fontWeight="semibold" color="brand.primary" fontSize="3xl">
              Welcome Back,
            </Text>
            <Text fontSize="2xl" color="brand.primary">
              {" "}
              {user?.firstName} {user?.lastName}{" "}
            </Text>
          </Box>
        </Flex>
        <NextLink href={`/vendorDashboard/addVenue/`}>
          <Button
            bg="brand.primary"
            color={"white"}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            + Add Venue
          </Button>
        </NextLink>
      </Flex>

      {/* Page title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Hirer Profiles
        </Text>
        <Text fontSize="sm" color="gray.500">
          View Hirer's full historical hire history
        </Text>
      </Box>

      {/* Hirer table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            Hirers
          </Text>
          <Text color="white" fontSize="md">
            Total: {hirerRows.length}
          </Text>
        </Flex>

        {hirerRows.length === 0 ? (
          <Box p={6}>
            <Text fontSize="sm" color="gray.400">
              No hirers have applied to your venues yet.
            </Text>
          </Box>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Hirer</Th>
                <Th textAlign="left">Reputation</Th>
                <Th>Credibility Score</Th>
                <Th>Applications</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {hirerRows.map((row) => (
                <Tr key={row.hirer.userID}>
                  {/* Hirer name and email */}
                  <Td>
                    <Text fontWeight="semibold">
                      {row.hirer?.firstName} {row.hirer?.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {row.hirer?.email}
                    </Text>
                  </Td>

                  {/* Reputation badge and numeric score */}
                  <Td textAlign="left">
                    <Flex gap={1} align={"center"}>
                      <Box>
                        <Badge colorScheme={row.reputation.color}>{row.reputation.label}</Badge>
                      </Box>
                      {row.avgRating !== null && (
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            {row.avgRating} / 5
                          </Text>
                        </Box>
                      )}
                    </Flex>
                  </Td>
                  {/* TODO: Credibility score — N/A until compliance endpoint is available */}
                  <Td>
                    <Text fontWeight="semibold">NA%</Text>
                  </Td>

                  {/* Application status breakdown for this vendor */}
                  <Td>
                    <Text fontSize="sm">Total: {row.totalApplications}</Text>
                    {row.approvedCount > 0 && (
                      <Text fontSize="xs" color="green.500">
                        Approved: {row.approvedCount}
                      </Text>
                    )}
                    {row.pendingCount > 0 && (
                      <Text fontSize="xs" color="purple.500">
                        Pending: {row.pendingCount}
                      </Text>
                    )}
                    {row.declinedCount > 0 && (
                      <Text fontSize="xs" color="red.500">
                        Declined: {row.declinedCount}
                      </Text>
                    )}
                  </Td>

                  {/* Link to individual hirer profile page */}
                  <Td>
                    <NextLink href={`/vendorDashboard/hirerProfiles/${row.hirer.userID}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="brand.primary"
                        color="brand.primary"
                        _hover={{ bg: "brand.secondary" }}
                      >
                        View Profile →
                      </Button>
                    </NextLink>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </VendorDashboardLayout>
  );
}
