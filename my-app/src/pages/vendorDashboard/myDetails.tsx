import { useState, useEffect } from "react";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_VENUES, DEFAULT_BOOKINGS } from "@/dummyData";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import type { User } from "@/types";

import { Box, Text, Flex, Avatar, Input, Button } from "@chakra-ui/react";

export default function VendorMyDetails() {
  // Only vendors can access this page
  const { user } = useAuth("vendor");

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

  // Load user details on page load
  useEffect(() => {
    if (!user) return;
    setEditableName(user.firstName + " " + user.lastName);
    setEditablePhone(user.phone);
    setUserEmail(user.email);
  }, [user]);

  {
    /*TODO: update getting data from database*/
  }
  // Stats - calculated from dummyData for this vendor
  const vendorVenues = user ? DEFAULT_VENUES.filter((v) => v.vendorId === user.id) : [];
  const totalVenues = vendorVenues.length;

  const vendorVenueIds = vendorVenues.map((v) => v.id);
  const vendorBookings = DEFAULT_BOOKINGS.filter((b) => vendorVenueIds.includes(b.venueId));
  const totalBookings = vendorBookings.length;

  const ratedVenues = vendorVenues.filter((v) => v.rating > 0);
  const avgRating =
    ratedVenues.length > 0
      ? parseFloat(
          (ratedVenues.reduce((sum, v) => sum + v.rating, 0) / ratedVenues.length).toFixed(1),
        )
      : 0;

  // Validation - name must not be empty
  function validateNameField(nameInput: string): boolean {
    if (nameInput.trim() === "") {
      setNameErrorMessage("Name cannot be empty");
      return false;
    }
    setNameErrorMessage("");
    return true;
  }

  {
    /*TODO: backend validation and update details in database*/
  }
  // Validation - Australian mobile: 10 digits starting with 04
  function validatePhoneField(phoneInput: string): boolean {
    const cleanedPhone = phoneInput.replace(/[\s\-]/g, "");
    if (cleanedPhone.length !== 10) {
      setPhoneErrorMessage("Phone number must be 10 digits");
      return false;
    }
    if (!cleanedPhone.startsWith("04")) {
      setPhoneErrorMessage("Phone number must start with 04");
      return false;
    }
    if (!/^\d+$/.test(cleanedPhone)) {
      setPhoneErrorMessage("Phone number must contain only digits");
      return false;
    }
    setPhoneErrorMessage("");
    return true;
  }

  // Save name - splits into firstName / lastName and saves to localStorage
  function handleSaveName() {
    if (!validateNameField(editableName)) return;
    if (!user) return;

    const nameParts = editableName.trim().split(" ");
    const updatedUser: User = {
      ...user,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditingName(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
    setTimeout(() => window.location.reload(), 3000);
  }

  // Save phone - saves updated user to localStorage
  function handleSavePhone() {
    if (!validatePhoneField(editablePhone)) return;
    if (!user) return;

    const updatedUser: User = {
      ...user,
      phone: editablePhone,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditingPhone(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
    setTimeout(() => window.location.reload(), 3000);
  }

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
