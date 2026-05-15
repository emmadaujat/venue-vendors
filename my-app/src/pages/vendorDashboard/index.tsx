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
  Spinner,
} from "@chakra-ui/react";
import NextLink from "next/link";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { StarIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import type { Application, Venue, Booking, VendorComment } from "@/types";

export default function VendorDashboard() {
  const { user } = useAuth("vendor");

  const [applications, setApplications] = useState<Application[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // TODO: CRUD vendor comments
  const [vendorComments, setVendorComments] = useState<VendorComment[]>([]);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchVenues();
      fetchBookings();
      fetchComments();
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

  // async function that calls the backend API to get this vendor's venues
  const fetchVenues = async () => {
    try {
      // user!.id is the logged in vendor's ID — the ! tells TypeScript we know user is not null here
      // we pass it to getVendorsVenues which sends GET /api/{vendorID}/venues to the backend
      const data = await vendorApi.getVendorsVenues(user!.id);
      // store the returned array of venues in state so the page can display them
      setVenues(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching venues", error); //log any error
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await vendorApi.getVendorBookings(user!.id);
      setBookings(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching bookings", error); //log any error
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await vendorApi.getVendorComments(user!.id);
      setVendorComments(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching comments", error);
      setIsLoading(false);
    }
  };

  // ------------------------------------------------
  // ---------- Stat card calculations --------------
  // ------------------------------------------------

  // TODO: add endDate in application entity
  // Total Revenue Calculations
  const totalRevenue = bookings
    .filter((booking) => booking.status === "Completed")
    .reduce((sum, booking) => sum + (booking.application.venue.pricePerDay ?? 0), 0);

  // Upcoming bookings
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.application.eventDate) > new Date())
    .sort(
      (booking, application) =>
        new Date(booking.application.eventDate).getTime() -
        new Date(application.application.eventDate).getTime(),
    );

  // Next upcoming booking date for display under the stat card
  const nextBookingDate = upcomingBookings[0]?.application.eventDate
    ? new Date(upcomingBookings[0].application.eventDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
      })
    : "None";

  // Get avg rating
  const avgRating =
    bookings.length > 0
      ? bookings.reduce((acc, curr) => acc + curr.vendorRating, 0) / bookings.length
      : 0;

  {
    /*TODO: update getting data from database*/
  }
  // Approved applications with all display data pre-calculated
  // const approvedApplicationsWithDetails = applications
  //   .filter((a) => vendorVenueIds.includes(a.venueId) && a.status === "Approved")
  //   .map((a) => ({
  //     ...a,
  //     hirer: DEFAULT_USERS.find((u) => u.id === a.hirerId),
  //     venue: vendorVenues.find((v) => v.id === a.venueId),
  //     // check localStorage comment first, fall back to dummyData comment
  //     commentText:
  //       vendorComments[a.hirerId] ??
  //       DEFAULT_VENDOR_COMMENTS.find((c) => c.hirerId === a.hirerId && c.vendorId === user?.id)
  //         ?.commentText,
  //   }));

  // Helper to render star icons based on rating
  function renderStars(rating: number) {
    return Array.from({ length: rating }).map((_, i) => (
      <StarIcon key={i} color="yellow.400" boxSize={3} />
    ));
  }

  // Helper to get badge colour based on application status
  function getStatusColor(status: string) {
    if (status === "approved") return "green";
    if (status === "declined") return "red";
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

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

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
            {bookings.length}
          </Text>
        </Box>

        {/* Venues Listed */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} flex="1">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Venues Listed
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {venues.length}
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
              {avgRating}
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
            Total: {bookings.length}
          </Text>
        </Flex>

        <Table size="md">
          <Thead>
            <Tr>
              <Th>Hirer</Th>
              <Th>Venue</Th>
              <Th>Event Name</Th>
              <Th>Date</Th>
              <Th>Rating from Hirer</Th>
            </Tr>
          </Thead>
          <Tbody fontSize={"sm"}>
            {bookings.map((booking) => {
              return (
                <Tr key={booking.bookingID}>
                  {/* if no comments  */}
                  {bookings.length === 0 && (
                    <Td colSpan={5} textAlign="center" color="gray.400">
                      No bookings yet
                    </Td>
                  )}

                  <Td>
                    {booking.application.hirer.firstName} {booking.application.hirer.lastName}
                  </Td>
                  <Td>{booking.application.venue.name}</Td>
                  <Td>{booking.application.eventName}</Td>
                  <Td>
                    {new Date(booking.application.eventDate).toLocaleDateString("en-AU", {
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
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Applicant</Th>
              <Th>Venue</Th>
              <Th>Event Type</Th>
              <Th>Date</Th>
              <Th>Guests</Th>
              <Th>Reputation</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody fontSize={"sm"}>
            {applications.slice(0, 4).map((app) => {
              return (
                <Tr key={app.applicationID}>
                  {/* if no applications  */}
                  {applications.length === 0 && (
                    <Td colSpan={5} textAlign="center" color="gray.400">
                      {" "}
                      No applications yet{" "}
                    </Td>
                  )}
                  <Td>
                    <Box>
                      <NextLink href={`/vendorDashboard/applications/${app.applicationID}`}>
                        <Text _hover={{ textDecoration: "underline" }} fontWeight="semibold">
                          {app.hirer.firstName} {app.hirer.lastName}
                        </Text>
                      </NextLink>
                    </Box>
                  </Td>
                  <Td>{app.venue.name}</Td>
                  <Td>{app.eventType}</Td>
                  <Td>
                    {new Date(app.eventDate).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>{app.guestCount}</Td>
                  <Td>
                    {/* TODO:
                    <Badge colorScheme={getReputationColor(app.reputationTags)}>
                      {getReputationLabel(app.reputationTags)}
                    </Badge> */}
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(app.status)}>{app.status}</Badge>
                  </Td>
                  <Td>
                    {/* Open application page and automatically open that application ID */}
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

          <Tbody fontSize={"sm"}>
            {/* Hirer profile comments table data */}
            {vendorComments.map((comment) => (
              <Tr key={comment.commentID}>
                {/* if no comments  */}
                {vendorComments.length === 0 && (
                  <Td colSpan={5} textAlign="center" color="gray.400">
                    No comments, accept an application to leave a comment
                  </Td>
                )}
                {/* Hirer name as link to application details */}
                <Td>
                  <NextLink
                    href={`/vendorDashboard/hirerProfiles/${comment.booking.application.hirer.userID}`}
                  >
                    <Text
                      color="brand.primary"
                      fontWeight="semibold"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {comment.booking.application.hirer.firstName}{" "}
                      {comment.booking.application.hirer.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {comment.booking.application.hirer.email}
                    </Text>
                  </NextLink>
                </Td>

                {/* Event name */}
                <Td maxW={"200px"}>
                  <Text fontSize="sm">{comment.booking.application.eventName}</Text>
                </Td>

                {/* Venue location */}
                <Td maxW={"250px"}>
                  <Text fontSize="sm">{comment.booking.application.venue.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {comment.booking.application.venue.location}
                  </Text>
                </Td>

                {/* Existing comment if there is one */}
                <Td maxWidth={"400px"}>
                  {comment.commentText ? (
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {comment.commentText}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      No comment yet
                    </Text>
                  )}
                </Td>

                <Td>
                  {/* to edit/add comment, direct to application page */}
                  <NextLink
                    href={`/vendorDashboard/applications/${comment.booking.application.applicationID}`}
                  >
                    <Text
                      color="brand.primary"
                      fontSize="sm"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {/* if no comment has been added, show add comment, else show edit comment */}
                      {comment.commentText ? "Edit comment →" : "Add comment →"}
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
