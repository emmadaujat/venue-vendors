import {
  DEFAULT_USERS,
  DEFAULT_BOOKINGS,
  DEFAULT_APPLICATIONS,
  DEFAULT_VENDOR_COMMENTS,
  DEFAULT_VENUES,
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
  Divider,
} from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { StarIcon } from "@chakra-ui/icons";
import { getVendorStats } from "@/ratingCalculation";
import { useState, useEffect } from "react";
import { getAllApplications } from "@/getApplications";

export default function VendorDashboard() {
  const { user, isLoggedIn } = useAuth("vendor");

  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);
  const [vendorComments, setVendorComments] = useState<Record<string, string>>({});

  // Helper - check local storage and dummy data for status and comment updates
  useEffect(() => {
    if (!user?.id) return;
    // Load all applications from dummyData + localStorage (new submissions + status updates)
    setApplications(getAllApplications());
    //  Vendor comments - stored as { hirerId: commentText }
    const storedComments = localStorage.getItem("vendorComments");
    if (storedComments) {
      setVendorComments(JSON.parse(storedComments));
    }
  }, [user?.id]);

  {
    /*TODO: update getting venues from database*/
  }
  // Filter data to only show this vendor's data
  const vendorVenues = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id);
  const vendorVenueIds = vendorVenues.map((v) => v.id);
  const vendorBookings = DEFAULT_BOOKINGS.filter((b) => vendorVenueIds.includes(b.venueId));

  // Stat card calculations

  {
    /*TODO: update getting data from database*/
  }
  // Total Revenue Calculations
  const totalRevenue = vendorBookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, booking) => {
      const venue = vendorVenues.find((v) => v.id === booking.venueId);
      return sum + (venue?.pricePerDay ?? 0);
    }, 0);

  {
    /*TODO: update getting data from database*/
  }
  // Upcoming bookings
  const upcomingBookings = vendorBookings
    .filter((b) => new Date(b.eventDate) > new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  {
    /*TODO: update getting data from database*/
  }
  // Next upcoming booking date for display under the stat card
  const nextBookingDate = upcomingBookings[0]?.eventDate
    ? new Date(upcomingBookings[0].eventDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
      })
    : "None";

  {
    /*TODO: update getting avg rating from database*/
  }
  // Get avg rating
  const stats = getVendorStats(user?.id ?? "");

  {
    /*TODO: update getting vendors applications from database*/
  }
  // Recent applications - last 4 for this vendor's venues
  const recentApplications = applications
    .filter((a) => vendorVenueIds.includes(a.venueId))
    .slice(0, 4);

  {
    /*TODO: update getting data from database*/
  }
  // Approved applications with all display data pre-calculated
  const approvedApplicationsWithDetails = applications
    .filter((a) => vendorVenueIds.includes(a.venueId) && a.status === "Approved")
    .map((a) => ({
      ...a,
      hirer: DEFAULT_USERS.find((u) => u.id === a.hirerId),
      venue: vendorVenues.find((v) => v.id === a.venueId),
      // check localStorage comment first, fall back to dummyData comment
      commentText:
        vendorComments[a.hirerId] ??
        DEFAULT_VENDOR_COMMENTS.find((c) => c.hirerId === a.hirerId && c.vendorId === user?.id)
          ?.commentText,
    }));

  // Helper to render star icons based on rating
  function renderStars(rating: number) {
    return Array.from({ length: rating }).map((_, i) => (
      <StarIcon key={i} color="yellow.400" boxSize={3} />
    ));
  }

  // Helper to get badge colour based on application status
  function getStatusColor(status: string) {
    if (status === "Approved") return "green";
    if (status === "Declined") return "red";
    return "purple";
  }

  // Helper to get badge colour based on reputation tags
  function getReputationColor(tags: string[]) {
    if (tags.includes("Timely payer") && tags.includes("Good communicator")) return "green";
    if (tags.length >= 2) return "blue";
    return "orange";
  }

  function getReputationLabel(tags: string[]) {
    if (tags.includes("Timely payer") && tags.includes("Good communicator")) return "Verified";
    if (tags.length >= 2) return "Good standing";
    return "Unverified";
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
            <Text fontSize="small" color="brand.primary" fontWeight="regular">
              This is a {user?.role} account
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
          My Dashboard
        </Text>
        <Text fontSize="sm" color="gray.500">
          Account Overview
        </Text>
      </Box>

      {/* Stats row */}
      <Flex gap={4} mb={8}>
        {/* Total Bookings */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total Bookings
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {vendorBookings.length}
          </Text>
        </Box>

        {/* Venues Listed */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Venues Listed
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {vendorVenues.length}
          </Text>
          <NextLink href="/vendorDashboard/myVenues">
            <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
              View all →
            </Text>
          </NextLink>
        </Box>

        {/* Avg Rating */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Avg Rating
          </Text>
          <Flex align="center" gap={2}>
            <StarIcon color="yellow.400" />
            <Text fontSize="2xl" fontWeight="bold">
              {stats.avgRating}
            </Text>
          </Flex>
        </Box>

        {/* Upcoming Bookings */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Upcoming Bookings
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {upcomingBookings.length}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Next: {nextBookingDate}
          </Text>
        </Box>

        {/* Revenue  */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Revenue (Total)
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            ${totalRevenue.toLocaleString()}
          </Text>
        </Box>
      </Flex>

      {/* Booking history table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            Your Booking History
          </Text>
          <Text color="white" fontSize="md">
            Total: {vendorBookings.length}
          </Text>
        </Flex>

        <Table>
          <Thead>
            <Tr>
              <Th>Event Name</Th>
              <Th>Hirer</Th>
              <Th>Date</Th>
              <Th>Rating from Hirer</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vendorBookings.map((booking) => {
              const hirer = DEFAULT_USERS.find((u) => u.id === booking.hirerId);
              return (
                <Tr key={booking.id}>
                  <Td>{booking.eventName}</Td>
                  <Td>
                    {hirer?.firstName} {hirer?.lastName}
                  </Td>
                  <Td>
                    {new Date(booking.eventDate).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>
                    <Flex align="center" gap={2}>
                      {booking.vendorRating > 0 ? (
                        <>
                          {renderStars(booking.vendorRating)}
                          <Text fontSize="sm">{booking.vendorRating} / 5</Text>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          Not yet rated
                        </Text>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Recent applications table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            Recent Applications
          </Text>
          <NextLink href="/vendorDashboard/applications">
            <Text color="white" fontSize="md" _hover={{ textDecoration: "underline" }}>
              View all →
            </Text>
          </NextLink>
        </Flex>
        <Table>
          <Thead>
            <Tr>
              <Th>Applicant</Th>
              <Th>Event Type</Th>
              <Th>Date</Th>
              <Th>Guests</Th>
              <Th>Reputation</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {recentApplications.map((app) => {
              const hirer = DEFAULT_USERS.find((u) => u.id === app.hirerId);
              return (
                <Tr key={app.id}>
                  <Td>
                    <Box>
                      <NextLink href={`/vendorDashboard/applications/${app.id}`}>
                        <Text _hover={{ textDecoration: "underline" }} fontWeight="semibold">
                          {hirer?.firstName} {hirer?.lastName}
                        </Text>
                      </NextLink>
                    </Box>
                  </Td>
                  <Td>{app.eventType}</Td>
                  <Td>
                    {new Date(app.eventDate).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>{app.guestCount}</Td>
                  <Td>
                    <Badge colorScheme={getReputationColor(app.reputationTags)}>
                      {getReputationLabel(app.reputationTags)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(app.status)}>{app.status}</Badge>
                  </Td>
                  <Td>
                    {/* Open application page and automatically open that application ID */}
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

      {/* Hirer profile comments */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8}>
        <Flex
          p={4}
          justify="space-between"
          align="center"
          bg="brand.secondary"
          borderTopRadius="md"
        >
          {/* Hirer profile comments header */}
          <Text color="brand.primary" fontWeight="semibold">
            Hirer Profile Comments
          </Text>
          <NextLink href="/vendorDashboard/hirerProfiles">
            <Text color="brand.primary" fontSize="md" _hover={{ textDecoration: "underline" }}>
              View all →
            </Text>
          </NextLink>
        </Flex>

        <Divider />
        <Table>
          <Thead>
            <Tr>
              <Th>Hirer</Th>
              <Th>Event Name</Th>
              <Th>Venue</Th>
              <Th>Comment</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Hirer profile comments table data */}
            {approvedApplicationsWithDetails.map((app) => (
              <Tr key={app.id}>
                {/* Hirer name as link to application details */}
                <Td>
                  <NextLink href={`/vendorDashboard/hirerProfiles/${app.hirerId}`}>
                    <Text
                      color="brand.primary"
                      fontWeight="semibold"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {app.hirer?.firstName} {app.hirer?.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {app.hirer?.email}
                    </Text>
                  </NextLink>
                </Td>

                {/* Event name */}
                <Td maxW={"200px"}>
                  <Text fontSize="sm">{app.eventName}</Text>
                </Td>

                {/* Venue location */}
                <Td maxW={"250px"}>
                  <Text fontSize="sm">{app.venue?.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {app.venue?.location}
                  </Text>
                </Td>

                {/* Existing comment if there is one */}
                <Td maxWidth={"400px"}>
                  {app.commentText ? (
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {app.commentText}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      No comment yet
                    </Text>
                  )}
                </Td>

                <Td>
                  {/* to edit/add comment, direct to application page */}
                  <NextLink href={`/vendorDashboard/applications/${app.id}`}>
                    <Text
                      color="brand.primary"
                      fontSize="sm"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {/* if no comment has been added, show add comment, else show edit comment */}
                      {app.commentText ? "Edit comment →" : "Add comment →"}
                    </Text>
                  </NextLink>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VendorDashboardLayout>
  );
}
