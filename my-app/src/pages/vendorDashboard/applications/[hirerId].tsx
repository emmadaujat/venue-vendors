import {
  DEFAULT_APPLICATIONS,
  DEFAULT_VENUES,
  DEFAULT_USERS,
  Application,
  DEFAULT_VENDOR_COMMENTS,
} from "../../../dummyData";
import {
  Text,
  Flex,
  Box,
  Button,
  Badge,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { StarIcon, CheckIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Textarea } from "@chakra-ui/react";
import { getAllApplications } from "@/getApplications";

// Hardcoded reputation scores per hirer (consistent with applications page)
const HIRER_REPUTATION_SCORES: Record<string, number> = {
  "1": 4.5, // Taylor Swift
  "2": 4.2, // Beyonce
  "3": 3.8, // Ariana Grande
};

export default function ApplicationReview() {
  const router = useRouter();
  const { hirerId } = router.query;
  const { user } = useAuth("vendor");

  // Action state - tracks whether vendor is accepting or declining application
  const [pendingAction, setPendingAction] = useState<"Approved" | "Declined" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Application state - starts from dummyData but can be
  // overridden by localStorage if vendor has already actioned application
  const [application, setApplication] = useState<Application | null>(null);
  const [permitFileName, setPermitFileName] = useState<string>("");
  const [permitFile, setPermitFile] = useState<{ fileName: string; data: string } | null>(null);

  // Vendor comment state - loads from localStorage first
  const [vendorComment, setVendorComment] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  // Vendor comment state - check if comment is being edited
  const [isEditingComment, setIsEditingComment] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  {
    /*TODO: RETRIEVE applications from database*/
  }
  // On load - find the application, check localStorage for
  // any previously saved status updates
  useEffect(() => {
    if (!hirerId) return;

    // Find application from dummyData + any new localStorage submissions
    const found = getAllApplications().find((a) => a.id === hirerId);
    if (!found) return;
    setApplication(found);

    // display event permit
    const savedPermit = localStorage.getItem("appDoc_permit");
    if (savedPermit) {
      const parsed = JSON.parse(savedPermit);
      setPermitFileName(parsed.fileName);
      setPermitFile(parsed);
    }
  }, [hirerId]);

  {
    /*TODO: RETRIEVE comments from database*/
  }
  // Load existing comment from localStorage on mount
  useEffect(() => {
    if (!hirerId || !application) return;
    const savedComments = localStorage.getItem("vendorComments");
    if (savedComments) {
      const parsed = JSON.parse(savedComments);
      if (parsed[application.hirerId as string]) {
        setVendorComment(parsed[application.hirerId]);
        return; // stop if new comment found in local storage
      }
    }

    // Fall back to dummyData if no localStorage comment exists
    const existingComment = DEFAULT_VENDOR_COMMENTS.find(
      (c) => c.hirerId === application.hirerId && c.vendorId === user?.id,
    );
    if (existingComment) {
      setVendorComment(existingComment.commentText);
    }
  }, [hirerId, user?.id, application]);

  if (!application) {
    return (
      <VendorDashboardLayout>
        <Text>Application not found.</Text>
      </VendorDashboardLayout>
    );
  }

  const reputation = getReputationBadge(application.hirerId);

  {
    /*TODO: update- getting data from database*/
  }
  // Cross reference helpers
  const hirer = DEFAULT_USERS.find((u) => u.id === application.hirerId);
  const venue = DEFAULT_VENUES.find((v) => v.id === application.venueId);
  const reputationScore = HIRER_REPUTATION_SCORES[application.hirerId];

  // Helper - reputation badge
  function getReputationBadge(hirerId: string) {
    const score = HIRER_REPUTATION_SCORES[hirerId];
    if (!score) return { label: "No rating", color: "gray" };
    if (score >= 4.3) return { label: "Verified", color: "green" };
    if (score >= 4.0) return { label: "Good standing", color: "blue" };
    return { label: "Unverified", color: "orange" };
  }

  // Helper to get badge colour based on application status
  function getStatusColor(status: string) {
    if (status === "Approved") return "green";
    if (status === "Declined") return "red";
    return "purple";
  }

  // Handle accept or decline button click
  // Opens confirmation dialog
  function handleActionClick(action: "Approved" | "Declined") {
    setPendingAction(action);
    onOpen();
  }

  {
    /*TODO: UPDATE saving application status to database*/
  }
  // Confirm the action - saves to localStorage and shows
  // success message, then redirects back to applications list
  function handleConfirm() {
    if (!pendingAction || !application) return;
    // Save updated status to localStorage
    const savedStatuses = localStorage.getItem("applicationStatuses");
    const parsed = savedStatuses ? JSON.parse(savedStatuses) : {};
    parsed[application.id] = pendingAction;
    localStorage.setItem("applicationStatuses", JSON.stringify(parsed));

    // Update local state
    setApplication({ ...application, status: pendingAction });
    setIsSuccess(true);

    // Show success message for 1 second then redirect
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 1000);
  }

  {
    /*TODO: CREATE- save comment for application in database*/
  }
  // Save comment to localStorage keyed by hirerId
  // Shows confirmation message for 1 second
  function handleSaveComment() {
    const savedComments = localStorage.getItem("vendorComments");
    const parsed = savedComments ? JSON.parse(savedComments) : {};
    parsed[application!.hirerId] = vendorComment;
    localStorage.setItem("vendorComments", JSON.stringify(parsed));
    setCommentSaved(true);
    setIsEditingComment(false);
    setTimeout(() => setCommentSaved(false), 1000);
  }

  {
    /*TODO: REMOVE comment from database*/
  }
  // Delete comment - clears from localStorage and resets state
  function handleDeleteComment() {
    const savedComments = localStorage.getItem("vendorComments");
    const parsed = savedComments ? JSON.parse(savedComments) : {};
    delete parsed[application!.hirerId];
    localStorage.setItem("vendorComments", JSON.stringify(parsed));
    setVendorComment("");
    setCommentSaved(false);
    setIsEditingComment(false);
  }

  return (
    <VendorDashboardLayout>
      {/* Back link */}
      <NextLink href="/vendorDashboard/applications">
        <Text
          color="brand.primary"
          fontSize="md"
          mb={4}
          cursor="pointer"
          fontWeight="semibold"
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to Applications
        </Text>
      </NextLink>

      {/* Page title */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            Application Review
          </Text>
          <Text fontSize="sm" color="gray.500">
            Review the full details before accepting or declining
          </Text>
        </Box>

        <Flex justify="space-between" gap={2}>
          <Badge
            colorScheme={getStatusColor(application.status)}
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
          >
            {application.status}
          </Badge>
          {application.status === "Approved" && <CheckIcon boxSize="8" color="green" />}
        </Flex>
      </Flex>

      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        {/* Left column - application details */}
        <Box flex="2">
          {/* Event details */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
              Event Details
            </Text>
            <Divider mb={4} />

            <Flex direction="column" gap={3}>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Event Name
                </Text>
                <Text fontWeight="semibold">{application.eventName}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Event Type
                </Text>
                <Text fontWeight="semibold">{application.eventType}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Event Date
                </Text>
                <Text fontWeight="semibold">
                  {new Date(application.eventDate).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Guest Count
                </Text>
                <Text fontWeight="semibold">{application.guestCount}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Venue Requested
                </Text>
                <Text fontWeight="semibold">{venue?.name ?? "Unknown"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Submitted
                </Text>
                <Text fontWeight="semibold">
                  {new Date(application.submittedAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Flex>
              {/* Download event permit */}
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Event Permit
                </Text>
                {permitFileName ? (
                  <Flex align="center" gap={2}>
                    <CheckCircleIcon color="green.500" boxSize={3} />
                    <Text fontSize="sm">{permitFile?.fileName}</Text>
                    <a href={permitFile?.data} download={permitFile?.fileName}>
                      <Text
                        fontSize="sm"
                        color="brand.primary"
                        fontWeight="semibold"
                        _hover={{ textDecoration: "underline" }}
                      >
                        Download
                      </Text>
                    </a>
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="gray.400">
                    Not uploaded
                  </Text>
                )}
              </Flex>
            </Flex>
          </Box>

          {/* Additional notes */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
              Additional Notes from Hirer
            </Text>
            <Divider mb={4} />
            <Text fontSize="sm" color="gray.700" lineHeight="tall">
              {application.additionalNotes ?? "No additional notes provided."}
            </Text>
          </Box>

          {/* Reputation tags */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
              Reputation Tags
            </Text>
            <Divider mb={4} />
            <Flex gap={2} wrap="wrap">
              {application.reputationTags.map((tag) => (
                <Badge key={tag} colorScheme="purple" px={3} py={1} borderRadius="full">
                  {tag}
                </Badge>
              ))}
            </Flex>
          </Box>
          {/* Vendor comment on hirer */}
          {/* Only show comment box if application has been approved */}
          {application.status === "Approved" && (
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={6}
              mt={6}
              bg="brand.secondary"
            >
              <Box p={4} borderRadius="md">
                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                  Comments on Hirer
                </Text>
                <Text fontSize="sm" color="brand.primary" fontWeight="semibold">
                  Add private notes or feedback about this hirer. These are saved to their profile.
                </Text>
              </Box>

              <Divider mb={2} borderColor="brand.primary" />

              {/* READ MODE - show comment as text with Edit button */}
              {!isEditingComment ? (
                <Box p={4}>
                  <Text fontSize="sm" color="brand.primary" lineHeight="tall" mb={4}>
                    {vendorComment || "No comment added yet."}
                  </Text>
                  <Button
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: "brand.secondary", color: "brand.primary" }}
                    onClick={() => setIsEditingComment(true)}
                  >
                    {vendorComment ? "Edit Comment" : "Add Comment"}
                  </Button>
                </Box>
              ) : (
                /* EDIT MODE - show textarea with Save and Cancel buttons */
                <Box>
                  <Textarea
                    placeholder="Write your notes about this hirer here..."
                    value={vendorComment}
                    onChange={(e) => setVendorComment(e.target.value)}
                    mb={3}
                    resize="vertical"
                    borderColor="gray.300"
                    color="brand.primary"
                    _focus={{ borderColor: "brand.primary" }}
                  />

                  {commentSaved && (
                    <Text fontSize="sm" color="green.500" mb={2}>
                      Comment saved successfully.
                    </Text>
                  )}

                  <Flex gap={3}>
                    <Button
                      bg="brand.primary"
                      color="white"
                      _hover={{ bg: "brand.secondary", color: "brand.primary" }}
                      onClick={handleSaveComment}
                    >
                      Save Comment
                    </Button>
                    <Button
                      variant="outline"
                      borderColor="gray.300"
                      onClick={() => setIsEditingComment(false)}
                    >
                      Cancel
                    </Button>
                    {vendorComment && (
                      <Button
                        variant="outline"
                        borderColor="red.400"
                        color="red.400"
                        _hover={{ bg: "red.50" }}
                        onClick={handleDeleteComment}
                      >
                        Delete Comment
                      </Button>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Right column - hirer details + actions */}
        <Box flex="1">
          {/* Hirer profile card */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
              Hirer Details
            </Text>
            <Divider mb={4} />

            <Flex direction="column" gap={3}>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Name
                </Text>
                <Text fontWeight="semibold">
                  {hirer?.firstName} {hirer?.lastName}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Email
                </Text>
                <Text fontWeight="semibold" fontSize="sm">
                  {hirer?.email}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Phone
                </Text>
                <Text fontWeight="semibold">{hirer?.phone}</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="gray.500" fontSize="sm">
                  Reputation
                </Text>
                <Badge colorScheme={reputation.color}>{reputation.label}</Badge>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="gray.500" fontSize="sm">
                  Reputation Score
                </Text>
                <Flex align="center" gap={1}>
                  {reputationScore ? (
                    <>
                      {Array.from({ length: Math.round(reputationScore) }).map((_, i) => (
                        <StarIcon key={i} color="yellow.400" boxSize={3} />
                      ))}
                      <Text fontSize="sm" ml={1}>
                        {reputationScore} / 5
                      </Text>
                    </>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      No rating
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Flex>

            {/* View full hirer profile link */}
            <Divider my={4} />
            <NextLink href={`/vendorDashboard/hirerProfiles/${application.hirerId}`}>
              <Text
                color="brand.primary"
                fontSize="md"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                View full hirer profile →
              </Text>
            </NextLink>
          </Box>

          {/* Accept / Decline actions - only show if still pending */}
          {application.status === "Pending" && (
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
              <Text fontWeight="bold" fontSize="lg" mb={4} color="brand.primary">
                Actions
              </Text>
              <Divider mb={4} />
              <Flex direction="column" gap={3}>
                <Button
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: "brand.secondary", color: "brand.primary" }}
                  onClick={() => handleActionClick("Approved")}
                >
                  Accept Application
                </Button>
                <Button
                  variant="outline"
                  borderColor="red.400"
                  color="red.400"
                  _hover={{ bg: "red.50" }}
                  onClick={() => handleActionClick("Declined")}
                >
                  Decline Application
                </Button>
              </Flex>
            </Box>
          )}

          {/* Show message if already actioned */}
          {application.status !== "Pending" && (
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} bg="gray.50">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                This application has already been {application.status.toLowerCase()}.
              </Text>
            </Box>
          )}
        </Box>
      </Flex>

      {/* Confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!isSuccess) {
            onClose();
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              {isSuccess
                ? "Success!"
                : pendingAction === "Approved"
                  ? "Accept Application"
                  : "Decline Application"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {isSuccess ? (
                <Text>
                  Application has been successfully{" "}
                  {pendingAction === "Approved" ? "accepted" : "declined"}
                </Text>
              ) : (
                <Text>
                  Are you sure you want to {pendingAction === "Approved" ? "accept" : "decline"}{" "}
                  this application from {hirer?.firstName} {hirer?.lastName}?
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              {!isSuccess && (
                <>
                  <Button
                    ref={cancelRef}
                    onClick={() => {
                      onClose();
                      setPendingAction(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    ml={3}
                    bg={pendingAction === "Approved" ? "brand.primary" : "red.400"}
                    color="white"
                    _hover={{
                      bg: pendingAction === "Approved" ? "brand.secondary" : "red.50",
                      color: pendingAction === "Approved" ? "brand.primary" : "red.400",
                    }}
                    onClick={handleConfirm}
                  >
                    {pendingAction === "Approved" ? "Accept" : "Decline"}
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VendorDashboardLayout>
  );
}
