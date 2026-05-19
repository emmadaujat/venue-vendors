import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
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

// One saved-venue row as it comes back from the backend.
type SavedVenueRow = {
  savedVenueID: number;
  rankingOrder: number;
  venue: Venue;
};

export default function HirerSavedVenues() {
  // Only hirers can access this page
  const { user } = useAuth("hirer");
  const router = useRouter();

  // Saved venues loaded from the database (already sorted by rank).
  const [savedRows, setSavedRows] = useState<SavedVenueRow[]>([]);

  // Credibility % comes from the compliance score (0–5 -> %).
  const [credibilityPercentage, setCredibilityPercentage] = useState(0);

  // Re-usable loader so move/delete can refresh the list.
  const loadSavedVenues = useCallback(async () => {
    try {
      const rows = await hirerApi.getSavedVenues();
      setSavedRows(rows);
    } catch (error) {
      console.error("Failed to load saved venues", error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadSavedVenues();

    hirerApi
      .getCompliance()
      .then((data: { complianceScore: number }) => {
        setCredibilityPercentage(Math.round((data.complianceScore / 5) * 100));
      })
      .catch((error) => console.error("Failed to load compliance", error));
  }, [user, loadSavedVenues]);

  // Move a venue up: swap its rank with the one above it. We write
  // both new ranks to the database, then reload so the order is
  // exactly what the server returns.
  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const current = savedRows[index];
    const above = savedRows[index - 1];
    try {
      await hirerApi.updateSavedVenueRank(current.savedVenueID, above.rankingOrder);
      await hirerApi.updateSavedVenueRank(above.savedVenueID, current.rankingOrder);
      await loadSavedVenues();
    } catch (error) {
      console.error("Failed to move venue up", error);
    }
  }

  async function handleMoveDown(index: number) {
    if (index === savedRows.length - 1) return;
    const current = savedRows[index];
    const below = savedRows[index + 1];
    try {
      await hirerApi.updateSavedVenueRank(current.savedVenueID, below.rankingOrder);
      await hirerApi.updateSavedVenueRank(below.savedVenueID, current.rankingOrder);
      await loadSavedVenues();
    } catch (error) {
      console.error("Failed to move venue down", error);
    }
  }

  async function handleDeleteVenue(savedVenueID: number) {
    try {
      await hirerApi.deleteSavedVenue(savedVenueID);
      await loadSavedVenues();
    } catch (error) {
      console.error("Failed to remove saved venue", error);
    }
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

            {savedRows.length === 0 ? (
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
                {savedRows.map((row, index) => (
                  <Flex
                    key={row.savedVenueID}
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
                        {index + 1}
                      </Flex>
                      <Flex justifyContent="center" gap={2} mt={1}>
                        <TriangleUpIcon
                          boxSize={3}
                          cursor={index === 0 ? "not-allowed" : "pointer"}
                          opacity={index === 0 ? 0.3 : 1}
                          onClick={() => handleMoveUp(index)}
                        />
                        <TriangleDownIcon
                          boxSize={3}
                          cursor={index === savedRows.length - 1 ? "not-allowed" : "pointer"}
                          opacity={index === savedRows.length - 1 ? 0.3 : 1}
                          onClick={() => handleMoveDown(index)}
                        />
                      </Flex>
                    </Box>

                    {/* Venue image */}
                    <Box
                      w="120px"
                      h="80px"
                      bg="gray.200"
                      borderRadius="md"
                      flexShrink={0}
                      overflow="hidden"
                    >
                      <Image
                        src={row.venue.imageURL}
                        alt={row.venue.name}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    </Box>

                    {/* Venue info text */}
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">
                        {row.venue.name}, {row.venue.location.split(",")[0]}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {row.venue.shortDescription}
                      </Text>
                      <Flex gap={2} mt={2} flexWrap="wrap">
                        <Badge colorScheme="green" fontSize="xs">
                          {row.venue.capacity} guests
                        </Badge>
                        {row.venue.amenities.slice(0, 2).map((amenity) => (
                          <Badge key={amenity} colorScheme="gray" fontSize="xs">
                            {amenity.split(" ").slice(0, 2).join(" ")}
                          </Badge>
                        ))}
                        <Badge
                          colorScheme={
                            row.venue.availabilityStatus === "Available" ? "green" : "orange"
                          }
                          fontSize="xs"
                        >
                          {row.venue.availabilityStatus}
                        </Badge>
                      </Flex>
                      <Box mt={2}>
                        {renderStarRating(row.venue.rating, row.venue.reviewCount)}
                      </Box>
                    </Box>

                    {/* Right side - price + apply button */}
                    <Box textAlign="right" minW="120px" alignSelf="flex-start">
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
                            onClick={() => handleDeleteVenue(row.savedVenueID)}
                          />
                        </Tooltip>
                      </Flex>

                      <Text fontWeight="bold" fontSize="lg" mt={0}>
                        ${row.venue.pricePerDay.toLocaleString()}
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
                          router.push("/hirer/apply?venueId=" + row.venue.venueID)
                        }
                      >
                        Apply now
                      </Button>
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
