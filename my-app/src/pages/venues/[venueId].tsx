// This is the individual venue detail page
// URL looks like /venues/v1, /venues/v2 etc.
// The [venueId] part of the file name means Next.js will
// read the venue ID from the URL and we can use that to show the right details

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { Box, Text, Flex, Button, Image, Badge, Select } from "@chakra-ui/react";
import { StarIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import type { Venue } from "@/types";

// CR CHANGE 2 - the pre-defined "recommended suitability"
// keywords from the assignment spec.
const SUITABILITY_KEYWORDS = [
  "tennis",
  "dinner",
  "classical music",
  "rock concert",
  "birthday",
  "wedding",
];

// Simple calendar helpers to build month grids
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];


export default function VenueDetailPage() {
  const router = useRouter();
  const { isLoggedIn, isHirer } = useAuth();

  // Read the venue ID from the URL (e.g. /venues/3 -> 3)
  const venueIdFromUrl = router.query.venueId as string;

  // The venue we are showing, loaded from the backend.
  const [thisVenue, setThisVenue] = useState<Venue | null>(null);

  // The vendor's blocked date ranges for this venue, from the DB.
  const [blockedPeriods, setBlockedPeriods] = useState<
    { startDate: string; endDate: string }[]
  >([]);

  // CR2: the keyword the hirer is checking suitability for, and
  // the result from GET /api/venues/:id/suitability.
  const [suitabilityKeyword, setSuitabilityKeyword] = useState("");
  const [suitabilityResult, setSuitabilityResult] = useState<{
    matched: string[];
    score: number;
  } | null>(null);

  // Ask the backend how well this venue suits the chosen keyword.
  async function checkSuitability(keyword: string) {
    setSuitabilityKeyword(keyword);
    if (!keyword) {
      setSuitabilityResult(null);
      return;
    }
    try {
      const result = await hirerApi.getVenueSuitability(
        parseInt(venueIdFromUrl),
        keyword,
      );
      setSuitabilityResult({ matched: result.matched, score: result.score });
    } catch (error) {
      console.error("Failed to check suitability", error);
    }
  }

  // Fetch the venue + its blocked dates once the URL is ready.
  useEffect(() => {
    if (!venueIdFromUrl) return;
    const venueID = parseInt(venueIdFromUrl);
    hirerApi
      .getVenueDetail(venueID)
      .then((data) => {
        setThisVenue(data.venue);
        setBlockedPeriods(data.blockedDates);
      })
      .catch((error) => console.error("Failed to load venue", error));
  }, [venueIdFromUrl]);

  // Calendar state - which month we are showing
  // Default to April 2026 as a sample starting month
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(3); // 0-indexed so 3 = April

  const totalDaysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDayOfWeek = getFirstDayOfMonth(calendarYear, calendarMonth);

  // A day is "available" if it is today or later AND it does not
  // fall inside any blocked range the vendor set in the database.
  function isDayAvailable(day: number): boolean {
    if (!thisVenue) return false;

    const currentDate = new Date(calendarYear, calendarMonth, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (currentDate < today) return false; // past dates are not bookable

    // Blocked by the vendor?
    for (const period of blockedPeriods) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      if (currentDate >= start && currentDate <= end) {
        return false;
      }
    }
    return true;
  }

  // Navigate calendar months
  function goToPreviousMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }

  function goToNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }

  // Save this venue to the hirer's saved list in the DATABASE.
  // Visitors are sent to sign in first.
  async function handleSaveVenue() {
    if (!isLoggedIn || !isHirer) {
      router.push("/signin");
      return;
    }
    if (!thisVenue) return;

    try {
      const saved = await hirerApi.getSavedVenues();
      await hirerApi.saveVenue(thisVenue.venueID, saved.length + 1);
      alert("Venue saved to your preferred list!");
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 409) {
        alert("This venue is already in your saved list!");
      } else {
        alert("Could not save venue. Please try again.");
      }
    }
  }

  // If venue not found yet, show loading message
  if (!thisVenue) {
    return (
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <NavBar />
        <Box flex="1" p="40px" textAlign="center">
          <Text fontSize="lg" color="gray.500">
            Loading venue details...
          </Text>
        </Box>
        <Footer />
      </Box>
    );
  }

  // Build the calendar grid cells
  const calendarCells: React.ReactNode[] = [];

  // empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(<Box key={"empty-" + i} w="27px" h="27px" />);
  }

  // actual day cells - highlighted in purple if available
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const available = isDayAvailable(day);
    calendarCells.push(
      <Flex
        key={"day-" + day}
        w="27px"
        h="27px"
        justify="center"
        align="center"
        borderRadius="full"
        bg={available ? "brand.secondary" : "transparent"}
        color={available ? "brand.primary" : "gray.400"}
        fontWeight={available ? "bold" : "normal"}
        fontSize="xs"
        cursor={available ? "pointer" : "default"}
      >
        {day}
      </Flex>,
    );
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />

      {/* MAIN CONTENT - just venue details */}
      <Box flex="1" px="40px" py="20px" maxWidth="1100px" mx="auto" width="100%">
        {/* Back to venues link */}
        <Flex
          align="center"
          gap={1}
          mb={4}
          cursor="pointer"
          onClick={() => router.push("/browseVenues")}
          _hover={{ textDecoration: "underline" }}
          color="gray.600"
        >
          <ArrowBackIcon />
          <Text fontSize="sm">Back to Venues</Text>
        </Flex>

        {/* Top section: image + details + price/calendar */}
        <Flex gap={6} mb={6}>
          {/* Large venue image */}
          <Image
            src={thisVenue.imageURL}
            alt={thisVenue.name}
            width="340px"
            height="260px"
            objectFit="cover"
            borderRadius="lg"
            bg="gray.100"
          />

          {/* Venue name, location, rating, description */}
          <Box flex="2">
            <Text fontWeight="bold" fontSize="2xl" color="brand.primary">
              {thisVenue.name}
            </Text>
            <Text fontSize="md" color="gray.500" mb={2}>
              {thisVenue.location}
            </Text>

            {/* Star rating */}
            <Flex align="center" gap={1} mb={3}>
              <StarIcon color="yellow.500" boxSize={4} />
              <Text fontWeight="bold" fontSize="lg">
                {thisVenue.rating} ({thisVenue.reviewCount})
              </Text>
            </Flex>

            <Text fontSize="sm" color="gray.700" mb={4} lineHeight="tall">
              {thisVenue.shortDescription}
            </Text>

            {/* Tags: capacity, amenity highlights, availability */}
            <Flex gap={2} flexWrap="wrap">
              <Badge bg="green.100" color="green.800" fontSize="xs" px={2} py={1} borderRadius="md">
                {thisVenue.capacity} guests
              </Badge>
              {thisVenue.amenities.slice(0, 2).map((amenityItem) => (
                <Badge
                  key={amenityItem}
                  bg="gray.100"
                  color="gray.700"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {amenityItem.length > 30 ? amenityItem.substring(0, 30) + "..." : amenityItem}
                </Badge>
              ))}
              <Badge
                bg={thisVenue.availabilityStatus === "Available" ? "green.100" : "orange.100"}
                color={thisVenue.availabilityStatus === "Available" ? "green.800" : "orange.800"}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {thisVenue.availabilityStatus}
              </Badge>
            </Flex>
          </Box>

          {/* Right column - save button, price, calendar */}
          <Box width="210px" flexShrink={0}>
            {/* Save venue button */}
            <Button
              bg="brand.primary"
              color="white"
              size="sm"
              mb={4}
              width="100%"
              onClick={handleSaveVenue}
              _hover={{
                bg: "transparent",
                border: "2px solid",
                borderColor: "brand.primary",
                color: "brand.primary",
              }}
            >
              + Save Venue
            </Button>

            {/* Apply now button */}
            <Button
              bg="brand.primary"
              color="white"
              size="sm"
              mb={4}
              width="100%"
              onClick={() => router.push("/hirer/apply?venueId=" + thisVenue.venueID)}
              _hover={{
                bg: "transparent",
                border: "2px solid",
                borderColor: "brand.primary",
                color: "brand.primary",
              }}
            >
              Apply Now
            </Button>

            {/* Price display */}
            <Text fontWeight="bold" fontSize="2xl" textAlign="center">
              ${thisVenue.pricePerDay.toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
              per day
            </Text>

            {/* Availability calendar */}
            <Box border="1px solid" borderColor="gray.200" borderRadius="lg" p={3}>
              <Text fontWeight="semibold" fontSize="sm" mb={2} textAlign="center">
                Dates Available:
              </Text>

              {/* Month navigation arrows */}
              <Flex justify="space-between" align="center" mb={2}>
                <Text
                  cursor="pointer"
                  fontSize="sm"
                  onClick={goToPreviousMonth}
                  _hover={{ color: "brand.primary" }}
                >
                  ←
                </Text>
                <Text fontWeight="bold" fontSize="sm">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </Text>
                <Text
                  cursor="pointer"
                  fontSize="sm"
                  onClick={goToNextMonth}
                  _hover={{ color: "brand.primary" }}
                >
                  →
                </Text>
              </Flex>

              {/* Day of week headers */}
              <Flex gap={0} mb={1}>
                {DAY_HEADERS.map((header, index) => (
                  <Box key={index} w="27px" textAlign="center">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500">
                      {header}
                    </Text>
                  </Box>
                ))}
              </Flex>

              {/* Calendar day grid */}
              <Flex flexWrap="wrap" gap={0}>
                {calendarCells}
              </Flex>
            </Box>
          </Box>
        </Flex>

        {/* Full amenities list */}
        <Box mb={6}>
          <Text fontWeight="bold" fontSize="lg" mb={3} color="brand.primary">
            All Amenities
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {thisVenue.amenities.map((amenityItem) => (
              <Badge
                key={amenityItem}
                bg="brand.secondary"
                color="brand.primary"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="md"
              >
                {amenityItem}
              </Badge>
            ))}
          </Flex>
        </Box>

        {/* CR2: Check this venue's recommended suitability.
            The hirer picks "I'm planning a..." and we ask the
            backend (GET /api/venues/:id/suitability) how well
            this venue's tags match that keyword. */}
        <Box mb={6} p={4} bg="purple.50" borderRadius="md">
          <Text fontWeight="bold" fontSize="lg" mb={2} color="brand.primary">
            Check recommended suitability
          </Text>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Select what you are planning to see how well this venue suits it.
          </Text>
          <Select
            placeholder="I'm planning a..."
            maxW="280px"
            size="sm"
            bg="white"
            value={suitabilityKeyword}
            onChange={(e) => checkSuitability(e.target.value)}
          >
            {SUITABILITY_KEYWORDS.map((keyword) => (
              <option key={keyword} value={keyword}>
                {keyword}
              </option>
            ))}
          </Select>

          {suitabilityResult && (
            <Box mt={3}>
              {suitabilityResult.matched.length > 0 ? (
                <Flex alignItems="center" gap={2} flexWrap="wrap">
                  <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="md">
                    ★ Recommended for {suitabilityKeyword}
                  </Badge>
                  <Text fontSize="sm" color="gray.700">
                    Match score: {Math.round(suitabilityResult.score * 100)}%
                  </Text>
                </Flex>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  This venue is not specifically recommended for{" "}
                  <strong>{suitabilityKeyword}</strong>, but you can still
                  apply.
                </Text>
              )}
            </Box>
          )}
        </Box>

        {/* Suitable for section (suitability tags) */}
        <Box mb={6}>
          <Text fontWeight="bold" fontSize="lg" mb={3} color="brand.primary">
            Suitable For
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {thisVenue.suitabilityTags.map((tag) => (
              <Badge
                key={tag}
                bg="purple.50"
                color="brand.primary"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="md"
                border="1px solid"
                borderColor="brand.primary"
              >
                {tag}
              </Badge>
            ))}
          </Flex>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
