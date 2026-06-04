// reputation.tsx - hirer's reputation page showing average star rating and rated event history.
import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import { StarIcon } from "@chakra-ui/icons";

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
} from "@chakra-ui/react";

type ReputationHistoryItem = {
  applicationID: number;
  venueName: string;
  eventName: string;
  eventDate: string;
  rating: number;
};

type ReputationResponse = {
  averageRating: number | null;
  totalRated: number;
  history: ReputationHistoryItem[];
};

export default function HirerReputation() {
  // Only hirers can access this page
  const { user } = useAuth("hirer");

  const [reputation, setReputation] = useState<ReputationResponse>({
    averageRating: null,
    totalRated: 0,
    history: [],
  });

  useEffect(() => {
    if (!user) return;
    hirerApi
      .getReputation()
      .then((data: ReputationResponse) => setReputation(data))
      .catch((error) => console.error("Failed to load reputation", error));
  }, [user]);

  // Draw 5 stars, filled up to the (rounded) rating.
  function renderStarRating(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          color={i < Math.round(rating) ? "yellow.500" : "gray.300"}
          boxSize={4}
        />,
      );
    }
    return <Flex gap={1}>{stars}</Flex>;
  }

  if (!user) return null;

  // Average shown in "0.0" style, or a friendly empty state.
  const hasRatings = reputation.averageRating !== null;
  const averageText = hasRatings
    ? reputation.averageRating!.toFixed(1)
    : "Not yet rated";

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      <Flex flex="1">
        {/* Left sidebar */}
        <HirerSidebar />

        {/* Main content */}
        <Box flex="1" p={6}>
          {/* Welcome + average rating row */}
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
                  {user.firstName} {user.lastName}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Your reputation with vendors
                </Text>
              </Box>
            </Flex>

            <Box textAlign="center">
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Average Rating
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="brand.primary">
                {averageText}
              </Text>
              {hasRatings && (
                <Flex justifyContent="center" mt={1}>
                  {renderStarRating(reputation.averageRating!)}
                </Flex>
              )}
              <Text fontSize="xs" color="gray.500" mt={1}>
                Based on {reputation.totalRated} rated event
                {reputation.totalRated === 1 ? "" : "s"}
              </Text>
            </Box>
          </Flex>

          {/* Page title */}
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              My Reputation History
            </Text>
            <Text fontSize="sm" color="gray.500">
              Past venues you have hired and the rating the vendor gave you
            </Text>
          </Box>

          {/* History table */}
          <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
            <Box bg="brand.primary" color="white" px={4} py={3}>
              <Text fontWeight="semibold">Rated Events</Text>
            </Box>

            {reputation.history.length === 0 ? (
              <Box p={6}>
                <Text color="gray.500">
                  You have no rated events yet. Once a vendor rates one of
                  your completed events it will appear here.
                </Text>
              </Box>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Venue</Th>
                    <Th>Event</Th>
                    <Th>Date</Th>
                    <Th>Rating</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reputation.history.map((item) => (
                    <Tr key={item.applicationID}>
                      <Td fontWeight="medium">{item.venueName}</Td>
                      <Td>{item.eventName}</Td>
                      <Td>
                        {item.eventDate
                          ? new Date(item.eventDate).toLocaleDateString("en-AU")
                          : "-"}
                      </Td>
                      <Td>
                        <Flex alignItems="center" gap={2}>
                          {renderStarRating(item.rating)}
                          <Text fontSize="sm">{item.rating} / 5</Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}
