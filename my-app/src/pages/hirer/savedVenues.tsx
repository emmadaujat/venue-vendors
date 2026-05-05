import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { StarIcon, TriangleDownIcon, TriangleUpIcon, SmallCloseIcon } from "@chakra-ui/icons";
import type { Venue } from "@/types";

import {
    Box,
    Text,
    Flex,
    Avatar,
    Badge,
    Button,
    Image,
    IconButton,
    Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";

// Type for a saved venue with a preference ranking number
type SavedVenueWithRank = {
    venue: Venue;
    preferenceRank: number;
};

export default function HirerSavedVenues() {
    // Only hirers can access this page
    const { user } = useAuth("hirer");
    const router = useRouter();

    // List of saved venues with their preference rankings
    const [rankedVenuesList, setRankedVenuesList] = useState<SavedVenueWithRank[]>([]);

    // Credibility percentage loaded from localStorage
    const [credibilityPercentage, setCredibilityPercentage] = useState(0);

    // Set of venue IDs the user has already applied to
    const [appliedVenueIds, setAppliedVenueIds] = useState<Set<string>>(new Set());


    // Load saved venues from localStorage when page loads
    useEffect(() => {
        if (!user) return;

        const savedVenuesString = localStorage.getItem("savedVenues");
        if (savedVenuesString) {
            const savedVenues: Venue[] = JSON.parse(savedVenuesString);

            // Check if we already have saved rankings in localStorage
            const savedRankingsString = localStorage.getItem("venueRankings");
            let savedRankings: { [venueId: string]: number } = {};
            if (savedRankingsString) {
                savedRankings = JSON.parse(savedRankingsString);
            }

            // Build the ranked list - use saved rank if it exists, otherwise assign based on position
            const rankedList: SavedVenueWithRank[] = savedVenues.map((venue, index) => ({
                venue: venue,
                preferenceRank: savedRankings[venue.id] || index + 1,
            }));

            // Sort by preference rank ascending
            rankedList.sort((a, b) => a.preferenceRank - b.preferenceRank);
            setRankedVenuesList(rankedList);
        }

        // Load credibility percentage
        const savedCredibility = localStorage.getItem("credibilityScore");
        if (savedCredibility) {
            setCredibilityPercentage(Number(savedCredibility));
        }

        // Load which venues the user has already applied to
        const appsString = localStorage.getItem("hirerApplications");
        if (appsString) {
            const apps = JSON.parse(appsString);
            const ids = new Set<string>(apps.map((a: { venueId: string }) => a.venueId));
            setAppliedVenueIds(ids);
        }
    }, [user]);


    // Save rankings to localStorage
    function saveRankingsToLocalStorage(updatedList: SavedVenueWithRank[]) {
        const rankingsObject: { [venueId: string]: number } = {}; // convert list to an object with venue IDs as keys and ranks as values
        updatedList.forEach((item, i) => {
            rankingsObject[item.venue.id] = i + 1; // save the rank based on the current order in the list
        });
        localStorage.setItem("venueRankings", JSON.stringify(rankingsObject));
    }

    // Move a venue up one position in the list
    function handleMoveUp(index: number) {
        if (index === 0) return; // can't move up if it's already at the top
        const updated = [...rankedVenuesList]; // create a copy of the list to modify
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]; // swap the two items in the list
        updated.forEach((item, i) => { item.preferenceRank = i + 1; }); // update preference ranks after moving
        setRankedVenuesList(updated);
        saveRankingsToLocalStorage(updated);
    }

    // Move a venue down one position in the list
    function handleMoveDown(index: number) {
        if (index === rankedVenuesList.length - 1) return;
        const updated = [...rankedVenuesList];
        [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
        updated.forEach((item, i) => { item.preferenceRank = i + 1; });
        setRankedVenuesList(updated);
        saveRankingsToLocalStorage(updated);
    }

    // Delete a venue from saved venues
    function handleDeleteVenue(venueId: string) {
        // Remove the venue from the list
        const updated = rankedVenuesList.filter((item) => item.venue.id !== venueId);

        // Update preference ranks for remaining venues
        updated.forEach((item, i) => {
            item.preferenceRank = i + 1;
        });

        setRankedVenuesList(updated);

        // Save updated list to localStorage
        const updatedVenues = updated.map((item) => item.venue);
        localStorage.setItem("savedVenues", JSON.stringify(updatedVenues));
        saveRankingsToLocalStorage(updated);
    }


    // Helper to render stars for a rating
    function renderStarRating(rating: number, reviewCount: number) {
        return (
            <Flex alignItems="center" gap={1}>
                <StarIcon color="yellow.500" boxSize={3} />
                <Text fontSize="sm" fontWeight="semibold">
                    {rating}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    ({reviewCount})
                </Text>
            </Flex>
        );
    }

    // Don't render until we have user data
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

                    {/* Page title */}
                    <Box mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            My Saved Venues
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            View your preferred venues and rank them
                        </Text>
                        <Text fontSize="xs" color="brand.primary" mt={1}>
                            Tip: Use the ▲ ▼ arrows next to each venue to change its rank
                        </Text>
                    </Box>

                    {/* Saved venues table */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                        <Box bg="brand.primary" color="white" px={4} py={3}>
                            <Text fontWeight="semibold">Saved Venues</Text>
                        </Box>

                        {rankedVenuesList.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Text color="gray.500" fontSize="md">
                                    No preferred venues have been saved.
                                </Text>
                            </Box>
                        ) : (
                            <>
                                {/* Column headers */}
                                <Flex px={4} py={3} borderBottom="1px solid" borderColor="gray.200" gap={4}>
                                    <Box w="100px">
                                        <Text fontSize="sm" fontWeight="semibold">Rank</Text>
                                    </Box>
                                    <Text fontSize="sm" fontWeight="semibold" flex="1">Venue Details</Text>
                                </Flex>

                                {/* Each saved venue row */}
                                {rankedVenuesList.map((item, index) => (
                                    <Flex
                                        key={item.venue.id}
                                        px={4}
                                        py={4}
                                        borderBottom="1px solid"
                                        borderColor="gray.100"
                                        alignItems="center"
                                        gap={4}
                                    >
                                        {/* Preference number with up/down arrows */}
                                        <Box w="100px" textAlign="center" position="relative">
                                            <Flex
                                                bg="brand.primary"
                                                color="white"
                                                borderRadius="md"
                                                width="50px"
                                                height="50px"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontWeight="bold"
                                                fontSize="xl"
                                                mx="auto"
                                            >
                                                {item.preferenceRank}
                                            </Flex>
                                            <Flex justifyContent="center" gap={2} mt={1}>
                                                <TriangleUpIcon
                                                    boxSize={3}
                                                    cursor={index === 0 ? "not-allowed" : "pointer"}
                                                    opacity={index === 0 ? 0.3 : 1}
                                                    onClick={() => handleMoveUp(index)}
                                                    _hover={index !== 0 ? { bg: "brand.primary", color: "white", p: 0.5, borderRadius: "md" } : {}}
                                                />
                                                <TriangleDownIcon
                                                    boxSize={3}
                                                    cursor={index === rankedVenuesList.length - 1 ? "not-allowed" : "pointer"}
                                                    opacity={index === rankedVenuesList.length - 1 ? 0.3 : 1}
                                                    onClick={() => handleMoveDown(index)}
                                                    _hover={index !== rankedVenuesList.length - 1 ? { bg: "brand.primary", color: "white", p: 0.5, borderRadius: "md" } : {}}
                                                />
                                            </Flex>
                                        </Box>

                                        {/* Venue image placeholder */}
                                        <Box
                                            w="120px"
                                            h="80px"
                                            bg="gray.200"
                                            borderRadius="md"
                                            flexShrink={0}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {item.venue.imageUrl ? (
                                                <Image
                                                    src={item.venue.imageUrl}
                                                    alt={item.venue.name}
                                                    w="100%"
                                                    h="100%"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                />
                                            ) : (
                                                <Box w="100%" h="100%" bg="gray.300" borderRadius="md" position="relative">
                                                    {/* X pattern to indicate placeholder image */}
                                                    <Box
                                                        position="absolute"
                                                        top="0"
                                                        left="0"
                                                        right="0"
                                                        bottom="0"
                                                        bg="linear-gradient(to bottom right, transparent 48%, gray 48%, gray 52%, transparent 52%), linear-gradient(to top right, transparent 48%, gray 48%, gray 52%, transparent 52%)"
                                                    />
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Venue info text */}
                                        <Box flex="1">
                                            <Text fontWeight="bold" fontSize="md">
                                                {item.venue.name}, {item.venue.location.split(",")[0]}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                {item.venue.shortDescription}
                                            </Text>
                                            <Flex gap={2} mt={2} flexWrap="wrap">
                                                <Badge colorScheme="green" fontSize="xs">
                                                    {item.venue.capacity} guests
                                                </Badge>
                                                {item.venue.amenities.slice(0, 2).map((amenity) => (
                                                    <Badge key={amenity} colorScheme="gray" fontSize="xs">
                                                        {amenity.split(" ").slice(0, 2).join(" ")}
                                                    </Badge>
                                                ))}
                                                <Badge
                                                    colorScheme={
                                                        item.venue.availabilityStatus === "Available"
                                                            ? "green"
                                                            : "orange"
                                                    }
                                                    fontSize="xs"
                                                >
                                                    {item.venue.availabilityStatus}
                                                </Badge>
                                            </Flex>
                                            {/* Star rating sits naturally below the tags */}
                                            <Box mt={2}>
                                                {renderStarRating(item.venue.rating, item.venue.reviewCount)}
                                            </Box>
                                        </Box>

                                        {/* Right side - price + apply button */}
                                        <Box textAlign="right" minW="120px" alignSelf="flex-start">
                                            {/* X button aligned to the right, bigger and cleaner */}
                                            <Flex justifyContent="flex-end" mb={1}>
                                                <Tooltip label="Delete saved venue" placement="top" hasArrow>
                                                    <IconButton
                                                        aria-label="Delete saved venue"
                                                        icon={<SmallCloseIcon boxSize={3} />}
                                                        size="sm"
                                                        variant="ghost"
                                                        color="gray.500"
                                                        bg="gray.100"
                                                        _hover={{ color: "gray.800", bg: "gray.200" }}
                                                        onClick={() => handleDeleteVenue(item.venue.id)}
                                                    />
                                                </Tooltip>
                                            </Flex>

                                            <Text fontWeight="bold" fontSize="lg" mt={0}>
                                                ${item.venue.pricePerDay.toLocaleString()}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                per day
                                            </Text>
                                            <Button
                                                size="sm"
                                                bg="brand.primary"
                                                color="white"
                                                mt={2}
                                                _hover={{ opacity: 0.85 }}
                                                onClick={() =>
                                                    router.push(
                                                        "/hirer/apply?venueId=" + item.venue.id
                                                    )
                                                }
                                            >
                                                Apply now
                                            </Button>
                                            {/* Subtle hint if already applied */}
                                            {appliedVenueIds.has(item.venue.id) && (
                                                <Text fontSize="xs" color="green.600" mt={1}>
                                                    ✓ Applied
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>
                                ))}
                            </>
                        )}
                    </Box>
                </Box>
            </Flex>

            <Footer />
        </Flex>
    );
}
