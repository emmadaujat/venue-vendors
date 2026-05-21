import {
  Text,
  Flex,
  Box,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

// Predefined suitability options from the spec
const SUITABILITY_OPTIONS = ["Corporate", "Wedding", "Conference", "Gala Dinner"];

// Predefined availability options matching myVenues.tsx badge colours
const AVAILABILITY_OPTIONS = ["Available", "Limited Availability", "Not Available"];

export default function AddVenue() {
  const { user } = useAuth("vendor");

  // Form state
  // -------------------------------------------------------------------
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");
  const [suitabilityTags, setSuitabilityTags] = useState<string[]>([]);

  // Amenities are built up one at a time via the input + Add button
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  // Error and loading state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Amenity helpers
  // -------------------------------------------------------------------

  // Add the current amenity input to the list (if not empty or duplicate)
  function handleAddAmenity() {
    const trimmed = amenityInput.trim();
    if (!trimmed) return;
    if (amenities.includes(trimmed)) return;
    setAmenities([...amenities, trimmed]);
    setAmenityInput("");
  }

  // Remove an amenity from the list by name
  function handleRemoveAmenity(name: string) {
    setAmenities(amenities.filter((a) => a !== name));
  }

  // -------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------
  function validate() {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Venue name is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0)
      newErrors.capacity = "Capacity must be a positive number";
    if (!pricePerDay || isNaN(Number(pricePerDay)) || Number(pricePerDay) <= 0)
      newErrors.pricePerDay = "Price per day must be a positive number";
    if (!shortDescription.trim()) newErrors.shortDescription = "Description is required";
    if (shortDescription.length > 1000)
      newErrors.shortDescription = "Description cannot exceed 1000 characters";
    if (!imageURL.trim()) newErrors.imageURL = "Image URL is required";
    if (imageURL.length > 500) newErrors.imageURL = "Image URL cannot exceed 500 characters";

    setErrors(newErrors);

    // Returns true if no errors
    return Object.keys(newErrors).length === 0;
  }

  // -------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------
  async function handleSubmit() {
    setSubmitError("");
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // TODO: wire up to vendorApi.createVenue() when backend is ready
      console.log("Submitting venue:", {
        name,
        location,
        capacity: Number(capacity),
        pricePerDay: Number(pricePerDay),
        shortDescription,
        imageURL,
        availabilityStatus,
        suitabilityTags,
        amenities,
      });
    } catch (error) {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VendorDashboardLayout>
      {/* Back to My Venues link */}
      <NextLink href="/vendorDashboard/myVenues">
        <Text
          fontSize="sm"
          color="brand.primary"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to My Venues
        </Text>
      </NextLink>

      {/* Page title */}
      <Box mt={8} mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Add Venue
        </Text>
        <Text fontSize="sm" color="gray.500">
          Fill in the details below to list a new venue
        </Text>
      </Box>

      {/* =========================== FORM =========================== */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={6}
        maxW="800px"
        outline="brand.primary"
      >
        <Stack spacing={5}>
          {/* Venue Name */}
          <FormControl isInvalid={!!errors.name}>
            <FormLabel fontWeight="semibold">Venue Name</FormLabel>
            <Input
              placeholder="e.g. The Grand Ballroom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          {/* Location */}
          <FormControl isInvalid={!!errors.location}>
            <FormLabel fontWeight="semibold">Location</FormLabel>
            <Input
              placeholder="e.g. 123 Collins Street, Melbourne"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <FormErrorMessage>{errors.location}</FormErrorMessage>
          </FormControl>

          {/* Capacity and Price — side by side */}
          <Flex gap={4}>
            <FormControl isInvalid={!!errors.capacity}>
              <FormLabel fontWeight="semibold">Capacity</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <FormErrorMessage>{errors.capacity}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.pricePerDay}>
              <FormLabel fontWeight="semibold">Price Per Day ($)</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
              <FormErrorMessage>{errors.pricePerDay}</FormErrorMessage>
            </FormControl>
          </Flex>

          {/* Short Description */}
          <FormControl isInvalid={!!errors.shortDescription}>
            <FormLabel fontWeight="semibold">Short Description</FormLabel>
            <Textarea
              placeholder="Describe your venue..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            {/* Character count */}
            <Text fontSize="xs" color="gray.400" textAlign="right">
              {shortDescription.length}/1000
            </Text>
            <FormErrorMessage>{errors.shortDescription}</FormErrorMessage>
          </FormControl>

          {/* Image URL */}
          <FormControl isInvalid={!!errors.imageURL}>
            <FormLabel fontWeight="semibold">Image URL</FormLabel>
            <Input
              placeholder="e.g. https://example.com/image.jpg"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
            <FormErrorMessage>{errors.imageURL}</FormErrorMessage>
          </FormControl>

          {/* Availability Status */}
          <FormControl>
            <FormLabel fontWeight="semibold">Availability Status</FormLabel>
            <Select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Suitability Tags — checkboxes */}
          <FormControl>
            <FormLabel fontWeight="semibold">Suitability</FormLabel>
            <CheckboxGroup
              value={suitabilityTags}
              onChange={(values) => setSuitabilityTags(values as string[])}
            >
              <Stack direction="row" wrap="wrap" gap={3}>
                {SUITABILITY_OPTIONS.map((option) => (
                  <Checkbox key={option} value={option}>
                    {option}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </FormControl>

          {/* Amenities — type and add */}
          <FormControl>
            <FormLabel fontWeight="semibold">Amenities</FormLabel>

            {/* Input + Add button */}
            <Flex gap={2} mb={3}>
              <Input
                placeholder="e.g. Parking, WiFi, Catering"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                // Allow pressing Enter to add amenity
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddAmenity();
                }}
              />
              <Button
                onClick={handleAddAmenity}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", color: "brand.primary" }}
              >
                Add
              </Button>
            </Flex>

            {/* Display added amenities as removable tags */}
            <Flex wrap="wrap" gap={2}>
              {amenities.map((amenity) => (
                <Tag key={amenity} colorScheme="blue" borderRadius="full">
                  <TagLabel>{amenity}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveAmenity(amenity)} />
                </Tag>
              ))}
            </Flex>
          </FormControl>

          {/* Submit error message */}
          {submitError && (
            <Text color="red.500" fontSize="sm">
              {submitError}
            </Text>
          )}

          {/* Submit button */}
          <Flex justify="flex-end" gap={3}>
            <NextLink href="/vendorDashboard/myVenues">
              <Button variant="outline" borderColor="brand.primary" color="brand.primary">
                Cancel
              </Button>
            </NextLink>
            <Button
              bg="brand.primary"
              color="white"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              _hover={{ bg: "brand.secondary", color: "brand.primary" }}
            >
              Add Venue
            </Button>
          </Flex>
        </Stack>
      </Box>
    </VendorDashboardLayout>
  );
}
