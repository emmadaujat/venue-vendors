import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_BOOKINGS } from "@/dummyData";
import { StarIcon } from "@chakra-ui/icons";
import type { Booking, Application } from "@/types";

import {
    Box,
    Text,
    Flex,
    Avatar,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
} from "@chakra-ui/react";
import Link from "next/link";

export default function HirerBookingHistory() {
    // Only hirers can access this page
    const { user } = useAuth("hirer");
    const router = useRouter();

    // All bookings for this hirer
    const [hirerBookings, setHirerBookings] = useState<Booking[]>([]);

    // Credibility percentage loaded from localStorage
    const [credibilityPercentage, setCredibilityPercentage] = useState(0);


    // Load bookings on page load
    useEffect(() => {
        if (!user) return;

        // Always start with the default bookings for this hirer (the sample data)
        const defaultHirerBookings = DEFAULT_BOOKINGS.filter(
            (booking) => booking.hirerId === user.id
        );
        const defaultIds = new Set(defaultHirerBookings.map((b) => b.id));

        // Then merge in any extra entries from localStorage (e.g. drafts, submitted apps)
        // that are NOT already in the default data
        const bookingsFromStorage = localStorage.getItem("hirerBookings");
        let extraBookings: Booking[] = [];
        if (bookingsFromStorage) {
            const allStored: Booking[] = JSON.parse(bookingsFromStorage);
            extraBookings = allStored.filter((b) => !defaultIds.has(b.id));
        }

        let mergedBookings = [...defaultHirerBookings, ...extraBookings];

        // Merge in vendor status updates (Approved / Declined) from applicationStatuses
        const storedApps = localStorage.getItem("hirerApplications");
        const storedStatuses = localStorage.getItem("applicationStatuses");
        if (storedApps && storedStatuses) {
            const apps: Application[] = JSON.parse(storedApps);
            const statuses: Record<string, string> = JSON.parse(storedStatuses);
            mergedBookings = mergedBookings.map((booking) => {
                // Match booking → application by hirerId + venueId + eventName
                const matchingApp = apps.find(
                    (a) =>
                        a.hirerId === booking.hirerId &&
                        a.venueId === booking.venueId &&
                        a.eventName === booking.eventName
                );
                if (matchingApp && statuses[matchingApp.id]) {
                    return { ...booking, status: statuses[matchingApp.id] };
                }
                return booking;
            });
        }

        // Write the merged list back so localStorage stays consistent going forward
        localStorage.setItem("hirerBookings", JSON.stringify(mergedBookings));
        setHirerBookings(mergedBookings);

        // Load credibility
        const savedCredibility = localStorage.getItem("credibilityScore");
        if (savedCredibility) {
            setCredibilityPercentage(Number(savedCredibility));
        }
    }, [user]);


    // Calculate stats from bookings
    const totalBookingsCount = hirerBookings.length;

    // Only count bookings where vendor has left a rating (vendorRating > 0)
    const ratedBookings = hirerBookings.filter((b) => b.vendorRating > 0);
    let averageRatingValue = 0; // default to 0 if no ratings yet
    if (ratedBookings.length > 0) {
        const ratingSum = ratedBookings.reduce((sum, b) => sum + b.vendorRating, 0); // sum up all the ratings
        averageRatingValue = parseFloat((ratingSum / ratedBookings.length).toFixed(1)); // calculate average and round to 1 decimal place
    }


    // Delete a saved draft - removes it from localStorage and state
    function handleDeleteDraft(bookingId: string, venueId: string) {
        // Remove from state
        const updated = hirerBookings.filter((b) => b.id !== bookingId);
        setHirerBookings(updated);
        localStorage.setItem("hirerBookings", JSON.stringify(updated));
        // Also clear the application draft if it's for the same venue
        const savedDraft = localStorage.getItem("applicationDraft");
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.venueId === venueId) {
                localStorage.removeItem("applicationDraft");
            }
        }
    }

    // Helper to render star icons for a rating
    function renderStarRating(rating: number) {
        const stars = [];
        for (let i = 0; i < 5; i++) { // loop 5 times to render 5 stars
            stars.push(
                <StarIcon
                    key={i}
                    color={i < Math.round(rating) ? "yellow.500" : "gray.300"}
                    boxSize={3}
                />
            );
        }
        return <Flex gap={0.5}>{stars}</Flex>;
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
                    {/* Welcome + credibility row */}
                    <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        mb={8}
                        bg="gray.50"
                        borderRadius="lg"
                        p={6}
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <Flex alignItems="center" gap={4}>
                            <Avatar
                                name={user.firstName + " " + user.lastName}
                                bg="brand.secondary"
                                color="brand.primary"
                                size="lg"
                            />
                            <Box>
                                <Text fontSize="xl" fontWeight="bold">
                                    Welcome Back,
                                </Text>
                                <Text fontSize="xl" fontWeight="bold">
                                    {user.firstName} {user.lastName}
                                </Text>
                                <Link href="/hirer/myDetails">
                                    <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                                        View your details →
                                    </Text>
                                </Link>
                            </Box>
                        </Flex>

                        <Box textAlign="center">
                            <Text fontSize="md" fontWeight="semibold" color="gray.700">
                                Current Credibility Rating:
                            </Text>
                            <Text fontSize="4xl" fontWeight="bold" color="brand.primary">
                                {credibilityPercentage}%
                            </Text>
                            <Link href="/hirer/complianceDocuments">
                                <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                                    Add more Compliance Documents →
                                </Text>
                            </Link>
                        </Box>
                    </Flex>

                    {/* Page title + stats */}
                    <Flex justifyContent="space-between" alignItems="flex-start" mb={6}>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold">
                                My Booking History
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                View your booking history and see your ratings
                            </Text>
                        </Box>

                        <Flex gap={4}>
                            {/* Avg Rating stat card */}
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                                textAlign="center"
                                minW="120px"
                            >
                                <Text fontSize="sm" color="gray.500">Avg Rating</Text>
                                <Flex justifyContent="center" alignItems="center" gap={1}>
                                    <StarIcon color="yellow.500" boxSize={4} />
                                    <Text fontSize="2xl" fontWeight="bold">{averageRatingValue}</Text>
                                </Flex>
                            </Box>

                            {/* Total Bookings stat card */}
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                                textAlign="center"
                                minW="120px"
                            >
                                <Text fontSize="sm" color="gray.500">Total Bookings</Text>
                                <Text fontSize="2xl" fontWeight="bold">{totalBookingsCount}</Text>
                            </Box>
                        </Flex>
                    </Flex>

                    {/* Booking history table */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                        <Box bg="brand.primary" color="white" px={4} py={3}>
                            <Text fontWeight="semibold">Your Booking History</Text>
                        </Box>

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Venue Name</Th>
                                    <Th>Location</Th>
                                    <Th>Date</Th>
                                    <Th>Rating from Vendor</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {hirerBookings.map((booking) => (
                                    <Tr key={booking.id}>
                                        <Td fontWeight="medium">{booking.venueName}</Td>
                                        <Td>{booking.venueLocation}</Td>
                                        <Td>{booking.eventDate ? new Date(booking.eventDate).toLocaleDateString("en-AU") : "-"}</Td>
                                        <Td>
                                            {booking.vendorRating > 0 ? (
                                                <Flex alignItems="center" gap={2}>
                                                    {renderStarRating(booking.vendorRating)}
                                                    <Text fontSize="sm">{booking.vendorRating} / 5</Text>
                                                </Flex>
                                            ) : (
                                                <Text fontSize="sm" color="gray.400">N/A</Text>
                                            )}
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={
                                                    booking.status === "Active" ? "green" :
                                                        booking.status === "Approved" ? "green" :
                                                            booking.status === "Declined" ? "red" :
                                                                booking.status === "Saved Draft" ? "purple" :
                                                                    booking.status === "Pending" ? "orange" :
                                                                        "gray"
                                                }
                                                fontSize="xs"
                                            >
                                                {booking.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Flex gap={2}>
                                                {booking.status === "Saved Draft" && (
                                                    <Button
                                                        size="xs"
                                                        bg="brand.primary"
                                                        color="white"
                                                        _hover={{ opacity: 0.85 }}
                                                        onClick={() => router.push("/hirer/apply?venueId=" + booking.venueId)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                <Button
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="outline"
                                                    onClick={() => handleDeleteDraft(booking.id, booking.venueId)}
                                                >
                                                    Delete
                                                </Button>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </Flex>

            <Footer />
        </Flex>
    );
}
