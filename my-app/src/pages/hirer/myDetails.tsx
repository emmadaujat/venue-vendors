import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import { EditIcon } from "@chakra-ui/icons";

import { Box, Text, Flex, Avatar, Input, Button } from "@chakra-ui/react";

export default function HirerMyDetails() {
  // Only hirers can access this page
  const { user } = useAuth("hirer");

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

  // Fill the form with the signed-in user's details.
  useEffect(() => {
    if (!user) return;
    setEditableName(user.firstName + " " + user.lastName);
    setEditablePhone(user.phoneNumber);
    setUserEmail(user.email);
  }, [user]);

  // Name must not be empty.
  function validateNameField(nameInput: string): boolean {
    if (nameInput.trim() === "") {
      setNameErrorMessage("Name cannot be empty");
      return false;
    }
    setNameErrorMessage("");
    return true;
  }

  // Australian mobile: 10 digits starting with 04 (same rule as
  // the backend UpdateProfileDTO so both ends agree).
  function validatePhoneField(phoneInput: string): boolean {
    const cleanedPhone = phoneInput.replace(/[\s-]/g, "");
    if (!/^04\d{8}$/.test(cleanedPhone)) {
      setPhoneErrorMessage("Phone number must be 10 digits starting with 04");
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
    await hirerApi.updateProfile({ firstName, lastName, phoneNumber });

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

  async function handleSaveName() {
    if (!validateNameField(editableName) || !user) return;
    const { firstName, lastName } = splitName(editableName);
    try {
      await saveProfile(firstName, lastName, user.phoneNumber);
      setIsEditingName(false);
    } catch {
      setNameErrorMessage("Could not save. Please try again.");
    }
  }

  async function handleSavePhone() {
    if (!validatePhoneField(editablePhone) || !user) return;
    const { firstName, lastName } = splitName(
      user.firstName + " " + user.lastName,
    );
    try {
      await saveProfile(firstName, lastName, editablePhone);
      setIsEditingPhone(false);
    } catch {
      setPhoneErrorMessage("Could not save. Please try again.");
    }
  }

  if (!user) return null;

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      <Flex flex="1">
        {/* Left sidebar */}
        <HirerSidebar />

        {/* Main content */}
        <Box flex="1" p={6}>
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold">
              My Details
            </Text>
            <Text fontSize="sm" color="gray.500">
              Review and manage your contact details
            </Text>
          </Box>

          {/* Your details card */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
            maxW="700px"
            mx="auto"
          >
            <Flex
              bg="brand.primary"
              color="white"
              px={6}
              py={3}
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontWeight="semibold">Your Details</Text>
              <Text fontSize="sm">Account Type: Hirer</Text>
            </Flex>

            <Box p={6}>
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

              {showSaveConfirmation && (
                <Box bg="green.50" border="1px solid" borderColor="green.300" p={3} borderRadius="md" mb={4}>
                  <Text color="green.600" fontSize="sm">
                    Your details have been saved successfully!
                  </Text>
                </Box>
              )}

              {/* Name field */}
              <Box mb={5}>
                <Text fontWeight="bold" mb={1}>Name</Text>
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
                  <Text color="red.500" fontSize="sm" mt={1}>{nameErrorMessage}</Text>
                )}
              </Box>

              {/* Email field - not editable */}
              <Box mb={5}>
                <Text fontWeight="bold" mb={1}>Email</Text>
                <Input
                  value={userEmail}
                  isReadOnly
                  bg="gray.100"
                  borderColor="gray.300"
                  color="gray.500"
                />
              </Box>

              {/* Phone Number field */}
              <Box mb={5}>
                <Text fontWeight="bold" mb={1}>Phone Number</Text>
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
                  <Text color="red.500" fontSize="sm" mt={1}>{phoneErrorMessage}</Text>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}
