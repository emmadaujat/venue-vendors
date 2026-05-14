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
import { vendorApi } from "@/services/vendorApi";
import type { Application } from "@/types";

export default function VendorApplications() {
  const { user } = useAuth("vendor");
  const [sortBy, setSortBy] = useState("most-recent");

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const data = await vendorApi.getVendorApplications(user!.id);
      setApplications(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching applications", error);
      setIsLoading(false);
    }
  };

  // Stats counts
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const declinedCount = applications.filter((a) => a.status === "declined").length;

  // TODO: implement reputation sorting once reputation score  is built
  // Sort applications based on selected sort option
  // const sortedApplications = [...vendorApplications].sort((a, b) => {
  //    (sortBy === "most-recent") {
  //     return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  //   }
  //    (sortBy === "least-recent") {
  //     return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  //   }
  //    (sortBy === "reputation-high") {
  //     const scoreA = HIRER_REPUTATION_SCORES[a.hirerId] ?? 0;
  //     const scoreB = HIRER_REPUTATION_SCORES[b.hirerId] ?? 0;
  //     return scoreB - scoreA;
  //   }
  //    (sortBy === "reputation-low") {
  //     const scoreA = HIRER_REPUTATION_SCORES[a.hirerId] ?? 0;
  //     const scoreB = HIRER_REPUTATION_SCORES[b.hirerId] ?? 0;
  //     return scoreA - scoreB;
  //   }
  //   return 0;
  // });

  // Helper to get badge colour based on application status
  function getStatusColor(status: string) {
    if (status === "approved") return "green";
    if (status === "declined") return "red";
    return "purple";
  }

  // Helper - reputation badge label and colour
  // function getReputationBadge(hirerId: string) {
  //   const score = HIRER_REPUTATION_SCORES[hirerId];
  //   if (!score) return { label: "No rating", color: "gray" };
  //   if (score >= 4.3) return { label: "Verified", color: "green" };
  //   if (score >= 4.0) return { label: "Good standing", color: "blue" };
  //   return { label: "Unverified", color: "orange" };
  // }

  if (isLoading) return <Box>Loading...</Box>;
  if (applications.length === 0) return <Box>No applications yet!</Box>;

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
            {applications.length}
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
            Total: {applications.length}
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
              {applications.map((app) => {
                return (
                  <Tr key={app.applicationID}>
                    {/* Applicant name + email */}
                    <Td>
                      <Text fontWeight="semibold">
                        {app.hirer.firstName} {app.hirer.lastName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {app.hirer.email}
                      </Text>
                    </Td>

                    <Td>{app.eventType}</Td>
                    <Td>{app.venue.name}</Td>

                    {/* Event date formatted */}
                    <Td>
                      {new Date(app.eventDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Td>

                    <Td>{app.guestCount}</Td>

                    {/* TODO: implement reputation once reputation score endpoint is built */}
                    {false && (
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
                    )}

                    {/* Status badge */}
                    <Td>
                      <Badge colorScheme={getStatusColor(app.status)}>{app.status}</Badge>
                    </Td>

                    {/* Review button - links to individual application page */}
                    <Td>
                      <NextLink href={`/vendorDashboard/applications/${app.applicationID}`}>
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
