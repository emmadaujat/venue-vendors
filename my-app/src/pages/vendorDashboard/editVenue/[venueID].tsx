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
  Image,
  Badge,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVendorVenues } from "@/hooks/vendor/useVendorVenues";
import { vendorApi } from "@/services/vendorApi";

import {
  isValidVenueName,
  isValidLocation,
  isValidCapacity,
  isValidPricePerDay,
  isValidDescription,
  isValidImageURL,
} from "@/venueValidation";

// Hardcoded suitability tags
// TODO: check if a look up table needs to be added for suitability options
const SUITABILITY_OPTIONS = ["Corporate", "Wedding", "Conference", "Gala Dinner"];

// venue availability drop down
const AVAILABILITY_OPTIONS = ["Available", "Limited Availability", "Not Available"];

export default function EditVenue() {
  const router = useRouter();
  const { venueID } = router.query;
  const { user } = useAuth("vendor");

  // Fetch all vendor venues from hook
  const { venues, isLoading: venuesLoading } = useVendorVenues();

  // Find the specific venue by ID from the URL
  const venue = venues.find((v) => v.venueID === parseInt(venueID as string));

  // ===========================================================
  // Form state — all pre-populated from the venue once it loads
  // ===========================================================
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");
  const [suitabilityTags, setSuitabilityTags] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  // ===========================================================
  // Per-field validation error states
  // ===========================================================
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [imageURLError, setImageURLError] = useState<string | null>(null);

  // ===========================================================
  // Submission state
  // ===========================================================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  // ===========================================================
  // Save preview modal — shown before confirming the update
  // ===========================================================
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  // ===========================================================
  // Delete confirmation dialog
  // ===========================================================
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const cancelRef = useRef<HTMLButtonElement>(null);

  // -------------------------------------------------------------------
  // Pre-populate form fields once venue data is loaded from venue details
  // -------------------------------------------------------------------
  useEffect(() => {
    if (venue) {
      setName(venue.name);
      setLocation(venue.location);
      setCapacity(String(venue.capacity));
      setPricePerDay(String(venue.pricePerDay));
      setShortDescription(venue.shortDescription);
      setImageURL(venue.imageURL);
      setAvailabilityStatus(venue.availabilityStatus);
      setSuitabilityTags(venue.suitabilityTags ?? []);
      setAmenities(venue.amenities ?? []);
    }
  }, [venue]);

  // -------------------------------------------------------------------
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

  // ===========================================================
  // Validation — runs all field checks and sets error states.
  // Returns true if the form is valid, false if anything fails.
  // ===========================================================
  function validate(): boolean {
    const nameErr = isValidVenueName(name);
    const locationErr = isValidLocation(location);
    const capacityErr = isValidCapacity(capacity);
    const priceErr = isValidPricePerDay(pricePerDay);
    const descriptionErr = isValidDescription(shortDescription);
    const imageURLErr = isValidImageURL(imageURL);

    // Set all errors so they all display at once
    setNameError(nameErr);
    setLocationError(locationErr);
    setCapacityError(capacityErr);
    setPriceError(priceErr);
    setDescriptionError(descriptionErr);
    setImageURLError(imageURLErr);

    return !nameErr && !locationErr && !capacityErr && !priceErr && !descriptionErr && !imageURLErr;
  }

  // ===========================================================
  // Save button click — validates first, then opens preview modal
  // ===========================================================
  function handleSaveClick() {
    setSubmitError("");
    if (validate()) {
      onPreviewOpen();
    }
  }

  // ===========================================================
  // Confirm save — called when vendor clicks Save in the preview modal
  // ===========================================================
  async function handleConfirmSave() {
    if (!venue) return;
    setIsSubmitting(true);
    try {
      await vendorApi.updateVenue(venue.venueID, {
        name,
        location,
        capacity: Number(capacity),
        pricePerDay: Number(pricePerDay),
        shortDescription,
        imageURL,
        availabilityStatus,
        amenities,
        suitabilityTags,
      });
      setSaveSuccess(true);
      // Show success message for 1.5 seconds then redirect
      setTimeout(() => {
        onPreviewClose();
        setSaveSuccess(false);
        router.push("/vendorDashboard/myVenues");
      }, 1500);
    } catch (error) {
      setSubmitError("Something went wrong saving the venue. Please try again.");
      onPreviewClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  // ===========================================================
  // Confirm delete — called when vendor confirms in the delete dialog
  // ===========================================================
  async function handleConfirmDelete() {
    if (!venue) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await vendorApi.deleteVenue(venue.venueID);
      onDeleteClose();
      router.push("/vendorDashboard/myVenues");
    } catch (error) {
      setDeleteError("Something went wrong deleting the venue. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  // ===========================================================
  // Helper — availability badge colour (matches myVenues.tsx)
  // ===========================================================
  function getAvailabilityColor(status: string) {
    if (status === "Available") return "green";
    if (status === "Limited Availability") return "orange";
    return "red";
  }

  // ===========================================================
  // Loading state — show spinner while venues are being fetched
  // ===========================================================
  if (venuesLoading) {
    return (
      <VendorDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </VendorDashboardLayout>
    );
  }

  // ===========================================================
  // if venue not found or doesn't belong to this vendor
  // ===========================================================
  if (!venue) {
    return (
      <VendorDashboardLayout>
        <Text color="gray.500">Venue not found or you do not have permission to edit it.</Text>
      </VendorDashboardLayout>
    );
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
      <Flex justify="space-between" mt={8} mb={4} maxW="80%">
        <Box mt={8} mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Edit Venue - {venue.name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Update your venue details below
          </Text>
        </Box>

        <Flex gap={3}>
          <NextLink href="/vendorDashboard/myVenues">
            <Button variant="outline" borderColor="brand.primary" color="brand.primary">
              Cancel
            </Button>
          </NextLink>
          <Button
            bg="brand.primary"
            color="white"
            onClick={handleSaveClick}
            isLoading={isSubmitting}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            Save
          </Button>
        </Flex>
      </Flex>

      {/* ===================== AVAILABILITY STATUS ===================== */}
      {/* Shown above the form */}
      <Flex align="center" gap={3} mb={6}>
        <Select
          value={availabilityStatus}
          onChange={(e) => setAvailabilityStatus(e.target.value)}
          w="220px"
          fontWeight="semibold"
          bg="brand.primary"
          color="white"
          borderColor="brand.primary"
          sx={{ "& option": { background: "white", color: "black" } }}
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        {/* Live badge preview next to the dropdown */}
        <Badge colorScheme={getAvailabilityColor(availabilityStatus)} fontSize="sm" px={3} py={1}>
          {availabilityStatus}
        </Badge>
      </Flex>

      {/* ===================== VENUE DETAILS FORM CARD ===================== */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8} maxW="80%">
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            Venue Details
          </Text>
        </Flex>

        <Box p={6}>
          <Stack spacing={5}>
            {/* Venue Name + Location */}
            <Flex gap={4}>
              <FormControl isInvalid={!!nameError} flex="1">
                <FormLabel fontWeight="semibold">
                  Venue Name <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null); // clear error on change
                  }}
                  placeholder="e.g. The Grand Ballroom"
                />
                <FormErrorMessage>{nameError}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!locationError} flex="1">
                <FormLabel fontWeight="semibold">
                  Venue Location <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setLocationError(null);
                  }}
                  placeholder="e.g. 123 Collins Street, Melbourne"
                />
                <FormErrorMessage>{locationError}</FormErrorMessage>
              </FormControl>
            </Flex>

            {/* Capacity + Price + Rate — three-column row */}
            <Flex gap={4}>
              <FormControl isInvalid={!!capacityError} flex="1">
                <FormLabel fontWeight="semibold">
                  Capacity <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => {
                    setCapacity(e.target.value);
                    setCapacityError(null);
                  }}
                  placeholder="e.g. 200"
                />
                <FormErrorMessage>{capacityError}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!priceError} flex="0.5">
                <FormLabel fontWeight="semibold">
                  Price <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  type="number"
                  value={pricePerDay}
                  onChange={(e) => {
                    setPricePerDay(e.target.value);
                    setPriceError(null);
                  }}
                  placeholder="e.g. 500"
                />
                <FormErrorMessage>{priceError}</FormErrorMessage>
              </FormControl>

              {/* Rate is always Per Day — read-only */}
              <FormControl flex="0.5">
                <FormLabel fontWeight="semibold">Rate</FormLabel>
                <Select isReadOnly value="per_day" bg="gray.50">
                  <option value="per_day">Per Day</option>
                </Select>
              </FormControl>
            </Flex>

            {/* Venue Description */}
            <FormControl isInvalid={!!descriptionError}>
              <FormLabel fontWeight="semibold">
                Venue Description <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Textarea
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  setDescriptionError(null);
                }}
                placeholder="Describe your venue..."
                maxLength={1000}
                rows={4}
              />
              {/* Character count */}
              <Text fontSize="xs" color="gray.400" textAlign="right">
                {shortDescription.length}/1000
              </Text>
              <FormErrorMessage>{descriptionError}</FormErrorMessage>
            </FormControl>

            {/* Venue Image URL */}
            <FormControl isInvalid={!!imageURLError}>
              <FormLabel fontWeight="semibold">
                Venue Image <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Input
                value={imageURL}
                onChange={(e) => {
                  setImageURL(e.target.value);
                  setImageURLError(null);
                }}
                placeholder="Update venue image URL"
              />
              <FormErrorMessage>{imageURLError}</FormErrorMessage>
            </FormControl>
          </Stack>
        </Box>
      </Box>

      {/* ===================== AMENITIES CARD ===================== */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        mb={6}
        maxW="80%"
      >
        <Box bg="brand.primary" p={4}>
          <Text color="white" fontWeight="semibold">
            + Amenities
          </Text>
        </Box>

        <Box p={6}>
          {/* Existing amenities — each shown as a deletable row  */}
          {amenities.length > 0 && (
            <Stack spacing={2} mb={4}>
              {amenities.map((amenity) => (
                <Flex
                  key={amenity}
                  justify="space-between"
                  align="center"
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Text fontSize="sm">{amenity}</Text>
                  <Text
                    fontSize="sm"
                    color="red.400"
                    fontWeight="semibold"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => handleRemoveAmenity(amenity)}
                  >
                    Delete
                  </Text>
                </Flex>
              ))}
            </Stack>
          )}

          {/* Add new amenity input */}
          <Flex gap={2} pt={4}>
            <Input
              placeholder="e.g. Parking, WiFi, Catering"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
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
        </Box>
      </Box>

      {/* ===================== SUITABILITY CARD ===================== */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        mb={6}
        maxW="80%"
      >
        <Box bg="brand.primary" p={4}>
          <Text color="white" fontWeight="semibold">
            + Suitability
          </Text>
          <Text color="white" fontSize="sm" mt={1}>
            Delete or add new tags to get your venue noticed
          </Text>
        </Box>

        <Box p={6}>
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

          {/* Show currently selected tags as removable chips */}
          {suitabilityTags.length > 0 && (
            <Flex wrap="wrap" gap={2} mt={4}>
              {suitabilityTags.map((tag) => (
                <Tag key={tag} colorScheme="purple" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton
                    onClick={() => setSuitabilityTags(suitabilityTags.filter((t) => t !== tag))}
                  />
                </Tag>
              ))}
            </Flex>
          )}
        </Box>
      </Box>

      {/* ===================== DELETE VENUE BUTTON ===================== */}
      <Flex justify="flex-start" mb={8} mt={20}>
        <Button
          bg="red.500"
          color="white"
          onClick={onDeleteOpen}
          _hover={{ bg: "red.600" }}
          leftIcon={<span>🗑</span>}
        >
          DELETE VENUE
        </Button>
      </Flex>

      {/* ===================== SUBMIT ERROR ===================== */}
      {submitError && (
        <Text color="red.500" fontSize="sm" mb={4}>
          {submitError}
        </Text>
      )}

      {/* ===========================================================
          SAVE PREVIEW MODAL
          Shows a summary card of the updated venue before confirming.
      =========================================================== */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="brand.primary">
            {" "}
            {saveSuccess ? "Venue Updated!" : "Update Venue Confirmation Preview"}
          </ModalHeader>

          <ModalBody>
            {saveSuccess ? (
              // Success state — shown after save confirmed
              <Flex direction="column" align="center" py={6} gap={3}>
                <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                  ✓ Venue Updated Successfully!
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Redirecting you back to My Venues...
                </Text>
              </Flex>
            ) : (
              <>
                {/* Venue image preview */}
                <Image
                  src={imageURL}
                  alt={name}
                  objectFit="cover"
                  w="100%"
                  h="180px"
                  borderRadius="md"
                  fallbackSrc="https://picsum.photos/400/200"
                  mb={4}
                />

                {/* Venue name + location */}
                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                  {name}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  {location}
                </Text>

                {/* Description */}
                <Text fontSize="sm" color="gray.700" mb={3}>
                  {shortDescription}
                </Text>

                <Divider mb={3} />

                {/* Price + capacity row */}
                <Flex justify="space-between" mb={3}>
                  <Text fontWeight="semibold">${Number(pricePerDay).toLocaleString()}/day</Text>
                  <Text fontSize="sm" color="gray.500">
                    {capacity} guests
                  </Text>
                </Flex>

                {/* Availability badge */}
                <Badge colorScheme={getAvailabilityColor(availabilityStatus)} mb={3}>
                  {availabilityStatus}
                </Badge>

                {/* Amenity tags */}
                {amenities.length > 0 && (
                  <Flex wrap="wrap" gap={2} mt={2}>
                    {amenities.map((a) => (
                      <Tag key={a} size="sm" colorScheme="blue" borderRadius="full">
                        {a}
                      </Tag>
                    ))}
                  </Flex>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter gap={3}>
            {!saveSuccess && (
              <>
                <Button
                  variant="outline"
                  borderColor="brand.primary"
                  color="brand.primary"
                  onClick={onPreviewClose}
                >
                  Cancel
                </Button>
                <Button
                  bg="brand.primary"
                  color="white"
                  onClick={handleConfirmSave}
                  isLoading={isSubmitting}
                  _hover={{ bg: "brand.secondary", color: "brand.primary" }}
                >
                  Save
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===========================================================
          DELETE CONFIRMATION DIALOG
      =========================================================== */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              Delete Venue
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Are you sure you want to delete <strong>{venue.name}</strong> from VenueVendors?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Deleting a venue cannot be undone.
              </Text>
              {deleteError && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  {deleteError}
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                bg="red.500"
                color="white"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                _hover={{ bg: "red.600" }}
              >
                DELETE VENUE
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VendorDashboardLayout>
  );
}
