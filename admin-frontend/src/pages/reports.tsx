import { useState } from "react";
import { Box, Flex, Text, Button, Spinner, Table, Thead, Tbody, Tr, Th } from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";

export default function Reports() {
  const [isLoading, setIsLoading] = useState();

  //TODO: get data

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
          <Button bg="white" color="brand.primary">
            {/* TODO: button needs to refresh table */}
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
          <Tbody fontSize="sm">{/* TODO: GET 3 MOST POPULAR VENUES */}</Tbody>
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
          <Button bg="white" color="brand.primary">
            {/* TODO: button needs to refresh table */}
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
          <Tbody fontSize="sm">{/*TODO: GET 3 MOST ACTIVE APPLICANTS */}</Tbody>
        </Table>
      </Box>
    </AdminDashboardLayout>
  );
}
