import {
  Text,
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  Avatar,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import NextLink from "next/link";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { getReputationBadge, getHirerAvgRating } from "@/hirerRatingCalculation";
import { renderStars } from "@/helpersUtil";

// Import custom hooks
import { useVendorApplications } from "@/hooks/vendor/useVendorApplications";
import { useVendorComments } from "@/hooks/vendor/useVendorComments";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";
import { useHirerBookingHistory } from "@/hooks/vendor/useHirerBookingHistory";
import { useHirerCompliance } from "@/hooks/vendor/useHirerCompliance";

export default function HirerProfileDetail() {
  const router = useRouter();
  const { hirerId } = router.query;
  const { user } = useAuth("vendor");
  const hirerID = parseInt(hirerId as string);

  // Fetch from custom hooks
  const { applications, isLoading: applicationsLoading } = useVendorApplications();
  const { bookings, isLoading: bookingsLoading } = useVendorBookings();
  const { bookings: hirerBookings, isLoading: historyLoading } = useHirerBookingHistory(hirerID);
  const { vendorComments, isLoading: commentsLoading } = useVendorComments();
  const { documents, credibilityScore, isLoading: complianceLoading } = useHirerCompliance(hirerID);

  // isLoading combines both loading states from custom hooks — page shows spinner until all are ready
  const isLoading =
    applicationsLoading ||
    bookingsLoading ||
    commentsLoading ||
    historyLoading ||
    complianceLoading;

  // -------------------------------------------------------------------
  // ---------- FIND HIRER DETAILS FROM APPLICATIONS ---------------------
  // -------------------------------------------------------------------
  const hirer = applications.find((a) => a.hirer.userID === hirerID)?.hirer;

  // ------------------------------------------------------------------
  // ---------- FIND VENDOR COMMENTS FOR HIRERID ----------------
  // -------------------------------------------------------------------
  const hirerComments = vendorComments.filter(
    (c) => c.booking.application.hirer.userID === hirerID,
  );

  // Reputation
  const reputation = getReputationBadge(hirerID, bookings);

  // Hirer rating
  const avgRating = getHirerAvgRating(hirerID, bookings);

  // Hirer rating
  const totalEvents = hirerBookings.length;

  // unique venues
  const uniqueVenueCount = new Set(hirerBookings.map((b) => b.application.venue.name)).size;

  // Helper - document row: shows filename or "Not uploaded"
  function DocumentRow({
    label,
    fileName,
    fileURL,
  }: {
    label: string;
    fileName: string;
    fileURL?: string;
    // file: { fileName: string; data: string } | null;
  }) {
    return (
      <Flex justify="space-between" align="center" py={2}>
        <Text fontSize="sm" color="gray.600">
          {label}
        </Text>
        <Flex align="center" gap={2}>
          {fileName ? (
            <>
              <CheckCircleIcon color="green.500" boxSize={4} />
              <Text fontSize="sm" color="gray.700">
                {fileName}
              </Text>
              {fileURL && (
                <a href={fileURL} download={fileName}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="brand.primary"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Download
                  </Text>
                </a>
              )}
            </>
          ) : (
            <>
              <WarningIcon color="red.400" boxSize={4} />
              <Text fontSize="sm" color="red.400">
                Not uploaded
              </Text>
            </>
          )}
        </Flex>
      </Flex>
    );
  }

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

  // Guard - if hirer not found
  if (!hirer) {
    return (
      <VendorDashboardLayout>
        <Text>Hirer not found.</Text>
      </VendorDashboardLayout>
    );
  }

  // Find each compliance document type from the fetched documents
  const licenseDoc = documents.find((d) => d.documentType === "Drivers License");
  const insuranceDoc = documents.find((d) => d.documentType === "Public Liability Insurance");
  const bizCertDoc = documents.find((d) => d.documentType === "Business Registration Certificate");
  const isBusiness = documents.some((d) => d.isBusiness);

  return (
    <VendorDashboardLayout>
      {/* Back link */}
      <NextLink href="/vendorDashboard/hirerProfiles">
        <Text
          color="brand.primary"
          fontSize="md"
          mb={4}
          cursor="pointer"
          fontWeight="semibold"
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to Hirer Profiles
        </Text>
      </NextLink>

      {/* Page title */}
      <Box mb={6}>
        <Text fontWeight="bold" fontSize="xl">
          Hirer Profile
        </Text>
        <Text color="gray.500" fontSize="sm">
          Full hiring history, compliance documents and vendor notes
        </Text>
      </Box>

      <Flex gap={6} mb={6} align="flex-start">
        {/* Left column */}
        {/* --- Hirer Details Card --- */}
        <Box flex="2" border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
          <Text fontWeight="bold" fontSize="large" mb={4} color="brand.primary">
            Hirer Details
          </Text>
          <Divider mb={8} />

          {/*  Hirer Avatar  */}
          <Flex align="center" gap={4} mb={"20px"}>
            <Avatar
              name={`${hirer.firstName} ${hirer.lastName}`}
              bg="brand.secondary"
              color="brand.primary"
              size="lg"
            />
            <Box>
              {/* --- Hirer Contact Details--- */}
              <Text fontWeight="bold" fontSize="lg">
                {hirer.firstName} {hirer.lastName}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {hirer.email}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {hirer.phoneNumber}
              </Text>
            </Box>
            <Badge colorScheme={reputation.color} ml="auto">
              {reputation.label}
            </Badge>
          </Flex>
          <Divider mb={8} />

          {/* --- Hirer Summary Stats--- */}
          <Flex gap={8}>
            <Box>
              <Text fontSize="md" color="gray.500">
                Reputation Score
              </Text>
              {avgRating ? (
                <Flex align="center" gap={1} mt={1}>
                  {renderStars(Math.round(avgRating))}
                  <Text fontSize="md" ml={1}>
                    {avgRating} / 5
                  </Text>
                </Flex>
              ) : (
                <Text fontSize="md" color="gray.400">
                  No rating
                </Text>
              )}
            </Box>
            <Box>
              <Text fontSize="md" color="gray.500">
                Credibility Score
              </Text>
              <Text fontSize="md" fontWeight="semibold" mt={1}>
                {credibilityScore}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="md" color="gray.500">
                Total Bookings
              </Text>
              <Text fontSize="md" fontWeight="semibold" mt={1}>
                {totalEvents}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Right column */}
        {/* Compliance documents */}
        <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
          <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
            Compliance Documents
          </Text>
          <Divider mb={4} />
          <Text fontSize="xs" color="gray.400" mb={3}>
            Documents uploaded by the hirer during their application
          </Text>

          <Text fontSize="sm" color="gray.400">
            Compliance documents coming soon.
          </Text>

          <DocumentRow
            label="Driver's License (JPG)"
            fileName={licenseDoc?.fileName ?? ""}
            fileURL={licenseDoc?.fileURL}
          />
          <Divider />
          <DocumentRow
            label="Public Liability Insurance (PDF)"
            fileName={insuranceDoc?.fileName ?? ""}
            fileURL={insuranceDoc?.fileURL}
          />
          <Divider />

          {/* Business cert only shows if hirer is applying as a business */}
          {isBusiness && (
            <>
              <Divider />
              <DocumentRow
                label="Certificate of Business Registration (PDF)"
                fileName={bizCertDoc?.fileName ?? ""}
                fileURL={bizCertDoc?.fileURL}
              />
            </>
          )}

          <Divider mt={2} mb={3} />

          {/* Credibility score calculated */}
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.500">
              Credibility Score
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {credibilityScore}%
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Booking history table */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={6}>
        <Box bg="brand.primary" p={4} borderTopRadius="md">
          <Text color="white" fontWeight="semibold">
            Historical Hire List
          </Text>
          <Text color="white" fontSize="xs" fontWeight={"regular"}>
            All bookings across all venues
          </Text>
        </Box>

        {/* If there are no past hirer details to see */}
        {hirerBookings.length === 0 ? (
          <Box p={6}>
            <Text fontSize="sm" color="gray.400">
              No past hiring history available.
            </Text>
          </Box>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Venue Name</Th>
                <Th>Location</Th>
                <Th>Event Name</Th>
                <Th>Date</Th>
                <Th>Rating</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* Booking rows */}
              {hirerBookings.map((booking) => (
                <Tr key={booking.bookingID}>
                  {/* Vemue Name row */}
                  <Td>
                    <Text fontSize="sm" fontWeight="semibold">
                      {booking.application.venue.name ?? "Venue Deleted"}
                    </Text>
                  </Td>

                  {/* Vemue Location row */}
                  <Td>
                    <Text fontSize="sm" color="gray.500">
                      {booking.application.venue.location ?? "-"}
                    </Text>
                  </Td>

                  {/* Event Name row */}
                  <Td>
                    <Text fontSize="sm">{booking.application.eventName}</Text>
                  </Td>

                  {/* Date of event row */}
                  <Td minW="200px">
                    <Text fontSize="sm">
                      {new Date(booking.application.eventDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </Td>

                  {/* Rating row */}
                  <Td minW="200px">
                    <Flex align="center" gap={1}>
                      {booking.hirerReputationRating > 0 ? (
                        <>
                          {renderStars(booking.hirerReputationRating)}
                          <Text fontSize="sm" ml={1}>
                            {booking.hirerReputationRating} / 5
                          </Text>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          Not yet rated
                        </Text>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme={booking.status === "Completed" ? "green" : "purple"}>
                      {booking.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}

              {/* Totals row  */}
              <Tr bg="brand.secondary">
                <Td colSpan={2}>
                  <Text fontSize="md" fontWeight="bold" color="brand.primary">
                    Totals
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="md" fontWeight="semibold" color="brand.primary">
                    {totalEvents} events
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="md" fontWeight="semibold" color="brand.primary">
                    {uniqueVenueCount} venues
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="md" fontWeight="semibold" color="brand.primary">
                    Avg: {avgRating} / 5
                  </Text>
                </Td>
                <Td />
              </Tr>
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Vendor comment */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
        <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
          Your Notes on This Hirer
        </Text>
        <Divider mb={4} />

        {/* Display comment */}
        {hirerComments.length === 0 ? (
          <Text fontSize="sm" color="gray.400" mb={4}>
            No notes added yet. Notes can be added from an approved application
          </Text>
        ) : (
          hirerComments.map((comment) => (
            <Box
              key={comment.commentID}
              mb={4}
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              {/* Which application this comment is linked to */}
              <Text fontSize="sm" color="gray.400" mb={2}>
                {comment.booking.application.eventName} — {comment.booking.application.venue.name}
              </Text>

              {/* Comment text */}
              <Text fontSize="sm" color="gray.700" lineHeight="tall" mb={4}>
                {comment.commentText}
              </Text>

              {/* Edit/Add comment links to the application review page  */}
              <NextLink
                href={`/vendorDashboard/applications/${comment.booking.application.applicationID}`}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.primary"
                  mt={2}
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  {comment.commentText ? "Edit notes →" : "Add notes →"}
                </Text>
              </NextLink>
            </Box>
          ))
        )}
      </Box>
    </VendorDashboardLayout>
  );
}
