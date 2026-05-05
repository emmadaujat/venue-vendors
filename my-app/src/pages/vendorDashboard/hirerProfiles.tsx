import { DEFAULT_USERS, DEFAULT_APPLICATIONS, DEFAULT_VENUES } from "../../dummyData";
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
} from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getAllApplications } from "@/getApplications";

// Hardcoded reputation scores
const HIRER_REPUTATION_SCORES: Record<string, number> = {
  "1": 4.5, // Taylor Swift
  "2": 4.2, // Beyonce
  "3": 3.8, // Ariana Grande
};

export default function HirerProfiles() {
  const { user } = useAuth("vendor");
  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);

  // Credibility score from localStorage
  // Saved by the hirer when they submit their application
  // This is a single global value (not per hirer) since only
  // one hirer is logged in at a time
  const [credibilityScore, setCredibilityScore] = useState<number>(0);

  // Helper - check local storage and dummy data for status and comment updates
  useEffect(() => {
    if (!user?.id) return;
    // Load all applications from dummyData + localStorage (new submissions + status updates)
    setApplications(getAllApplications());
    // Credibility score saved on application submit
    const storedScore = localStorage.getItem("credibilityScore");
    if (storedScore) setCredibilityScore(Number(storedScore));
  }, [user?.id]);

  // Filter data to only show this vendor's data
  const vendorVenues = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id);
  const vendorVenueIds = vendorVenues.map((v) => v.id);
  const vendorApplications = applications.filter((a) => vendorVenueIds.includes(a.venueId));

  // Deduplicate hirers - one row per unique hirerId
  // A hirer may have applied to multiple venues so we only
  // want to show them once in the list
  const uniqueHirerIds = vendorApplications
    .map((a) => a.hirerId)
    .filter((id, index, self) => self.indexOf(id) === index);

  // Build hirer rows with all display data pre-calculated
  const hirerRows = uniqueHirerIds.map((hirerId) => {
    const hirer = DEFAULT_USERS.find((u) => u.id === hirerId);

    // All applications this hirer has made to this vendor's venues
    const hirerApplications = vendorApplications.filter((a) => a.hirerId === hirerId);

    // Reputation score and badge from hardcoded scores
    const score = HIRER_REPUTATION_SCORES[hirerId];
    const reputationBadge = !score
      ? { label: "No rating", color: "gray" }
      : score >= 4.3
        ? { label: "Verified", color: "green" }
        : score >= 4.0
          ? { label: "Good standing", color: "blue" }
          : { label: "Unverified", color: "orange" };

    // Application status summary
    const approvedCount = hirerApplications.filter((a) => a.status === "Approved").length;
    const pendingCount = hirerApplications.filter((a) => a.status === "Pending").length;
    const declinedCount = hirerApplications.filter((a) => a.status === "Declined").length;

    return {
      hirerId,
      hirer,
      score,
      reputationBadge,
      approvedCount,
      pendingCount,
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
        <Button
          bg="brand.primary"
          color={"white"}
          _hover={{ bg: "brand.secondary", color: "brand.primary" }}
        >
          + Add Venue
        </Button>
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
                <Th>Reputation</Th>
                <Th>Credibility Score</Th>
                <Th>Applications</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {hirerRows.map((row) => (
                <Tr key={row.hirerId}>
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
                  <Td>
                    <Flex direction="column" gap={1} align={"center"}>
                      <Badge colorScheme={row.reputationBadge.color}>
                        {row.reputationBadge.label}
                      </Badge>
                      {row.score && (
                        <Text fontSize="xs" color="gray.500">
                          {row.score} / 5
                        </Text>
                      )}
                    </Flex>
                  </Td>
                  {/* Credibility score from localStorage */}
                  <Td>
                    <Text fontWeight="semibold">{credibilityScore}%</Text>
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
                    <NextLink href={`/vendorDashboard/hirerProfiles/${row.hirerId}`}>
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
