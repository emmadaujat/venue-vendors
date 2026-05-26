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
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import NextLink from "next/link";
import { CheckIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Textarea } from "@chakra-ui/react";
import { getHirerAvgRating, getReputationBadge } from "@/hirerRatingCalculation";
import { getStatusColor, renderStars } from "@/helpersUtil";
import { vendorApi } from "@/services/vendorApi";

// Import custom hooks
import { useVendorApplications } from "@/hooks/vendor/useVendorApplications";
import { useVendorComments } from "@/hooks/vendor/useVendorComments";
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";

export default function ApplicationReview() {
  const router = useRouter();
  const { user } = useAuth("vendor");

  // get applicationID from URL
  const { applicationID } = router.query;

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

  // for pop up confirmations
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Action state - tracks whether vendor is accepting or declining application
  const [pendingAction, setPendingAction] = useState<"Approved" | "Declined" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // application action pop up confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [permitFileName, setPermitFileName] = useState<string>("");
  const [permitFile, setPermitFile] = useState<{ fileName: string; data: string } | null>(null);

  // Action state - tracks if commented is being added or edited
  const [isEditingComment, setIsEditingComment] = useState(false);

  // delete comment pop up confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Action state - tracks comment status
  const [commentDeleted, setCommentDeleted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  // -------------------------------------------------------------------
  // ---------- FIND APPLICATIONID IN APPLICATIONS ---------------------
  // -------------------------------------------------------------------
  const application =
    applications.find((a) => a.applicationID === parseInt(applicationID as string)) ?? null;

  // ------------------------------------------------------------------
  // ---------- FIND VENDOR COMMENTS FOR APPLICATIONID ----------------
  // -------------------------------------------------------------------
  const vendorComment =
    vendorComments.find(
      (c) => c.booking.application.applicationID === parseInt(applicationID as string),
    ) ?? null;

  {
    /*TODO: RETRIEVE applications from database*/
  }
  // On load - find the application, check localStorage for
  // any previously saved status updates
  // useEffect(() => {
  //   if (!hirerId) return;

  //   // display event permit
  //   const savedPermit = localStorage.getItem("appDoc_permit");
  //   if (savedPermit) {
  //     const parsed = JSON.parse(savedPermit);
  //     setPermitFileName(parsed.fileName);
  //     setPermitFile(parsed);
  //   }
  // }, [hirerId]);

  // ------------------------------------------------------------
  // --------- OPENS APPLICATION STATUS CONFIRMATION ------------
  // ------------------------------------------------------------
  // Handle accept or decline button click
  function handleActionClick(action: "Approved" | "Declined") {
    setPendingAction(action);
    onOpen();
  }

  // ------------------------------------------------
  // --------- UPDATE APPLICATION STATUS ------------
  // ------------------------------------------------
  const handleConfirm = async () => {
    if (!pendingAction || !application) return;

    try {
      await vendorApi.updateApplicationStatus(application.applicationID, pendingAction);
      fetchApplications();
      setIsSuccess(true);
      // Show success message for 1 second
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1000);
    } catch (error) {
      console.log("Error updating application status", error);
    }
  };

  // -------------------------------------------------
  // --------- SAVE UPDATED / EDITED COMMENT ---------
  // -------------------------------------------------
  const handleSaveComment = async () => {
    console.log("handleSaveComment called");
    if (!vendorComment) return;

    try {
      await vendorApi.editApplicationComment(vendorComment.commentID, commentText);
      fetchComments();
      setIsEditingComment(false);
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 1000); // Shows confirmation message for 1 second
    } catch (error) {
      console.log("error updating comment", error);
    }
  };

  // -------------------------------------------------
  // ---------------- ADD NEW COMMENT-----------------
  // -------------------------------------------------
  const handleCreateComment = async () => {
    console.log("handleCreateComment called");
    try {
      let bookingComment =
        bookings.find(
          (booking) => booking.application.applicationID === parseInt(applicationID as string),
        ) ?? null;
      await vendorApi.createComment(bookingComment!.bookingID, commentText);
      fetchComments();
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 1000);
      setIsEditingComment(false);
    } catch (error) {
      console.error("Error creating comment: ", error);
    }
  };

  // -------------------------------------------------
  // ----------------- DELETE COMMENT ----------------
  // -------------------------------------------------
  const handleDeleteComment = async () => {
    if (!vendorComment) return;
    try {
      await vendorApi.deleteApplicationComment(vendorComment!.commentID);
      setCommentDeleted(true);
      fetchComments();
      setCommentText("");
      setTimeout(() => {
        setCommentDeleted(false);
      }, 1000);
    } catch (error) {
      console.log("error delete comment", error);
    }
  };

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

  if (!application) return null;

  const reputation = getReputationBadge(application?.hirer.userID, bookings);

  console.log("vendorComment:", vendorComment);
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
                <Text fontWeight="semibold">{application.guestCount}ppl</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Venue Requested
                </Text>
                <Text fontWeight="semibold">{application.venue.name ?? "Unknown"}</Text>
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
                <Badge
                  key={tag.reputationTag.reputationName}
                  colorScheme="purple"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {tag.reputationTag.reputationName}
                </Badge>
              ))}
            </Flex>
          </Box>
          {/* Vendor comment on hirer */}
          {/* Only show comment box if application has been approved */}
          {application.status === "approved" && (
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
                    {vendorComment?.commentText || "No comment added yet."}
                  </Text>
                  {commentDeleted && (
                    <Text fontSize="sm" color="green.500">
                      Comment deleted successfully.
                    </Text>
                  )}
                  {commentSaved && (
                    <Text fontSize="sm" color="green.500">
                      Comment saved successfully.
                    </Text>
                  )}

                  <Button
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: "brand.secondary", color: "brand.primary" }}
                    onClick={() => {
                      setIsEditingComment(true);
                      setCommentSaved(false);
                      setCommentText(vendorComment?.commentText ?? "");
                    }}
                  >
                    {vendorComment ? "Edit Comment" : "Add Comment"}
                  </Button>
                  {vendorComment?.commentText && (
                    <Button
                      variant="outline"
                      borderColor="red.400"
                      color="red.400"
                      _hover={{ bg: "red.50" }}
                      onClick={onDeleteOpen}
                      ml={4}
                    >
                      Delete Comment
                    </Button>
                  )}
                </Box>
              ) : (
                /* EDIT MODE - show textarea with Save and Cancel buttons */
                <Box>
                  <Textarea
                    placeholder="Write your notes about this hirer here..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
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
                      onClick={() => (vendorComment ? handleSaveComment() : handleCreateComment())}
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
                  {application.hirer.firstName} {application.hirer.lastName}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Email
                </Text>
                <Text fontWeight="semibold" fontSize="sm">
                  {application.hirer.email}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Phone
                </Text>
                <Text fontWeight="semibold">{application.hirer.phoneNumber}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500" fontSize="sm">
                  Date Joined
                </Text>
                <Text fontWeight="semibold">
                  {new Date(application.hirer.joinedDate).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
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
                  {getHirerAvgRating(application.hirer.userID, bookings) !== null ? (
                    <>
                      {renderStars(getHirerAvgRating(application.hirer.userID, bookings)!)}
                      <Text gap={4} fontSize="xs" color="gray.500">
                        {getHirerAvgRating(application.hirer.userID, bookings)} / 5
                      </Text>
                    </>
                  ) : (
                    <Text fontSize={"sm"} color={"gray.400"}>
                      No ratings yet
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Flex>

            {/* View full hirer profile link */}
            <Divider my={4} />
            <NextLink href={`/vendorDashboard/hirerProfiles/${application.hirer.userID}`}>
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
          {application.status === "pending" && (
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
          {application.status !== "pending" && (
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} bg="gray.50">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                This application has already been {application.status.toLowerCase()}.
              </Text>
            </Box>
          )}
        </Box>
      </Flex>

      {/* Confirmation dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              Delete Comment
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>Are you sure you want to delete this comment?</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                ml={3}
                variant="outline"
                borderColor="red.400"
                color="red.400"
                _hover={{ bg: "red.50" }}
                onClick={() => {
                  handleDeleteComment();
                  onDeleteClose();
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

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
                  this application from {application.hirer.firstName} {application.hirer.lastName}?
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
