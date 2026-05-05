import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_BOOKINGS } from "@/dummyData";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import type { User, Booking, Venue } from "@/types";

import {
    Box,
    Text,
    Flex,
    Avatar,
    Input,
    Button,
} from "@chakra-ui/react";
import Link from "next/link";

export default function HirerMyDetails() {
    // Only hirers can access this page
    const { user } = useAuth("hirer");

    // Editable fields
    const [editableName, setEditableName] = useState(""); //"" so that the input starts empty instead of "undefined"
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

    // Stats
    const [hirerBookings, setHirerBookings] = useState<Booking[]>([]);
    const [savedVenuesList, setSavedVenuesList] = useState<Venue[]>([]);

    // Load user details and stats on page load
    useEffect(() => {
        if (!user) return;

        setEditableName(user.firstName + " " + user.lastName);
        setEditablePhone(user.phone);
        setUserEmail(user.email);

        // Load bookings
        const bookingsFromStorage = localStorage.getItem("hirerBookings");
        if (bookingsFromStorage) {
            setHirerBookings(JSON.parse(bookingsFromStorage));
        } else {
            const thisHirerBookings = DEFAULT_BOOKINGS.filter((b) => b.hirerId === user.id);
            setHirerBookings(thisHirerBookings);
        }

        // Load saved venues
        const savedVenuesString = localStorage.getItem("savedVenues");
        if (savedVenuesString) {
            setSavedVenuesList(JSON.parse(savedVenuesString));
        }
    }, [user]);

    // Calculate stats
    const totalBookingsCount = hirerBookings.length;
    const savedVenuesCount = savedVenuesList.length;
    const ratedBookings = hirerBookings.filter((b) => b.vendorRating > 0); // only consider bookings that have been rated by the hirer when calculating average rating
    const totalRatingsCount = ratedBookings.length; // number of ratings left by the hirer
    let averageRatingValue = 0;
    if (ratedBookings.length > 0) {
        const ratingSum = ratedBookings.reduce((sum, b) => sum + b.vendorRating, 0); // sum of all ratings left by the hirer
        averageRatingValue = parseFloat((ratingSum / ratedBookings.length).toFixed(1)); // average rating left by the hirer, rounded to 1 decimal place
    }

    // Validation for name field
    function validateNameField(nameInput: string): boolean {
        if (nameInput.trim() === "") {
            setNameErrorMessage("Name cannot be empty");
            return false;
        }
        setNameErrorMessage("");
        return true;
    }

    // Validation for phone number - must be valid Australian format
    // 10 digits starting with 04
    function validatePhoneField(phoneInput: string): boolean {
        // Remove spaces and dashes for validation
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

    // Save name change
    function handleSaveName() {
        if (!validateNameField(editableName)) return;
        if (!user) return;

        // Split name into first and last
        const nameParts = editableName.trim().split(" ");
        const updatedFirstName = nameParts[0] || ""; // in case user only enters one name, set that as first name and leave last name blank
        const updatedLastName = nameParts.slice(1).join(" ") || ""; // in case there are more than 2 parts to the name, join everything after the first part as the last name

        // Update the user in localStorage
        const updatedUser: User = {
            ...user, // only name is changing, other fields stay the same
            firstName: updatedFirstName,
            lastName: updatedLastName,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setIsEditingName(false);
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 3000); // hide confirmation after 3 seconds
        setTimeout(() => window.location.reload(), 3000); // refresh page after 3 seconds
    }

    // Save phone change
    function handleSavePhone() {
        if (!validatePhoneField(editablePhone)) return;
        if (!user) return;

        // Update the user in localStorage
        const updatedUser: User = {
            ...user, // only phone number is changing, other fields stay the same
            phone: editablePhone,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setIsEditingPhone(false);
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 3000);
        setTimeout(() => window.location.reload(), 3000); // refresh page after 3 seconds
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
                            {/* Total bookings */}
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                textAlign="center"
                                minW="100px"
                            >
                                <Text fontSize="xs" color="gray.500">Total bookings</Text>
                                <Text fontSize="xl" fontWeight="bold">{totalBookingsCount}</Text>
                                <Link href="/hirer/bookingHistory">
                                    <Text fontSize="xs" color="brand.primary">View history →</Text>
                                </Link>
                            </Box>

                            {/* Saved Venues */}
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                textAlign="center"
                                minW="100px"
                            >
                                <Text fontSize="xs" color="gray.500">Saved Venues</Text>
                                <Text fontSize="xl" fontWeight="bold">{savedVenuesCount}</Text>
                                <Link href="/hirer/savedVenues">
                                    <Text fontSize="xs" color="brand.primary">View saved →</Text>
                                </Link>
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
                                <Text fontSize="xs" color="gray.500">Avg Rating</Text>
                                <Flex justifyContent="center" alignItems="center" gap={1}>
                                    <StarIcon color="yellow.500" boxSize={3} />
                                    <Text fontSize="xl" fontWeight="bold">{averageRatingValue}</Text>
                                </Flex>
                            </Box>

                            {/* Total Ratings */}
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                textAlign="center"
                                minW="100px"
                            >
                                <Text fontSize="xs" color="gray.500">Total Ratings</Text>
                                <Text fontSize="xl" fontWeight="bold">{totalRatingsCount}</Text>
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
                            <Text fontSize="sm">Account Type: Hirer</Text>
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
                                    isReadOnly={true}
                                    bg="gray.100"
                                    borderColor="gray.300"
                                    color="gray.500"
                                />
                            </Box>

                            {/* Password field - not editable */}
                            <Box mb={5}>
                                <Text fontWeight="bold" mb={1}>Password</Text>
                                <Input
                                    value="•••••••••••"
                                    isReadOnly={true}
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
