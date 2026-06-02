import { useState } from "react";
import { Box, Flex, Text, Button, Spinner, Table, Thead, Tbody, Tr, Th } from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { Link } from "react-router-dom";
import { StarIcon } from "@chakra-ui/icons";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState();

  // TODO: get data to display stats and tables

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
            15
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
            6
          </Text>
        </Box>

        {/* Total Hirers */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Hirers
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            4
          </Text>
        </Box>

        {/* Total Completed Bookings */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Bookings
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            10
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
              3.5
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
            </Tr>
          </Thead>
          <Tbody fontSize="sm">{/* GET 3 MOST RECENTLY ADDED VENUES */}</Tbody>
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
              <Th>Featured</Th>
              <Th>Avg Rating</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="sm">{/* GET 3 Highest rated vendors */}</Tbody>
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
          <Tbody fontSize="sm">{/* Get venues that are featured */}</Tbody>
        </Table>
      </Box>
    </AdminDashboardLayout>
  );
}
