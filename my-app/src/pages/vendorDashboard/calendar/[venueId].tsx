import { DEFAULT_VENUES } from "../../../dummyData";
import {
  Text,
  Flex,
  Box,
  Button,
  Select,
  Input,
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
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Type for a blocked period
type BlockedPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
};

{
  /*TODO: RETRIEVE drop down options from database*/
}
// Reason options for the dropdown
const REASON_OPTIONS = ["Maintenance", "Renovation", "Private Event", "Staff Holiday", "Other"];

export default function VenueCalendar() {
  const router = useRouter();
  const { venueId } = router.query;
  const { user } = useAuth("vendor");

  // Format date to local date string
  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  {
    /*TODO: RETRIEVE venues from database*/
  }
  // Find the venue from dummyData
  const venue = DEFAULT_VENUES.find((v) => v.id === venueId);

  // State for the date range selection and reason
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [periodToRemove, setPeriodToRemove] = useState<string | null>(null);
  const [isRemoveSuccess, setIsRemoveSuccess] = useState(false);

  // Confirmation dialogs
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  {
    /*TODO: RETRIEVE blocked dates from database*/
  }
  // Load blocked periods from localStorage on page load
  useEffect(() => {
    if (!venueId) return;
    const saved = localStorage.getItem("blockedDates");
    if (saved) {
      const parsed = JSON.parse(saved);
      setBlockedPeriods(parsed[venueId as string] ?? []);
    }
  }, [venueId]);

  {
    /*TODO: CREATE- save blocked dates for venue to database*/
  }
  // Save blocked periods to localStorage
  function saveToLocalStorage(updated: BlockedPeriod[]) {
    const saved = localStorage.getItem("blockedDates");
    const allBlocked = saved ? JSON.parse(saved) : {};
    allBlocked[venueId as string] = updated;
    localStorage.setItem("blockedDates", JSON.stringify(allBlocked));
  }

  // Handle confirm block dates button click
  function handleConfirm() {
    if (!selectedRange?.from || !selectedRange?.to) return;

    const newPeriod: BlockedPeriod = {
      id: Date.now().toString(),
      startDate: formatLocalDate(selectedRange.from),
      endDate: formatLocalDate(selectedRange.to),
      reason,
    };

    {
      /*TODO: UPDATE blocked dates for venue to database*/
    }
    const updated = [...blockedPeriods, newPeriod];
    setBlockedPeriods(updated);
    saveToLocalStorage(updated);
    setIsSuccess(true);

    // Show success message for 2 seconds then close
    setTimeout(() => {
      setIsSuccess(false);
      onConfirmClose();
      setSelectedRange(undefined);
    }, 2000);
  }

  {
    /*TODO: DELETE - blocked dates for venues from database*/
  }
  // Handle remove blocked period
  function handleRemoveConfirm() {
    if (!periodToRemove) return;
    const updated = blockedPeriods.filter((p) => p.id !== periodToRemove);
    setBlockedPeriods(updated);
    saveToLocalStorage(updated);
    setIsRemoveSuccess(true);

    setTimeout(() => {
      setIsRemoveSuccess(false);
      onRemoveClose();
      setPeriodToRemove(null);
    }, 2000);
  }

  // Convert blocked periods to disabled dates for DayPicker
  const disabledDays = blockedPeriods.map((p) => ({
    from: new Date(p.startDate),
    to: new Date(p.endDate),
  }));

  // Format date for display
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (!venue) {
    return (
      <VendorDashboardLayout>
        <Text>Venue not found.</Text>
      </VendorDashboardLayout>
    );
  }

  // Check if vendor owns this venue
  if (venue.vendorId !== user?.id) {
    return (
      <VendorDashboardLayout>
        <Text>You do not have permission to manage this venue.</Text>
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

            {blockedPeriods.length === 0 ? (
              <Box p={4}>
                <Text fontSize="sm" color="gray.500">
                  No blocked periods for this venue yet.
                </Text>
              </Box>
            ) : (
              blockedPeriods.map((period) => (
                <Box key={period.id}>
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
                        setPeriodToRemove(period.id);
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
              {isSuccess ? "Success!" : "Confirm Blocked Period"}
            </AlertDialogHeader>
            <AlertDialogBody>
              {isSuccess ? (
                <Text>Dates have been successfully blocked!</Text>
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
                  <Button ref={cancelRef} onClick={onConfirmClose}>
                    Cancel
                  </Button>
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
