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
  Spinner,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import {
  isValidVenueName,
  isValidLocation,
  isValidCapacity,
  isValidPricePerDay,
  isValidDescription,
  isValidImageURL,
} from "../venueValidation";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";

// Fetch a venue by ID with its assigned Vendor
const GET_VENUE_BY_ID = gql`
  query getVenueById($venueId: ID!) {
    venueById(venueId: $venueId) {
      venueID
      name
      capacity
      location
      pricePerDay
      shortDescription
      imageURL
      isFeatured
      availabilityStatus
      amenities
      suitabilityTags
      vendor {
        userID
        firstName
        lastName
        email
        phoneNumber
        joinedDate
      }
    }
  }
`;

// Fetch vendors for drop down
const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      userID
      firstName
      lastName
      email
      phoneNumber
      joinedDate
    }
  }
`;

// Update venue details
const UPDATE_VENUE = gql`
  mutation UpdateVenue($venueId: ID!, $input: VenueInput!) {
    updateVenue(venueId: $venueId, input: $input) {
      venueID
      name
    }
  }
`;

const DELETE_VENUE = gql`
  mutation DeleteVenue($venueId: ID!) {
    deleteVenue(venueId: $venueId)
  }
`;

const ASSIGN_VENDOR = gql`
  mutation AssignVendor($venueId: ID!, $vendorId: ID!) {
    assignVendor(venueId: $venueId, vendorId: $vendorId) {
      venueID
      vendor {
        userID
        firstName
        lastName
      }
    }
  }
`;

// Hardcoded suitability tags
const SUITABILITY_OPTIONS = ["Corporate", "Wedding", "Conference", "Gala Dinner"];

// venue availability drop down
const AVAILABILITY_OPTIONS = ["Available", "Limited Availability", "Not Available"];

export default function ManageVenue() {
  const navigate = useNavigate();

  // Get venueID from URL
  const { venueId } = useParams();

  // Fetch VenueID data
  const { data: venueData, loading: venueLoading } = useQuery(GET_VENUE_BY_ID, {
    variables: { venueId },
    skip: !venueId,
  });
  const venue = venueData?.venueById;

  // Return vendors
  const { data: vendorsData } = useQuery(GET_VENDORS);
  const vendors: any[] = vendorsData?.vendors ?? [];

  // Update venue mutation — refetches venue data after save
  const [updateVenue] = useMutation(UPDATE_VENUE, {
    refetchQueries: [{ query: GET_VENUE_BY_ID, variables: { venueId } }],
  });

  // Delete venue mutation
  const [deleteVenue] = useMutation(DELETE_VENUE);

  // Assign vendor mutation
  const [assignVendor] = useMutation(ASSIGN_VENDOR);

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
  const [isFeatured, setIsFeatured] = useState(false);

  // ===========================================================
  // Per-field validation error states
  // ===========================================================
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [imageURLError, setImageURLError] = useState<string | null>(null);
  const [vendorError, setVendorError] = useState<string | null>(null);

  // ===========================================================
  // Assign a vendor via drop down selection
  // ===========================================================
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

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
      setPricePerDay(String(venue.pricePerDay ?? ""));
      setShortDescription(venue.shortDescription ?? "");
      setImageURL(venue.imageURL ?? "");
      setAvailabilityStatus(venue.availabilityStatus);
      setSuitabilityTags(venue.suitabilityTags ?? []);
      setAmenities(venue.amenities ?? []);
      setIsFeatured(venue.isFeatured ?? false);

      // Pre-select the current vendor if one is assigned
      if (venue.vendor) {
        setSelectedVendorId(String(venue.vendor.userID));
        setSelectedVendor(venue.vendor);
      }
    }
  }, [venue]);

  // -------------------------------------------------------------------
  // Get vendors from database to show as options in drop down menu
  // -------------------------------------------------------------------
  function handleVendorSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);
    const vendor = vendors.find((v) => String(v.userID) === String(vendorId));
    setSelectedVendor(vendor);
  }

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

    // Check vendor has been selected
    const vendorErr = !selectedVendorId
      ? "Please assign a vendor to this venue before saving"
      : null;
    setVendorError(vendorErr);

    // Set all errors so they all display at once
    setNameError(nameErr);
    setLocationError(locationErr);
    setCapacityError(capacityErr);
    setPriceError(priceErr);
    setDescriptionError(descriptionErr);
    setImageURLError(imageURLErr);

    return (
      !nameErr &&
      !locationErr &&
      !capacityErr &&
      !priceErr &&
      !descriptionErr &&
      !imageURLErr &&
      !vendorErr
    );
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
  // Confirm create — called when vendor clicks save in the preview modal
  // ===========================================================
  async function handleConfirmSave() {
    setIsSubmitting(true);
    try {
      await updateVenue({
        variables: {
          venueId,
          input: {
            name,
            location,
            capacity: Number(capacity),
            pricePerDay: Number(pricePerDay),
            shortDescription,
            imageURL,
            availabilityStatus,
            amenities,
            suitabilityTags,
            isFeatured,
            vendorId: selectedVendorId,
          },
        },
      });

      // Assign vendor separately if updated
      if (selectedVendorId) {
        await assignVendor({
          variables: {
            venueId,
            vendorId: selectedVendorId,
          },
        });
      }

      setSaveSuccess(true);
      // Show success message for 1.5 seconds then redirect
      setTimeout(() => {
        onPreviewClose();
        setSaveSuccess(false);
        navigate("/venues");
      }, 1500);
    } catch (error: any) {
      setSubmitError("Something went wrong saving the venue. Please try again.");
      onPreviewClose();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300); // wait for modal close animation to finish // scroll to top if error
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
      await deleteVenue({
        variables: { venueId },
      });
      onDeleteClose();
      navigate("/venues");
    } catch (error) {
      setDeleteError("Something went wrong deleting the venue. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Convert timestamp to readable date
  function formatDate(timestamp: string | number): string {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp)).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ===========================================================
  // Helper — availability badge colour (matches myVenues.tsx)
  // ===========================================================
  function getAvailabilityColor(status: string) {
    if (status === "Available") return "green";
    if (status === "Limited Availability") return "orange";
    return "red";
  }

  if (venueLoading || !venue)
    return (
      <AdminDashboardLayout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="brand.primary" />
        </Flex>
      </AdminDashboardLayout>
    );

  return (
    <AdminDashboardLayout>
      {/* Back to My Venues link */}
      <Link to="/venues">
        <Text
          fontSize="sm"
          color="brand.primary"
          cursor="pointer"
          fontWeight={"semibold"}
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to My Venues
        </Text>
      </Link>

      {/* Page title */}
      <Flex justify="space-between" mt={8} mb={4} maxW="80%">
        <Box mt={8} mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Update Venue Details - {venue?.name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Update Venue Details & reassign a vendor below
          </Text>
        </Box>

        {/* Save / Cancel btn */}
        <Flex gap={3}>
          <Link to="/venues">
            <Button variant="outline" borderColor="brand.primary" color="brand.primary">
              Cancel
            </Button>
          </Link>
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

      {/* ===================== SUBMIT ERROR ===================== */}
      {submitError && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.300"
          borderRadius="md"
          p={3}
          mb={4}
          maxW="80%"
        >
          <Text color="red.600" fontSize="sm" fontWeight="semibold">
            {submitError}
          </Text>
        </Box>
      )}

      {/* ===================== VENUE DETAILS FORM CARD ===================== */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" mb={8} maxW="80%">
        <Flex bg="brand.primary" p={4} borderTopRadius="md" justify="space-between" align="center">
          <Text color="white" fontWeight="semibold">
            Venue Details
          </Text>
          {/* Featured toggle */}
          <Flex align="center" gap={2}>
            <Text color="white" fontSize="md">
              Featured
            </Text>
            <Flex gap={0}>
              <Button
                size="sm"
                bg={isFeatured ? "gray.400" : "red.600"}
                color="white"
                onClick={() => setIsFeatured(false)}
                borderRightRadius={0}
              >
                No
              </Button>
              <Button
                size="sm"
                bg={isFeatured ? "green.500" : "gray.400"}
                color="white"
                onClick={() => setIsFeatured(true)}
                borderLeftRadius={0}
              >
                Yes
              </Button>
            </Flex>
          </Flex>
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

            {/* Capacity + Price + Rate */}
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

              {/* Rate - always Per Day, read-only */}
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
          {/* Existing amenities */}
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
      {/* ===================== ASSIGN VENDOR ===================== */}
      <Box border="1px solid" borderColor={"gray.200"} borderRadius={"md"} mb={8} maxW="80%">
        <Flex
          bg="brand.primary"
          p={4}
          borderTopRadius={"md"}
          justify="space-between"
          align={"center"}
        >
          <Text color="white" fontWeight="semibold">
            Assign a Vendor
          </Text>
        </Flex>

        <Box p={6}>
          <Stack spacing={4}>
            {/* Vendor select + years of experience */}
            <Flex gap={4}>
              <FormControl flex="1" isInvalid={!!vendorError}>
                <FormLabel fontWeight={"semibold"}>Vendor Name</FormLabel>
                <Select
                  placeholder="Select a vendor"
                  value={selectedVendorId}
                  onChange={handleVendorSelect}
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.userID} value={vendor.userID}>
                      {vendor.firstName} {vendor.lastName}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{vendorError}</FormErrorMessage>
              </FormControl>

              {/*  Read-only fields that populate after vendor selection */}
              <FormControl flex="1">
                <FormLabel fontWeight="semibold">Member Since</FormLabel>
                <Input
                  value={formatDate(selectedVendor?.joinedDate ?? "")}
                  isReadOnly
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "gray.200", boxShadow: "none" }}
                  placeholder="How many days since they joined VenueVendors"
                />
              </FormControl>
            </Flex>

            {/* Bottom row - Vendor email + phone */}
            <Flex gap={4}>
              <FormControl flex="1">
                <FormLabel fontWeight="semibold">Vendor Email</FormLabel>
                <Input
                  value={selectedVendor?.email ?? ""}
                  isReadOnly
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "gray.200", boxShadow: "none" }}
                  placeholder="Vendor email"
                />
              </FormControl>

              <FormControl flex="1">
                <FormLabel fontWeight="semibold">Vendor Contact Number</FormLabel>

                <Input
                  value={selectedVendor?.phoneNumber ?? ""}
                  isReadOnly
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "gray.200", boxShadow: "none" }}
                  placeholder="Vendor contact number"
                />
              </FormControl>
            </Flex>
          </Stack>
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
            {/* Success state — shown after save confirmed */}
            {saveSuccess ? (
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
                Are you sure you want to delete <strong>{venue?.name}</strong> from VenueVendors?
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
    </AdminDashboardLayout>
  );
}
