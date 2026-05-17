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
import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { StarIcon, CheckIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Textarea } from "@chakra-ui/react";
import { getHirerAvgRating, getReputationBadge } from "@/hirerRatingCalculation";
import { getStatusColor, renderStars } from "@/helpersUtil";
import { vendorApi } from "@/services/vendorApi";
import type { Application, Venue, Booking, VendorComment } from "@/types";

export default function ApplicationReview() {
  const router = useRouter();
  const { applicationID } = router.query;
  const { user } = useAuth("vendor");
  // Action state - tracks whether vendor is accepting or declining application
  const [pendingAction, setPendingAction] = useState<"Approved" | "Declined" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [vendorComment, setVendorComment] = useState<VendorComment | null>(null);
  const [permitFileName, setPermitFileName] = useState<string>("");
  const [permitFile, setPermitFile] = useState<{ fileName: string; data: string } | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentDeleted, setCommentDeleted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  useEffect(() => {
    if (user && applicationID) {
      fetchApplications();
      fetchComments();
      fetchBookings();
    }
  }, [user, applicationID]);

  const fetchApplications = async () => {
    try {
      const data = await vendorApi.getVendorApplications(user!.id);
      let hirerApplication =
        data.find(
          (applications) => applications.applicationID === parseInt(applicationID as string),
        ) ?? null;
      setApplication(hirerApplication);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching applications", error);
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await vendorApi.getVendorComments(user!.id);
      let hirerApplicationComment =
        data.find(
          (comments) =>
            comments.booking.application.applicationID === parseInt(applicationID as string),
        ) ?? null;
      setVendorComment(hirerApplicationComment);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching comments", error);
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

  // Handle accept or decline button click
  // Opens confirmation dialog
  function handleActionClick(action: "Approved" | "Declined") {
    setPendingAction(action);
    isOpen();
  }

  // Update application status
  // success message, then redirects back to applications list
  const handleConfirm = async () => {
    if (!pendingAction || !application) return;

    try {
      const updatedApplication = await vendorApi.updateApplicationStatus(
        user!.id,
        application.applicationID,
        pendingAction,
      );
      setApplication(updatedApplication);
      setIsSuccess(true);
      // Show success message for 1 second then redirect
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1000);
    } catch (error) {
      console.log("Error updating application status", error);
    }
  };

  // Save updated/ edited comment
  // Shows confirmation message for 1 second
  const handleSaveComment = async () => {
    console.log("handleSaveComment called");
    if (!vendorComment) return;

    try {
      const updatedVendorComment = await vendorApi.editApplicationComment(
        user!.id,
        vendorComment.commentID,
        commentText,
      );
      setVendorComment(updatedVendorComment);
      setIsEditingComment(false);
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 1000);
    } catch (error) {
      console.log("error updating comment", error);
    }
  };

  // add new comment
  const handleCreateComment = async () => {
    console.log("handleCreateComment called");
    try {
      let bookingComment =
        bookings.find(
          (booking) => booking.application.applicationID === parseInt(applicationID as string),
        ) ?? null;
      const createVendorComment = await vendorApi.createComment(
        user!.id,
        bookingComment!.bookingID,
        commentText,
      );
      setVendorComment(createVendorComment);
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 1000);
      setIsEditingComment(false);
    } catch (error) {
      console.error("Error creating comment: ", error);
    }
  };

  // // Delete comment
  const handleDeleteComment = async () => {
    if (!vendorComment) return;
    setIsDeleting(true);

    try {
      await vendorApi.deleteApplicationComment(user!.id, vendorComment!.commentID);
      setIsDeleting(false);
      setCommentDeleted(true);
      setVendorComment(null);
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
