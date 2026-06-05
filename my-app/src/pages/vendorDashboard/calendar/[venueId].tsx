import {
  Text,
  Flex,
  Box,
  Button,
  Select,
  Input,
  Divider,
  Spinner,
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
import { useState, useRef } from "react";
import NextLink from "next/link";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Custom hooks
import { useVendorVenues } from "@/hooks/vendor/useVendorVenues";
import { useVenueBlockouts } from "@/hooks/vendor/useVenueBlockouts";

// Reason options for the dropdown
const REASON_OPTIONS = ["Maintenance", "Renovation", "Private Event", "Staff Holiday", "Other"];

export default function VenueCalendar() {
  const router = useRouter();
  const { venueId } = router.query;
  const { user } = useAuth("vendor");

  // get venueId from URL convert string to number
  const venueIdNum = venueId ? parseInt(venueId as string) : null;

  // Fetch this vendors venues to find the venue name
  const { venues, isLoading: venuesLoading } = useVendorVenues();

  // fetch and manage blocked dates for this venue
  const {
    blockedDates,
    isLoading: blockoutsLoading,
    createBlockout,
    deleteBlockout,
  } = useVenueBlockouts(venueIdNum);

  // Find the specific venue from the list (for displaying its name)
  const venue = venues.find((v) => v.venueID === venueIdNum);

  // Combined loading state — wait for both to be ready
  const isLoading = venuesLoading || blockoutsLoading;

  // Calendar date range selection state
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState(REASON_OPTIONS[0]);

  // Success/error state for the confirm dialog
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  // Which blocked period is queued for removal
  const [periodToRemove, setPeriodToRemove] = useState<number | null>(null);
  const [isRemoveSuccess, setIsRemoveSuccess] = useState(false);

  // Confirmation dialogs
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  // Format date to to YYYY-MM-DD string
  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format date for display
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // -------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------

  // Handle confirm block dates when vendor clicks in the block dates dialog
  async function handleConfirm() {
    if (!selectedRange?.from || !selectedRange?.to) return;

    try {
      await createBlockout(
        formatLocalDate(selectedRange.from),
        formatLocalDate(selectedRange.to),
        reason,
      );
      setIsSuccess(true);
      // Show success message for 2 seconds then close
      setTimeout(() => {
        setIsSuccess(false);
        onConfirmClose();
        setSelectedRange(undefined);
      }, 2000);
    } catch (error) {
      console.error("Failed to block out dates", error);
      setIsError(true);
    }
  }

  // Handle remove blocked period
  async function handleRemoveConfirm() {
    if (!periodToRemove) return;
    try {
      await deleteBlockout(periodToRemove);
      setIsRemoveSuccess(true);
      setTimeout(() => {
        setIsRemoveSuccess(false);
        onRemoveClose();
        setPeriodToRemove(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to delete block out date", error);
    }
  }

  // The DB returns Date objects as strings; reconstruct Date instances for DayPicker.
  const disabledDays = blockedDates.map((p) => ({
    from: new Date(p.startDate),
    to: new Date(p.endDate),
  }));

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );
  }

  // Venue not found or doesn't belong to this vendor
  if (!venue) {
    return (
      <VendorDashboardLayout>
        <Text>Venue not found or you do not have permission to manage this venue.</Text>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      {/* Back link */}
      <NextLink href="/vendorDashboard/myVenues">
        <Text
          color="brand.primary"
          fontSize="sm"
          mb={4}
          fontWeight="semibold"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to My Venues
        </Text>
      </NextLink>

      {/* Page title */}
      <Box mb={6}>
        <Text fontWeight="bold" fontSize="xl">
          My Venues - {venue.name}
        </Text>
        <Text color="gray.500" fontSize="sm">
          Block venue dates for maintenance or renovation periods
        </Text>
      </Box>

      <Flex gap={6} align="flex-start">
        {/* Left - calendar */}
        <Box flex="2">
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            {/* Calendar header */}
            <Box bg="brand.primary" p={4}>
              <Text color="white" fontWeight="semibold">
                Select Dates to Block
              </Text>
            </Box>

            {/* DayPicker */}
            <Box p={4}>
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                disabled={[
                  { before: new Date() }, // cant block past dates
                  ...disabledDays, // already blocked periods show as disabled
                ]}
                modifiersStyles={{
                  disabled: {
                    backgroundColor: "#e2e8f0",
                    color: "#a0aec0",
                    borderRadius: "4px",
                  },

                  range_middle: {
                    color: "#E3D6EB",
                    backgroundColor: "#4C2C62",
                    borderRadius: "4px",
                  },
                }}
              />
            </Box>

            {/* Legend */}
            <Flex gap={4} px={4} pb={4} align="center">
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                Legend:
              </Text>
              <Flex align="center" gap={1}>
                <Box w="16px" h="16px" bg="gray.200" borderRadius="sm" />
                <Text fontSize="xs" color="gray.500">
                  Blocked
                </Text>
              </Flex>
              <Flex align="center" gap={1}>
                <Box w="16px" h="16px" bg="brand.primary" borderRadius="sm" />
                <Text fontSize="xs" color="gray.500">
                  Selected
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Blocked periods list */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" mt={6} overflow="hidden">
            <Box bg="brand.primary" p={4}>
              <Text color="white" fontWeight="semibold">
                Blocked Periods
              </Text>
            </Box>

            {blockedDates.length === 0 ? (
              <Box p={4}>
                <Text fontSize="sm" color="gray.500">
                  No blocked periods for this venue yet.
                </Text>
              </Box>
            ) : (
              blockedDates.map((period) => (
                <Box key={period.blockedID}>
                  <Flex p={4} justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {period.reason}
                      </Text>
                    </Box>
                    <Text
                      fontSize="sm"
                      color="red.400"
                      fontWeight="bold"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => {
                        setPeriodToRemove(period.blockedID);
                        onRemoveOpen();
                      }}
                    >
                      Remove ✕
                    </Text>
                  </Flex>
                  <Divider />
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right - block dates form */}
        <Box flex="1">
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            <Box bg="brand.primary" p={4}>
              <Text color="white" fontWeight="semibold">
                Block Dates
              </Text>
            </Box>

            <Box p={4}>
              <Flex direction="column" gap={4}>
                {/* Venue name display */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Venue
                  </Text>
                  <Input value={venue.name} isReadOnly bg="gray.50" fontSize="sm" />
                </Box>

                {/* Start date display */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Start Date
                  </Text>
                  <Input
                    value={selectedRange?.from ? formatLocalDate(selectedRange.from) : ""}
                    isReadOnly
                    bg="gray.50"
                    fontSize="sm"
                    placeholder="Select on calendar"
                  />
                </Box>

                {/* End date display */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    End Date
                  </Text>
                  <Input
                    value={selectedRange?.to ? formatLocalDate(selectedRange.to) : ""}
                    isReadOnly
                    bg="gray.50"
                    fontSize="sm"
                    placeholder="Select on calendar"
                  />
                </Box>

                {/* Reason dropdown */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Reason
                  </Text>
                  <Select value={reason} onChange={(e) => setReason(e.target.value)} fontSize="sm">
                    {REASON_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Confirm button */}
                <Button
                  bg="brand.primary"
                  color="white"
                  width="100%"
                  isDisabled={!selectedRange?.from || !selectedRange?.to}
                  onClick={onConfirmOpen}
                  _hover={{
                    bg: "transparent",
                    border: "2px solid",
                    borderColor: "brand.primary",
                    color: "brand.primary",
                  }}
                >
                  Confirm
                </Button>

                {/* Note */}
                <Box
                  bg="yellow.50"
                  border="1px solid"
                  borderColor="yellow.200"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="xs" color="yellow.700">
                    Note: Hirers cannot apply during blocked periods. "Selected date/time is
                    unavailable."
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* Confirm block dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!isSuccess) onConfirmClose();
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              {isSuccess ? "Success!" : isError ? "Error" : "Confirm Blocked Period"}
            </AlertDialogHeader>
            <AlertDialogBody>
              {isSuccess ? (
                <Text>Dates have been successfully blocked!</Text>
              ) : isError ? (
                <Text color="red.500">Something went wrong. Please try again.</Text>
              ) : (
                <Text>
                  Are you sure you want to block{" "}
                  <strong>{selectedRange?.from ? formatLocalDate(selectedRange.from) : ""}</strong>{" "}
                  to <strong>{selectedRange?.to ? formatLocalDate(selectedRange.to) : ""}</strong>{" "}
                  for <strong>{reason}</strong>?
                </Text>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              {!isSuccess && (
                <>
                  <Button
                    ref={cancelRef}
                    onClick={() => {
                      setIsError(false);
                      onConfirmClose();
                    }}
                  >
                    Cancel
                  </Button>
                  {!isError && (
                    <Button
                      ml={3}
                      bg="brand.primary"
                      color="white"
                      onClick={handleConfirm}
                      _hover={{
                        bg: "brand.secondary",
                        color: "brand.primary",
                      }}
                    >
                      Confirm
                    </Button>
                  )}
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Confirm remove dialog */}
      <AlertDialog
        isOpen={isRemoveOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!isRemoveSuccess) onRemoveClose();
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              {isRemoveSuccess ? "Removed!" : "Remove Blocked Period"}
            </AlertDialogHeader>
            <AlertDialogBody>
              {isRemoveSuccess ? (
                <Text>Blocked period has been successfully removed!</Text>
              ) : (
                <Text>
                  Are you sure you want to remove this blocked period? Hirers will be able to apply
                  for these dates again.
                </Text>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              {!isRemoveSuccess && (
                <>
                  <Button ref={cancelRef} onClick={onRemoveClose}>
                    Cancel
                  </Button>
                  <Button
                    ml={3}
                    bg="red.400"
                    color="white"
                    onClick={handleRemoveConfirm}
                    _hover={{ bg: "red.50", color: "red.400" }}
                  >
                    Remove
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
