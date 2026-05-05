import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Box,
  Text,
  Flex,
  Button,
  Select,
  Checkbox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image,
  Badge,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_VENUES } from "@/dummyData";
import type { Venue } from "@/types";

// All the event types pulled directly from venue data
// "All types" means show everything with no filter
// These match the suitabilityTags in dummyData.ts exactly
const EVENT_TYPE_CHOICES = ["All types", "Corporate", "Wedding", "Conference", "Gala Dinner"];

// All Melbourne suburb locations that our venues are in
// Pulled from the actual venue location fields in dummyData
// "All Melbourne" means no location filter is applied
const LOCATION_CHOICES = [
  "All Melbourne",
  "South Wharf",
  "Southbank",
  "Melbourne CBD",
  "Fitzroy",
  "St Kilda",
  "Carlton",
  "Yering",
  "Collingwood",
  "Port Melbourne",
];

// Capacity range brackets for the checkboxes
// Each bracket has a minimum and maximum number of guests
// A venue matches if its capacity falls inside the range
const CAPACITY_RANGE_BRACKETS = [
  { label: "Up to 50", minimumGuests: 0, maximumGuests: 50 },
  { label: "50 – 150", minimumGuests: 51, maximumGuests: 150 },
  { label: "150 – 300", minimumGuests: 151, maximumGuests: 300 },
  { label: "300+", minimumGuests: 301, maximumGuests: 99999 },
];

// Amenity keywords for the checkbox filters
const AMENITY_CHECKBOX_OPTIONS = [
  "AV system",       // matches v1, v9 - "Built-in AV system and projector / intelligent lighting"
  "Catering kitchen", // matches v1, v5 - "Full in-house / on-site catering kitchen"
  "Parking",         // matches v1, v3, v4, v5, v9 - valet / on-site / street parking
  "WiFi",            // matches v1, v6, v8 - "Free high-speed WiFi", "fibre WiFi", "Unlimited WiFi"
  "Terrace",         // matches v1, v5, v8 - waterfront / bay-view / rooftop terrace
];


// Sort dropdown options including suitability sorting
const SORT_DROPDOWN_OPTIONS = [
  { displayLabel: "Relevance", sortValue: "relevance" },
  { displayLabel: "Price low → high", sortValue: "price-low" },
  { displayLabel: "Price high → low", sortValue: "price-high" },
  { displayLabel: "Rating high → low", sortValue: "rating-high" },
  { displayLabel: "Rating low → high", sortValue: "rating-low" },
  { displayLabel: "Suitability", sortValue: "suitability" },
];


// Helper function: checks if a venue has an amenity
// We do a keyword match because venue amenities
// are long strings like and filters are short like "AV system""
function doesVenueHaveThisAmenity(venueAmenityList: string[], amenityKeyword: string): boolean {
  const lowerKeyword = amenityKeyword.toLowerCase();
  for (let i = 0; i < venueAmenityList.length; i++) {
    if (venueAmenityList[i].toLowerCase().includes(lowerKeyword)) {
      return true;
    }
  }
  return false;
}


// Helper function: checks if a search term matches a venue
// Searches across venue name, location, capacity number,
// AND suitability tags (event type) as required by V2
// This is what "recommended suitability" means in the spec
function doesVenueMatchSearchTerm(venue: Venue, searchTerm: string): boolean {
  const lowerSearch = searchTerm.toLowerCase().trim();
  if (lowerSearch === "") return true;

  // check venue name
  if (venue.name.toLowerCase().includes(lowerSearch)) return true;
  // check venue location
  if (venue.location.toLowerCase().includes(lowerSearch)) return true;
  // check capacity as a number string (e.g. searching "250" finds 250 capacity venues)
  if (venue.capacity.toString().includes(lowerSearch)) return true;
  // check suitability tags (event types like Corporate, Wedding etc.)
  for (let i = 0; i < venue.suitabilityTags.length; i++) {
    if (venue.suitabilityTags[i].toLowerCase().includes(lowerSearch)) return true;
  }
  // check short description too for broader results
  if (venue.shortDescription.toLowerCase().includes(lowerSearch)) return true;

  return false;
}

export default function BrowseVenues() {
  // useAuth() with no parameter means this is a public page - no redirect
  const { isLoggedIn, isHirer } = useAuth();
  const router = useRouter();

  // Search bar text that the user has typed
  // This filters by name, location, capacity, suitability as required by user story V2
  const [searchBarText, setSearchBarText] = useState("");

  // Filter state - what the user has picked in the sidebar
  const [chosenEventType, setChosenEventType] = useState("All types");
  const [chosenLocation, setChosenLocation] = useState("All Melbourne");
  const [chosenCapacityRanges, setChosenCapacityRanges] = useState<string[]>([]);
  const [maximumDailyRate, setMaximumDailyRate] = useState(10000);
  const [chosenAmenities, setChosenAmenities] = useState<string[]>([]);
  const [chosenSortOption, setChosenSortOption] = useState("relevance");

  // Read URL query parameters when page loads
  // - ?category=Corporate comes from the landing page links
  // - ?search=something comes from the navbar search bar
  useEffect(() => {
    if (!router.isReady) return;

    // if coming from landing page with a category like "Corporate" or "Conferences"
    if (router.query.category) {
      const categoryFromUrl = router.query.category as string;
      // handle both "Conference" and "Conferences" from landing page
      if (categoryFromUrl.toLowerCase() === "conferences") {
        setChosenEventType("Conference");
      } else {
        setChosenEventType(categoryFromUrl);
      }
    }

    // if coming from navbar search bar
    if (router.query.search) {
      setSearchBarText(router.query.search as string);
    }
  }, [router.isReady, router.query.category, router.query.search]);


  // Toggle a capacity checkbox on or off
  function handleCapacityCheckboxToggle(capacityLabel: string) {
    if (chosenCapacityRanges.includes(capacityLabel)) {
      // it was already checked, so uncheck it by removing from list
      setChosenCapacityRanges(chosenCapacityRanges.filter((item) => item !== capacityLabel));
    } else {
      // it was not checked, so check it by adding to list
      setChosenCapacityRanges([...chosenCapacityRanges, capacityLabel]);
    }
  }

  // Toggle an amenity checkbox on or off
  function handleAmenityCheckboxToggle(amenityName: string) {
    if (chosenAmenities.includes(amenityName)) {
      setChosenAmenities(chosenAmenities.filter((item) => item !== amenityName));
    } else {
      setChosenAmenities([...chosenAmenities, amenityName]);
    }
  }

  // "Clear all" button resets every filter back to default
  function handleClearAllFilters() {
    setSearchBarText("");
    setChosenEventType("All types");
    setChosenLocation("All Melbourne");
    setChosenCapacityRanges([]);
    setMaximumDailyRate(10000);
    setChosenAmenities([]);
    setChosenSortOption("relevance");
  }

  // Build the filtered list of venues to display
  // Filters apply in real time as the user changes them
  // Start with all 9 venues then narrow down
  let venuesToDisplay: Venue[] = [...DEFAULT_VENUES];
  // the ... creates a copy of the array so we don't mutate the original data

  // --- Filter by search bar text (V2: search by name, location, capacity, suitability) ---
  if (searchBarText.trim() !== "") {
    venuesToDisplay = venuesToDisplay.filter((venue) =>
      doesVenueMatchSearchTerm(venue, searchBarText)
    );
  }

  // --- Filter by event type dropdown ---
  if (chosenEventType !== "All types") {
    venuesToDisplay = venuesToDisplay.filter((venue) => {
      // check if any of the venue suitability tags match the chosen event type
      for (let i = 0; i < venue.suitabilityTags.length; i++) {
        if (venue.suitabilityTags[i].toLowerCase() === chosenEventType.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
  }

  // --- Filter by location dropdown ---
  if (chosenLocation !== "All Melbourne") {
    venuesToDisplay = venuesToDisplay.filter((venue) =>
      venue.location.toLowerCase().includes(chosenLocation.toLowerCase())
    );
  }

  // --- Filter by capacity checkboxes (if any are ticked) ---
  if (chosenCapacityRanges.length > 0) {
    venuesToDisplay = venuesToDisplay.filter((venue) => {
      // venue passes if it falls within ANY of the ticked ranges
      for (let i = 0; i < CAPACITY_RANGE_BRACKETS.length; i++) {
        const bracket = CAPACITY_RANGE_BRACKETS[i];
        if (chosenCapacityRanges.includes(bracket.label)) {
          if (venue.capacity >= bracket.minimumGuests && venue.capacity <= bracket.maximumGuests) {
            return true;
          }
        }
      }
      return false;
    });
  }

  // --- Filter by maximum daily rate slider ---
  venuesToDisplay = venuesToDisplay.filter((venue) => venue.pricePerDay <= maximumDailyRate);

  // --- Filter by amenities ---
  if (chosenAmenities.length > 0) {
    venuesToDisplay = venuesToDisplay.filter((venue) => {
      for (let i = 0; i < chosenAmenities.length; i++) {
        if (!doesVenueHaveThisAmenity(venue.amenities, chosenAmenities[i])) {
          return false;
        }
      }
      return true;
    });
  }


  // Sort the filtered venues based on the chosen sort option
  if (chosenSortOption === "price-low") {
    venuesToDisplay.sort((a, b) => a.pricePerDay - b.pricePerDay);
  } else if (chosenSortOption === "price-high") {
    venuesToDisplay.sort((a, b) => b.pricePerDay - a.pricePerDay);
  } else if (chosenSortOption === "rating-high") {
    venuesToDisplay.sort((a, b) => b.rating - a.rating);
  } else if (chosenSortOption === "rating-low") {
    venuesToDisplay.sort((a, b) => a.rating - b.rating);
  } else if (chosenSortOption === "suitability") {
    // sort by number of suitability tags (most versatile venues first)
    venuesToDisplay.sort((a, b) => b.suitabilityTags.length - a.suitabilityTags.length);
  }
  // "relevance" keeps the default order from dummyData

  // Count how many venues passed all the filters
  const numberOfVenuesFound = venuesToDisplay.length;

  // When user clicks a venue card or "View details" link
  // Takes them to the individual venue detail page
  function handleGoToVenueDetail(venueId: string) {
    router.push("/venues/" + venueId);
  }

  // Save venue to localStorage for the saved venues page
  // Used by the "+ Save" button on each venue card
  function handleSaveVenueToList(venue: Venue) {
    if (!isLoggedIn) {
      router.push("/signin");
      return;
    }

    // get the current saved venues from localStorage
    const savedVenuesString = localStorage.getItem("savedVenues");
    let currentSavedVenues: Venue[] = [];
    if (savedVenuesString) {
      currentSavedVenues = JSON.parse(savedVenuesString);
    }

    // check if this venue is already in the saved list
    const venueAlreadySaved = currentSavedVenues.find((v) => v.id === venue.id);
    if (venueAlreadySaved) {
      alert("This venue is already in your saved list!");
      return;
    }

    // add it to the list and save back
    currentSavedVenues.push(venue);
    localStorage.setItem("savedVenues", JSON.stringify(currentSavedVenues));
    alert("Venue saved to your preferred list!");
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />

      {/* Main content area: sidebar on the left, venue list on the right */}
      <Flex flex="1" px="30px" py="20px" gap={6}>

        {/* LEFT SIDEBAR - FILTERS */}
        <Box width="220px" flexShrink={0}>
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            Filters
          </Text>

          {/* --- Event type dropdown --- */}
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Event type
          </Text>
          <Select
            size="sm"
            mb={4}
            value={chosenEventType}
            onChange={(e) => setChosenEventType(e.target.value)}
            borderColor="gray.300"
          >
            {EVENT_TYPE_CHOICES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </Select>

          {/* --- Location dropdown --- */}
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Location
          </Text>
          <Select
            size="sm"
            mb={4}
            value={chosenLocation}
            onChange={(e) => setChosenLocation(e.target.value)}
            borderColor="gray.300"
          >
            {LOCATION_CHOICES.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>

          {/* --- Capacity checkboxes --- */}
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Capacity
          </Text>
          <Box mb={4}>
            {CAPACITY_RANGE_BRACKETS.map((bracket) => (
              <Checkbox
                key={bracket.label}
                size="sm"
                mb={1}
                isChecked={chosenCapacityRanges.includes(bracket.label)}
                onChange={() => handleCapacityCheckboxToggle(bracket.label)}
                colorScheme="purple"
                display="block"
              >
                {bracket.label}
              </Checkbox>
            ))}
          </Box>

          {/* --- Max daily rate slider --- */}
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Max daily rate
          </Text>
          <Text fontSize="sm" fontWeight="bold" mb={1}>
            ${maximumDailyRate.toLocaleString()}
          </Text>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={maximumDailyRate}
            onChange={(newValue) => setMaximumDailyRate(newValue)}
            mb={4}
            colorScheme="purple"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          {/* --- Amenities checkboxes --- */}
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Amenities
          </Text>
          <Box mb={4}>
            {AMENITY_CHECKBOX_OPTIONS.map((amenity) => (
              <Checkbox
                key={amenity}
                size="sm"
                mb={1}
                isChecked={chosenAmenities.includes(amenity)}
                onChange={() => handleAmenityCheckboxToggle(amenity)}
                colorScheme="purple"
                display="block"
              >
                {amenity}
              </Checkbox>
            ))}
          </Box>



          {/* --- Apply filters button --- */}
          <Button
            width="100%"
            bg="brand.primary"
            color="white"
            size="sm"
            mb={2}
            _hover={{ opacity: 0.85 }}
          >
            Apply filters
          </Button>

          {/* --- Clear all button --- */}
          <Button
            width="100%"
            variant="outline"
            borderColor="gray.300"
            size="sm"
            onClick={handleClearAllFilters}
          >
            Clear all
          </Button>
        </Box>

        {/* RIGHT SIDE - VENUE LIST */}
        <Box flex="1">
          {/* --- Top bar: venue count + sort dropdown --- */}
          {/* Search is handled by the navbar search bar above - see navbar.tsx */}
          <Flex justify="space-between" align="center" mb={4} gap={4}>
            <Text fontWeight="semibold" whiteSpace="nowrap">
              {numberOfVenuesFound} venues found
            </Text>
            <Select
              width="220px"
              size="sm"
              value={chosenSortOption}
              onChange={(e) => setChosenSortOption(e.target.value)}
              bg="brand.primary"
              color="white"
              borderRadius="md"
              flexShrink={0}
            >
              {SORT_DROPDOWN_OPTIONS.map((option) => (
                <option
                  key={option.sortValue}
                  value={option.sortValue}
                  style={{ color: "black" }}
                >
                  Sort: {option.displayLabel}
                </option>
              ))}
            </Select>
          </Flex>

          {/* --- "No venues found" message (V1 acceptance criteria 3) --- */}
          {numberOfVenuesFound === 0 && (
            <Box
              textAlign="center"
              py={10}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                No venues found
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Try adjusting your filters or clearing them to see all venues.
              </Text>
            </Box>
          )}

          {/* --- Venue cards in a vertical list --- */}
          {venuesToDisplay.map((venue) => (
            <Box
              key={venue.id}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              p={5}
              mb={4}
              bg="white"
              boxShadow="sm"
              cursor="pointer"
              onClick={() => handleGoToVenueDetail(venue.id)}
              _hover={{ boxShadow: "md" }}
            >
              <Flex gap={5}>
                {/* Venue image on the left */}
                <Image
                  src={venue.imageUrl}
                  alt={venue.name}
                  width="180px"
                  height="140px"
                  objectFit="cover"
                  borderRadius="md"
                  bg="gray.100"
                />

                {/* Venue info in the middle */}
                <Box flex="1">
                  <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                    {venue.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {venue.location}
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={3}>
                    {venue.shortDescription}
                  </Text>

                  {/* Tags row: capacity badge, feature tags, availability badge */}
                  <Flex gap={2} flexWrap="wrap">
                    <Badge bg="green.100" color="green.800" fontSize="xs" px={2} py={1} borderRadius="md">
                      {venue.capacity} guests
                    </Badge>
                    {venue.amenities.slice(0, 2).map((amenityItem) => (
                      <Badge key={amenityItem} bg="gray.100" color="gray.700" fontSize="xs" px={2} py={1} borderRadius="md">
                        {amenityItem.length > 25 ? amenityItem.substring(0, 25) + "..." : amenityItem}
                      </Badge>
                    ))}
                    <Badge
                      bg={venue.availabilityStatus === "Available" ? "green.100" : "orange.100"}
                      color={venue.availabilityStatus === "Available" ? "green.800" : "orange.800"}
                      fontSize="xs" px={2} py={1} borderRadius="md"
                    >
                      {venue.availabilityStatus}
                    </Badge>
                  </Flex>
                </Box>

                {/* Right section - rating, price, view details link, save button */}
                <Box textAlign="right" minWidth="130px">
                  <Flex justify="flex-end" align="center" gap={1} mb={1}>
                    <StarIcon color="yellow.500" boxSize={3} />
                    <Text fontSize="sm" fontWeight="semibold">
                      {venue.rating} ({venue.reviewCount})
                    </Text>
                  </Flex>
                  <Text fontWeight="bold" fontSize="xl">
                    ${venue.pricePerDay.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    per day
                  </Text>

                  {/* View details link */}
                  <Text
                    fontSize="sm"
                    color="brand.primary"
                    fontWeight="semibold"
                    _hover={{ textDecoration: "underline" }}
                    mb={2}
                  >
                    View details →
                  </Text>

                  {/* Save venue button */}
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor="brand.primary"
                    color="brand.primary"
                    onClick={(e) => {
                      // stop the card click from also firing when save is clicked
                      e.stopPropagation();
                      handleSaveVenueToList(venue);
                    }}
                    _hover={{ bg: "brand.secondary" }}
                  >
                    + Save Venue
                  </Button>
                </Box>
              </Flex>
            </Box>
          ))}
        </Box>
      </Flex>

      <Footer />
    </Box>
  );
}
