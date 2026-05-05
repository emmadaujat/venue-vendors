import {
  DEFAULT_USERS,
  DEFAULT_BOOKINGS,
  DEFAULT_VENUES,
  DEFAULT_APPLICATIONS,
} from "../../dummyData";
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
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Graph from "@/components/graph";
import { getAllApplications } from "@/getApplications";

export default function InfographicReport() {
  const { user } = useAuth("vendor");
  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);

  // Filter data to only show this vendor's data
  const vendorVenues = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id);
  const vendorVenueIds = vendorVenues.map((v) => v.id);
  const vendorApplications = applications.filter((a) => vendorVenueIds.includes(a.venueId));

  // Get all unique hirers who have applied to this vendor's venues
  const uniqueHirerIds = vendorApplications
    .map((a) => a.hirerId)
    .filter((id, index, self) => self.indexOf(id) === index);

  // Helper - check local storage and dummy data for application status updates
  useEffect(() => {
    if (!user?.id) return;
    // Load all applications from dummyData + localStorage (new submissions + status updates)
    setApplications(getAllApplications());
  }, [user?.id]);

  // Build data for graph
  // for each vendor venues, create an entry for the graph
  const chartData = vendorVenues.map((venue) => {
    const entry: Record<string, string | number> = { venue: venue.id }; // start the entry with only venue id (as venue name is too long to display on graph - using venueID)
    uniqueHirerIds.forEach((hirerId) => {
      // for every hirer who has applied to vendors venues - get all there details including approved count
      const hirer = DEFAULT_USERS.find((u) => u.id === hirerId);
      entry[hirer?.firstName ?? hirerId] = vendorApplications.filter(
        (a) => a.venueId === venue.id && a.hirerId === hirerId && a.status === "Approved",
      ).length;
    });
    return entry;
  });

  // Get venue name to display in interactive tool in graph
  const venueNames: Record<string, string> = {};
  vendorVenues.forEach((v) => {
    venueNames[v.id] = v.name;
  });

  // Get hirers names
  const hirerNames = uniqueHirerIds.map(
    (id) => DEFAULT_USERS.find((u) => u.id === id)?.firstName ?? id,
  );

  // Summary table calculations
  // For each hirer, count their total approvals across all this vendor's venues
  const hirerApprovalCounts = uniqueHirerIds.map((hirerId) => {
    const hirer = DEFAULT_USERS.find((u) => u.id === hirerId);
    const approvals = vendorApplications.filter(
      (a) => a.hirerId === hirerId && a.status === "Approved",
    ).length;
    return { name: `${hirer?.firstName ?? ""} ${hirer?.lastName ?? ""}`.trim(), approvals };
  });

  // Sort by approvals descending to find most/least
  const sorted = [...hirerApprovalCounts].sort((a, b) => b.approvals - a.approvals);

  // Most chosen = highest approvals (> 0)
  const mostChosen = sorted.filter((h) => h.approvals > 0)[0] ?? null;

  // Least chosen = lowest approvals but still has at least 1 approval
  const approvedHirers = sorted.filter((h) => h.approvals > 0);
  const leastChosen = approvedHirers.length > 1 ? approvedHirers[approvedHirers.length - 1] : null;

  // Not selected = 0 approvals (applied but never approved)
  const notSelected = hirerApprovalCounts.filter((h) => h.approvals === 0);

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

      {/* Dashboard title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          My Reports
        </Text>
        <Text fontSize="sm" color="gray.500">
          Visual Overview of hirer activity across your venues -
        </Text>
        <Text fontSize="sm" color="gray.500">
          {" "}
          See the most chosen applicant, least chosen and those who were not selected
        </Text>
        <Text fontSize="md" color="brand.primary" mt={4} mb={8} fontWeight="bold" align={"center"}>
          Tip: Hover over bars to view further venue details
        </Text>
      </Box>

      <Box p={2} mb={8} justifyItems={"center"}>
        <Graph data={chartData} hirerNames={hirerNames} venueNames={venueNames} />
      </Box>

      {/* Summary table */}
      <Box mt={4} mb={8}>
        <Text fontSize="xl" fontWeight="bold" mb={1}>
          Applicant Selection Summary
        </Text>
        <Text fontSize="sm" color="gray.500" mb={4}>
          A breakdown of most chosen, least chosen, and applicants who have not been selected
        </Text>

        <Table variant="simple" border="1px solid" borderColor="gray.200" borderRadius="md">
          <Thead bg="brand.primary">
            <Tr>
              <Th color="white">Category</Th>
              <Th color="white">Applicant</Th>
              <Th color="white">Total Approvals</Th>
              <Th color="white">Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Most chosen */}
            <Tr>
              <Td fontWeight="bold" color="brand.primary">
                i. Most Chosen
              </Td>
              <Td>{mostChosen ? mostChosen.name : "N/A"}</Td>
              <Td>{mostChosen ? mostChosen.approvals : "-"}</Td>
              <Td>{mostChosen && <Badge colorScheme="green">Most Selected</Badge>}</Td>
            </Tr>

            {/* Least chosen */}
            <Tr>
              <Td fontWeight="bold" color="brand.primary">
                ii. Least Chosen
              </Td>
              <Td>{leastChosen ? leastChosen.name : mostChosen ? mostChosen.name : "N/A"}</Td>
              <Td>
                {leastChosen ? leastChosen.approvals : mostChosen ? mostChosen.approvals : "-"}
              </Td>
              <Td>
                {(leastChosen || mostChosen) && <Badge colorScheme="orange">Least Selected</Badge>}
              </Td>
            </Tr>

            {/* Not selected - one row per hirer with 0 approvals */}
            {notSelected.length === 0 ? (
              <Tr>
                <Td fontWeight="bold" color="brand.primary">
                  iii. Not Selected
                </Td>
                <Td colSpan={3} color="gray.500">
                  All applicants have been approved at least once
                </Td>
              </Tr>
            ) : (
              notSelected.map((hirer, index) => (
                <Tr key={hirer.name}>
                  <Td fontWeight="bold" color="brand.primary">
                    {index === 0 ? "iii. Not Selected" : ""}
                  </Td>
                  <Td>{hirer.name}</Td>
                  <Td>0</Td>
                  <Td>
                    <Badge colorScheme="red">Never Selected</Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </VendorDashboardLayout>
  );
}
