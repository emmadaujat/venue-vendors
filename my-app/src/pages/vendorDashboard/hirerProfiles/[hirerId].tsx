import {
  Text,
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
  Avatar,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NextLink from "next/link";
import { StarIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { getPDFfromDB } from "@/pdfStorage";
import { useVendorApplications } from "@/hooks/vendor/useVendorApplications";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";
import { getReputationBadge, getHirerAvgRating } from "@/hirerRatingCalculation";
import { useVendorComments } from "@/hooks/vendor/useVendorComments";

// Hardcoded reputation scores per hirer
const HIRER_REPUTATION_SCORES: Record<string, number> = {
  "1": 4.5, // Taylor Swift
  "2": 4.2, // Beyonce
  "3": 3.8, // Ariana Grande
};

export default function HirerProfileDetail() {
  const router = useRouter();
  const { hirerId } = router.query;
  const { user } = useAuth("vendor");

  // Fetch from custom hooks
  const {
    applications,
    isLoading: applicationsLoading,
    fetchApplications,
  } = useVendorApplications();
  const { bookings } = useVendorBookings();
  const { vendorComments, isLoading: commentsLoading, fetchComments } = useVendorComments();

  // isLoading combines both loading states from custom hooks — page shows spinner until all are ready
  const isLoading = applicationsLoading || commentsLoading;

  // States
  const [vendorComment, setVendorComment] = useState<string>("");
  const [licenseFileName, setLicenseFileName] = useState<string>("");
  const [insuranceFileName, setInsuranceFileName] = useState<string>("");
  const [businessCertFileName, setBusinessCertFileName] = useState<string>("");
  const [isBusiness, setIsBusiness] = useState<boolean>(false);
  const [credibilityScore, setCredibilityScore] = useState<number>(0);

  const [licenseFile, setLicenseFile] = useState<{ fileName: string; data: string } | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<{ fileName: string; data: string } | null>(
    null,
  );
  const [businessCertFile, setBusinessCertFile] = useState<{
    fileName: string;
    data: string;
  } | null>(null);

  // On load - read comment and documents from localStorage
  // Documents are stored globally (not per hirer) by the hirer
  // when they fill out their application form
  useEffect(() => {
    if (!hirerId || !user?.id) return;

    {
      /*TODO: RETRIEVE comments from database*/
    }
    // Load vendor's comment for this hirer
    // Check localStorage first, fall back to dummyData
    const storedComments = localStorage.getItem("vendorComments");
    if (storedComments) {
      const parsed = JSON.parse(storedComments);
      if (parsed[hirerId as string]) {
        setVendorComment(parsed[hirerId as string]);
      } else {
        // Fall back to dummyData comment
        const dummyComment = DEFAULT_VENDOR_COMMENTS.find(
          (c) => c.hirerId === hirerId && c.vendorId === user.id,
        );
        if (dummyComment) setVendorComment(dummyComment.commentText);
      }
    } else {
      // No localStorage comments at all - use dummyData
      const dummyComment = DEFAULT_VENDOR_COMMENTS.find(
        (c) => c.hirerId === hirerId && c.vendorId === user.id,
      );
      if (dummyComment) setVendorComment(dummyComment.commentText);
    }

    {
      /*TODO: RETRIEVE docs from database*/
    }
    // Load compliance documents from localStorage (JPG) and IndexedDB (PDFs)
    const savedLicense = localStorage.getItem("complianceDoc_license");
    if (savedLicense) {
      const parsed = JSON.parse(savedLicense);
      setLicenseFileName(parsed.fileName);
      setLicenseFile(parsed);
    }

    // Insurance PDF is stored in IndexedDB
    getPDFfromDB("complianceDoc_insurance").then((saved) => {
      if (saved) {
        setInsuranceFileName(saved.fileName);
        setInsuranceFile(saved);
      }
    });

    // Business cert PDF is stored in IndexedDB
    getPDFfromDB("complianceDoc_businessCert").then((saved) => {
      if (saved) {
        setBusinessCertFileName(saved.fileName);
        setBusinessCertFile(saved);
      }
    });

    {
      /*TODO: update getting doc from database*/
    }
    const savedIsBusiness = localStorage.getItem("complianceDoc_isBusiness");
    if (savedIsBusiness === "true") setIsBusiness(true);

    // Credibility score saved as percentage on application submit
    const savedCredibility = localStorage.getItem("credibilityScore");
    if (savedCredibility) setCredibilityScore(Number(savedCredibility));
  }, [hirerId, user?.id]);

  {
    /*TODO: RETRIEVE hirer from database*/
  }
  // Find the hirer from dummyData
  const hirer = DEFAULT_USERS.find((u) => u.id === hirerId);

  {
    /*TODO: RETRIEVE getting hirer from database*/
  }
  // Hirer's full booking history across ALL venues
  const hirerBookings = DEFAULT_BOOKINGS.filter((b) => b.hirerId === hirerId);

  {
    /*TODO: update getting data from database*/
  }
  // Totals row calculations for the booking history table
  const totalEvents = hirerBookings.length;
  const uniqueVenueCount = [...new Set(hirerBookings.map((b) => b.venueId))].length;
  const ratedBookings = hirerBookings.filter((b) => b.vendorRating > 0);
  const avgRating =
    ratedBookings.length > 0
      ? (ratedBookings.reduce((sum, b) => sum + b.vendorRating, 0) / ratedBookings.length).toFixed(
          1,
        )
      : "N/A";

  // Reputation score and badge for this hirer
  const reputationScore = HIRER_REPUTATION_SCORES[hirerId as string];
  const reputationBadge = !reputationScore
    ? { label: "No rating", color: "gray" }
    : reputationScore >= 4.3
      ? { label: "Verified", color: "green" }
      : reputationScore >= 4.0
        ? { label: "Good standing", color: "blue" }
        : { label: "Unverified", color: "orange" };

  {
    /*TODO: update getting applications from database*/
  }
  // Applications hirer has made to this vendor's venues
  const vendorVenueIds = DEFAULT_VENUES.filter((v) => v.vendorId === user?.id).map((v) => v.id);
  const hirerApplicationToThisVendor = DEFAULT_APPLICATIONS.find(
    (a) => a.hirerId === hirerId && vendorVenueIds.includes(a.venueId),
  );

  // Helper - render star icons from a numeric rating
  function renderStars(rating: number) {
    return Array.from({ length: rating }).map((_, i) => (
      <StarIcon key={i} color="yellow.400" boxSize={3} />
    ));
  }

  // Helper - document row: shows filename or "Not uploaded"
  function DocumentRow({
    label,
    fileName,
    file,
  }: {
    label: string;
    fileName: string;
    file: { fileName: string; data: string } | null;
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
              {file && (
                <a href={file.data} download={file.fileName}>
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

  // Guard - if hirer not found
  if (!hirer) {
    return (
      <VendorDashboardLayout>
        <Text>Hirer not found.</Text>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      {/* Back link */}
      <NextLink href="/vendorDashboard/hirerProfiles">
        <Text
          color="brand.primary"
          fontSize="sm"
          mb={4}
          fontWeight="semibold"
          cursor="pointer"
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
                {hirer.phone}
              </Text>
            </Box>
            <Badge colorScheme={reputationBadge.color} ml="auto">
              {reputationBadge.label}
            </Badge>
          </Flex>
          <Divider mb={8} />

          {/* --- Hirer Summary Stats--- */}
          <Flex gap={8}>
            <Box>
              <Text fontSize="md" color="gray.500">
                Reputation Score
              </Text>
              {reputationScore ? (
                <Flex align="center" gap={1} mt={1}>
                  {renderStars(Math.round(reputationScore))}
                  <Text fontSize="md" ml={1}>
                    {reputationScore} / 5
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

          <DocumentRow
            label="Driver's License (JPG)"
            fileName={licenseFileName}
            file={licenseFile}
          />
          <Divider />
          <DocumentRow
            label="Public Liability Insurance (PDF)"
            fileName={insuranceFileName}
            file={insuranceFile}
          />
          <Divider />

          {/* Business cert only shows if hirer is applying as a business */}
          {isBusiness && (
            <>
              <Divider />
              <DocumentRow
                label="Certificate of Business Registration (PDF)"
                fileName={businessCertFileName}
                file={businessCertFile}
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
            All bookings across all venues, not just this vendor's
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
                <Tr key={booking.id}>
                  {/* Vemue Name row */}
                  <Td>
                    <Text fontSize="sm" fontWeight="semibold">
                      {booking.venueName}
                    </Text>
                  </Td>

                  {/* Vemue Location row */}
                  <Td>
                    <Text fontSize="sm" color="gray.500">
                      {booking.venueLocation}
                    </Text>
                  </Td>

                  {/* Event Name row */}
                  <Td>
                    <Text fontSize="sm">{booking.eventName}</Text>
                  </Td>

                  {/* Date of event row */}
                  <Td minW="200px">
                    <Text fontSize="sm">
                      {new Date(booking.eventDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </Td>

                  {/* Rating row */}
                  <Td minW="200px">
                    <Flex align="center" gap={1}>
                      {booking.vendorRating > 0 ? (
                        <>
                          {renderStars(booking.vendorRating)}
                          <Text fontSize="sm" ml={1}>
                            {booking.vendorRating} / 5
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
        {vendorComment ? (
          <Text fontSize="sm" color="gray.700" lineHeight="tall" mb={4}>
            {vendorComment}
          </Text>
        ) : (
          <Text fontSize="sm" color="gray.400" mb={4}>
            No notes added yet.
          </Text>
        )}

        {/* Edit/Add comment links to the application review page  */}
        {hirerApplicationToThisVendor && (
          <NextLink href={`/vendorDashboard/applications/${hirerApplicationToThisVendor.id}`}>
            <Button
              size="sm"
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: "brand.secondary" }}
            >
              {vendorComment ? "Edit notes →" : "Add notes →"}
            </Button>
          </NextLink>
        )}
      </Box>
    </VendorDashboardLayout>
  );
}
