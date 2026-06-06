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
  Spinner,
} from "@chakra-ui/react";

import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { getHirerAvgRating, getReputationBadge } from "@/hirerRatingCalculation";
import { getStatusColor, renderStars } from "@/helpersUtil";

// Import custom hooks
import { useVendorApplications } from "@/hooks/vendor/useVendorApplications";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";

export default function VendorApplications() {
  const { user } = useAuth("vendor");
  const [sortBy, setSortBy] = useState("most-recent");

  // Fetch from custom hooks
  const { applications, isLoading: applicationsLoading } = useVendorApplications();
  const { bookings, isLoading: bookingsLoading } = useVendorBookings();
  const isLoading = applicationsLoading || bookingsLoading;

  // Stats counts
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const declinedCount = applications.filter((a) => a.status === "Declined").length;

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

  // Sort applications based on selected sort option
  const sortedApplications = [...applications].sort((a, b) => {
    if (sortBy === "most-recent") {
      return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
    }
    if (sortBy === "least-recent") {
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    }
    if (sortBy === "reputation-high") {
      const scoreA = getHirerAvgRating(a.hirer.userID, bookings) ?? 0;
      const scoreB = getHirerAvgRating(b.hirer.userID, bookings) ?? 0;
      return scoreB - scoreA;
    }
    if (sortBy === "reputation-low") {
      const scoreA = getHirerAvgRating(a.hirer.userID, bookings) ?? 0;
      const scoreB = getHirerAvgRating(b.hirer.userID, bookings) ?? 0;
      return scoreA - scoreB;
    }
    return 0;
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
                <Th>Venue</Th>
                <Th>Event Type</Th>
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
                </Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedApplications.map((app) => {
                const reputation = getReputationBadge(app.hirer.userID, bookings);

                return (
                  <Tr key={app.applicationID}>
                    {/* if no applications  */}
                    {applications.length === 0 && (
                      <Td colSpan={5} textAlign="center" color="gray.400">
                        {" "}
                        No applications yet{" "}
                      </Td>
                    )}
                    {/* Applicant name + email */}
                    <Td>
                      <Text fontWeight="semibold">
                        {app.hirer.firstName} {app.hirer.lastName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {app.hirer.email}
                      </Text>
                    </Td>
                    <Td>{app.venue.name}</Td>
                    <Td>{app.eventType}</Td>
                    {/* Event date formatted */}
                    <Td>
                      {new Date(app.eventDate).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Td>
                    <Td>{app.guestCount}</Td>
                    <Td>
                      <Flex direction={"column"}>
                        <Flex mb={2}>
                          <Badge colorScheme={reputation.color}>{reputation.label}</Badge>{" "}
                        </Flex>

                        <Flex gap={2}>
                          {/* Show numeric score underneath */}
                          {getHirerAvgRating(app.hirer.userID, bookings) !== null ? (
                            <>
                              {renderStars(getHirerAvgRating(app.hirer.userID, bookings)!)}
                              <Flex>
                                <Text fontSize="xs" color="gray.500">
                                  {getHirerAvgRating(app.hirer.userID, bookings)} / 5
                                </Text>
                              </Flex>
                            </>
                          ) : (
                            <Text fontSize={"sm"} color={"gray.400"}>
                              No ratings yet
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </Td>
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
