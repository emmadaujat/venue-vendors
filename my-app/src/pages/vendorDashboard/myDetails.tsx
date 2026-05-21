import { useState, useEffect } from "react";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, Avatar, Input, Button, Spinner } from "@chakra-ui/react";
import { vendorApi } from "@/services/vendorApi";

// Import custom hooks
import { useVendorBookings } from "@/hooks/vendor/useVendorBookings";
import { useVendorVenues } from "@/hooks/vendor/useVendorVenues";

export default function VendorMyDetails() {
  // Only vendors can access this page
  const { user } = useAuth("vendor");

  // Fetch vendor bookings and venues from custom hooks
  const { bookings, isLoading: bookingsLoading } = useVendorBookings();
  const { venues, isLoading: venuesLoading } = useVendorVenues();

  // isLoading combines both loading states from custom hooks — page shows spinner until both are ready
  const isLoading = bookingsLoading || venuesLoading;

  // Editable fields
  const [editableName, setEditableName] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Which field is currently being edited
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Validation error messages
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

  // Success confirmation message
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Get profile from api/backend
  useEffect(() => {
    if (!user) return;
    setEditableName(user.firstName + " " + user.lastName);
    setEditablePhone(user.phoneNumber);
    setUserEmail(user.email);
  }, [user]);

  // Stats - calculated for this vendor
  const totalVenues = venues.length;
  const totalBookings = bookings.length;

  // Get avg vendor rating
  const avgRating =
    bookings.length > 0
      ? bookings.reduce((acc, curr) => acc + curr.vendorRating, 0) / bookings.length
      : 0;

  // ------------------------------------------------------------
  // --------------- VALIDATION: NAME FIELD EMPTY --------------
  // ------------------------------------------------------------
  function validateNameField(nameInput: string): boolean {
    if (nameInput.trim() === "") {
      setNameErrorMessage("Name cannot be empty");
      return false;
    }
    setNameErrorMessage("");
    return true;
  }

  // ------------------------------------------------------------
  // --------------- VALIDATION: AUSTRALIAN MOBILE --------------
  // ------------------------------------------------------------
  function validatePhoneField(phoneInput: string): boolean {
    const cleanedPhone = phoneInput.replace(/[\s\-]/g, "");
    if (cleanedPhone.length !== 10) {
      setPhoneErrorMessage("Phone number must be 10 digits"); // 10 digits
      return false;
    }
    if (!cleanedPhone.startsWith("04")) {
      setPhoneErrorMessage("Phone number must start with 04"); // starting with 04
      return false;
    }
    if (!/^\d+$/.test(cleanedPhone)) {
      setPhoneErrorMessage("Phone number must contain only digits");
      return false;
    }
    setPhoneErrorMessage("");
    return true;
  }

  // Split "First Last" into first + last name parts.
  function splitName(fullName: string) {
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  }

  // Send the updated details to the backend, then update the copy
  // of the user in localStorage so the navbar/other pages refresh.
  async function saveProfile(firstName: string, lastName: string, phoneNumber: string) {
    await vendorApi.updateProfile({ firstName, lastName, phoneNumber });

    const saved = localStorage.getItem("user");
    if (saved) {
      const current = JSON.parse(saved);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...current, firstName, lastName, phoneNumber }),
      );
    }

    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
    setTimeout(() => window.location.reload(), 1500);
  }

  // ------------------------------------------------------------
  // --------------- SAVE UPDATED FIRST & LAST NAME --------------
  // ------------------------------------------------------------
  async function handleSaveName() {
    if (!validateNameField(editableName) || !user) return;

    const { firstName, lastName } = splitName(editableName); // splits into firstName / lastName(
    try {
      await saveProfile(firstName, lastName, user.phoneNumber);
      setIsEditingName(false);
    } catch {
      setNameErrorMessage("Could not save. Please try again.");
    }
  }

  // ------------------------------------------------------------
  // ----------------- SAVE UPDATED PHONE NUMBER ----------------
  // ------------------------------------------------------------
  async function handleSavePhone() {
    if (!validatePhoneField(editablePhone) || !user) return;
    const { firstName, lastName } = splitName(user.firstName + " " + user.lastName); // splits into firstName / lastName(

    try {
      await saveProfile(firstName, lastName, editablePhone);
      setIsEditingPhone(false);
    } catch {
      setPhoneErrorMessage("Could not save. Please try again.");
    }
  }

  if (isLoading)
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );

  if (!user) return null;

  return (
    <VendorDashboardLayout>
      {/* Page title + stats row */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            My Details
          </Text>
          <Text fontSize="sm" color="gray.500">
            Review and manage your contact details
          </Text>
        </Box>

        <Flex gap={4}>
          {/* Total Venues */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
            textAlign="center"
            minW="100px"
          >
            <Text fontSize="xs" color="gray.500">
              Total Venues
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {totalVenues}
            </Text>
          </Box>

          {/* Total Bookings */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
            textAlign="center"
            minW="100px"
          >
            <Text fontSize="xs" color="gray.500">
              Total Bookings
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {totalBookings}
            </Text>
          </Box>

          {/* Avg Rating */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
            textAlign="center"
            minW="100px"
          >
            <Text fontSize="xs" color="gray.500">
              Avg Rating
            </Text>
            <Flex justifyContent="center" alignItems="center" gap={1}>
              <StarIcon color="yellow.500" boxSize={3} />
              <Text fontSize="xl" fontWeight="bold">
                {avgRating}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>

      {/* Your details card */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        maxW="700px"
        mx="auto"
      >
        {/* Purple header */}
        <Flex
          bg="brand.primary"
          color="white"
          px={6}
          py={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontWeight="semibold">Your Details</Text>
          <Text fontSize="sm">Account Type: Vendor</Text>
        </Flex>

        <Box p={6}>
          {/* Avatar + Welcome */}
          <Flex alignItems="center" gap={4} mb={6}>
            <Avatar
              name={user.firstName + " " + user.lastName}
              bg="brand.secondary"
              color="brand.primary"
              size="xl"
            />
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                Welcome Back,
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {editableName}
              </Text>
            </Box>
          </Flex>

          {/* Success message */}
          {showSaveConfirmation && (
            <Box
              bg="green.50"
              border="1px solid"
              borderColor="green.300"
              p={3}
              borderRadius="md"
              mb={4}
            >
              <Text color="green.600" fontSize="sm">
                Your details have been saved successfully!
              </Text>
            </Box>
          )}

          {/* Name field */}
          <Box mb={5}>
            <Text fontWeight="bold" mb={1}>
              Name
            </Text>
            <Flex alignItems="center" gap={2}>
              <Input
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                isReadOnly={!isEditingName}
                bg={isEditingName ? "white" : "gray.50"}
                borderColor="gray.300"
                flex="1"
              />
              {!isEditingName ? (
                <Flex
                  alignItems="center"
                  gap={1}
                  cursor="pointer"
                  onClick={() => setIsEditingName(true)}
                  color="gray.500"
                  _hover={{ color: "brand.primary" }}
                >
                  <EditIcon boxSize={3} />
                  <Text fontSize="sm">Change</Text>
                </Flex>
              ) : (
                <Button size="sm" bg="brand.primary" color="white" onClick={handleSaveName}>
                  Save
                </Button>
              )}
            </Flex>
            {nameErrorMessage && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {nameErrorMessage}
              </Text>
            )}
          </Box>

          {/* Email field - not editable */}
          <Box mb={5}>
            <Text fontWeight="bold" mb={1}>
              Email
            </Text>
            <Input
              value={userEmail}
              isReadOnly={true}
              bg="gray.100"
              borderColor="gray.300"
              color="gray.500"
            />
          </Box>

          {/* Phone Number field */}
          <Box mb={5}>
            <Text fontWeight="bold" mb={1}>
              Phone Number
            </Text>
            <Flex alignItems="center" gap={2}>
              <Input
                value={editablePhone}
                onChange={(e) => setEditablePhone(e.target.value)}
                isReadOnly={!isEditingPhone}
                bg={isEditingPhone ? "white" : "gray.50"}
                borderColor="gray.300"
                flex="1"
              />
              {!isEditingPhone ? (
                <Flex
                  alignItems="center"
                  gap={1}
                  cursor="pointer"
                  onClick={() => setIsEditingPhone(true)}
                  color="gray.500"
                  _hover={{ color: "brand.primary" }}
                >
                  <EditIcon boxSize={3} />
                  <Text fontSize="sm">Change</Text>
                </Flex>
              ) : (
                <Button size="sm" bg="brand.primary" color="white" onClick={handleSavePhone}>
                  Save
                </Button>
              )}
            </Flex>
            {phoneErrorMessage && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {phoneErrorMessage}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </VendorDashboardLayout>
  );
}
