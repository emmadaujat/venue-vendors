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
} from "@chakra-ui/react";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { Link } from "react-router-dom";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";

export default function Venues() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();
  const [searchText, setSearchText] = useState("");

  // pressing Enter in search bar searches the list of venues with the query
  // TODO: update search to search through venues in venues table
  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchText.trim() !== "") {
      navigate("/venues?search=" + encodeURIComponent(searchText.trim()));
    }
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
              onKeyDown={onSearchKeyDown}
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
            Manage Venues
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
              {/* TODO: get stats */}
              15
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
              {/* TODO: get stats */}6
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
            {/* TODO: get stats */}
            Total: 15
          </Text>
        </Flex>
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Venue Name</Th>
              <Th>Location</Th>
              <Th>Assigned Vendor</Th>
              <Th>Featured</Th> {/* TODO: WILL BE A TOGGLE */}
              <Th>Actions</Th> {/* TODO: ACTIONS WILL BE A BUTTON TO GO TO EDIT VENUEID */}
            </Tr>
          </Thead>
          <Tbody fontSize="sm">{/* TODO: GET 3 MOST RECENTLY ADDED VENUES */}</Tbody>
        </Table>
      </Box>
    </AdminDashboardLayout>
  );
}
