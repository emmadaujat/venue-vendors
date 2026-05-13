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
  Select,
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

export default function VendorApplications() {
  const { user } = useAuth("vendor");
  const [sortBy, setSortBy] = useState("most-recent");

  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);

  {
    /*TODO: update getting venues from database*/
  }
  // Filter data to only show this vendor's data
  const vendorVenues = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id);
  const vendorVenueIds = vendorVenues.map((v) => v.id);

  // Helper - check local storage and dummy data for application status updates
  useEffect(() => {
    if (!user?.id) return;
    setApplications(getAllApplications());
  }, [user?.id]);

  {
    /*TODO: update getting data from database*/
  }
  // get total applications for logged in vendor
  const vendorApplications = applications.filter((a) => vendorVenueIds.includes(a.venueId));

  // Stats counts
  const pendingCount = vendorApplications.filter((a) => a.status === "Pending").length;
  const approvedCount = vendorApplications.filter((a) => a.status === "Approved").length;
  const declinedCount = vendorApplications.filter((a) => a.status === "Declined").length;

  // Sort applications based on selected sort option
  const sortedApplications = [...vendorApplications].sort((a, b) => {
    if (sortBy === "most-recent") {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
    if (sortBy === "least-recent") {
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    if (sortBy === "reputation-high") {
      const scoreA = HIRER_REPUTATION_SCORES[a.hirerId] ?? 0;
      const scoreB = HIRER_REPUTATION_SCORES[b.hirerId] ?? 0;
      return scoreB - scoreA;
    }
    if (sortBy === "reputation-low") {
      const scoreA = HIRER_REPUTATION_SCORES[a.hirerId] ?? 0;
      const scoreB = HIRER_REPUTATION_SCORES[b.hirerId] ?? 0;
      return scoreA - scoreB;
    }
    return 0;
  });

  {
    /*TODO: update getting data from database*/
  }
  // Helper - get hirer details from DEFAULT_USERS
  function getHirer(hirerId: string) {
    return DEFAULT_USERS.find((u) => u.id === hirerId);
  }

  {
    /*TODO: update getting data from database*/
  }
  // Helper - get venue name from venueId
  function getVenueName(venueId: string) {
    return DEFAULT_VENUES.find((v) => v.id === venueId)?.name ?? "Unknown Venue";
  }

  // Helper to get badge colour based on application status
  function getStatusColor(status: string) {
    if (status === "Approved") return "green";
    if (status === "Declined") return "red";
    return "purple";
  }

  // Helper - reputation badge label and colour
  function getReputationBadge(hirerId: string) {
    const score = HIRER_REPUTATION_SCORES[hirerId];
    if (!score) return { label: "No rating", color: "gray" };
    if (score >= 4.3) return { label: "Verified", color: "green" };
    if (score >= 4.0) return { label: "Good standing", color: "blue" };
    return { label: "Unverified", color: "orange" };
  }

  return (
    <VendorDashboardLayout>
      {/* Header - welcome + add venue */}
      <Flex justify="space-between">
        <Flex alignItems={"center"} gap={3}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            bg="brand.secondary"
            color="brand.primary"
            size="lg"
          />

          <Box>
            <Text fontWeight="semibold" color="brand.primary" fontSize="2xl">
              Welcome Back,
            </Text>
            <Text fontSize="xl" color="brand.primary">
              {user?.firstName} {user?.lastName}
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

      {/* Dashboard title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Venue Applications
        </Text>
        <Text fontSize="sm" color="gray.500">
          Review and manage incoming hire requests
        </Text>
      </Box>
      {/* Stats row */}
      <Flex gap={4} mb={8}>
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500">
            Pending Review
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {pendingCount}
          </Text>
        </Box>
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500">
            Approved
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {approvedCount}
          </Text>
        </Box>
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500">
            Declined
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {declinedCount}
          </Text>
        </Box>
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500">
            Total Applications
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {vendorApplications.length}
          </Text>
        </Box>
      </Flex>

      {/* Applications table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        {/* Table header bar */}
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            All Applications
          </Text>
          <Text color="white" fontSize="md">
            Total: {vendorApplications.length}
          </Text>
        </Flex>

        {/* Sort dropdown */}
        <Flex p={4} align="center" gap={2} borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500">
            Sort by:
          </Text>
          <Select size="sm" w="200px" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="most-recent">Most recent</option>
            <option value="least-recent">Least recent</option>
            <option value="reputation-high">Reputation score (high → low)</option>
            <option value="reputation-low">Reputation score (low → high)</option>
          </Select>
        </Flex>

        {/* Table */}
        <Box fontSize="sm">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Applicant</Th>
                <Th>Event Type</Th>
                <Th>Venue</Th>
                <Th>Date</Th>
                <Th>Guests</Th>
                {/* Sort Reputation by clicking on column name */}
                <Th
                  cursor="pointer"
                  onClick={() => {
                    if (sortBy === "reputation-high") {
                      setSortBy("reputation-low");
                    } else {
                      setSortBy("reputation-high");
                    }
                  }}
                  color="brand.primary"
                >
                  Reputation{" "}
                  {sortBy === "reputation-high" ? "↓" : sortBy === "reputation-low" ? "↑" : "↕"}
                </Th>{" "}
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedApplications.map((app) => {
                const hirer = getHirer(app.hirerId);
                const reputation = getReputationBadge(app.hirerId);
                return (
                  <Tr key={app.id}>
                    {/* Applicant name + email */}
                    <Td>
                      <Text fontWeight="semibold">
                        {hirer?.firstName} {hirer?.lastName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {hirer?.email}
                      </Text>
                    </Td>

                    <Td>{app.eventType}</Td>
                    <Td>{getVenueName(app.venueId)}</Td>

                    {/* Event date formatted */}
                    <Td>
                      {new Date(app.eventDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Td>

                    <Td>{app.guestCount}</Td>

                    {/* Reputation badge */}
                    <Td>
                      <Flex align="center" gap={1} direction="column">
                        <Badge colorScheme={reputation.color}>{reputation.label}</Badge>
                        {/* Show numeric score underneath */}
                        {HIRER_REPUTATION_SCORES[app.hirerId] && (
                          <Text fontSize="xs" color="gray.500">
                            {HIRER_REPUTATION_SCORES[app.hirerId]} / 5
                          </Text>
                        )}
                      </Flex>
                    </Td>

                    {/* Status badge */}
                    <Td>
                      <Badge colorScheme={getStatusColor(app.status)}>{app.status}</Badge>
                    </Td>

                    {/* Review button - links to individual application page */}
                    <Td>
                      <NextLink href={`/vendorDashboard/applications/${app.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="brand.primary"
                          color="brand.primary"
                          _hover={{ bg: "brand.secondary" }}
                        >
                          Review
                        </Button>
                      </NextLink>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </VendorDashboardLayout>
  );
}
