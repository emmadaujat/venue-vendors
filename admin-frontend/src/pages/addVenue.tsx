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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../components/adminDashboardLayout";
import { Link } from "react-router-dom";
import {
  isValidVenueName,
  isValidLocation,
  isValidCapacity,
  isValidPricePerDay,
  isValidDescription,
  isValidImageURL,
} from "../venueValidation";

// Suitability tag options
const SUITABILITY_OPTIONS = ["Corporate", "Wedding", "Conference", "Gala Dinner"];

// venue availability drop down
const AVAILABILITY_OPTIONS = ["Available", "Limited Availability", "Not Available"];

export default function AddVenue() {
  const navigate = useNavigate();

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

  // Placeholder until GraphQL query is added
  const vendors: any[] = [];

  // -------------------------------------------------------------------
  // Retrieve draft from localStorage
  // -------------------------------------------------------------------
  // Load draft on page load if there is one
  useEffect(() => {
    const saved = localStorage.getItem("createVenueDraft");
    if (saved) {
      const draft = JSON.parse(saved);
      setName(draft.name ?? "");
      setLocation(draft.location ?? "");
      setCapacity(draft.capacity ?? "");
      setPricePerDay(draft.pricePerDay ?? "");
      setShortDescription(draft.shortDescription ?? "");
      setImageURL(draft.imageURL ?? "");
      setAvailabilityStatus(draft.availabilityStatus ?? "Available");
      setAmenities(draft.amenities ?? []);
      setSuitabilityTags(draft.suitabilityTags ?? []);
    }
  }, []);

  // -------------------------------------------------------------------
  // Get vendors from database to show as options in drop down menu
  // -------------------------------------------------------------------
  function handleVendorSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);
    const vendor = vendors.find((v) => v.userID === parseInt(vendorId));
    setSelectedVendor(vendor);
  }

  // -------------------------------------------------------------------
  // Calculate Vendors years of experience
  // -------------------------------------------------------------------
  function getVendorYearsExperience(): string {
    if (!selectedVendor?.joinedDate) return "";
    const years = Math.floor(
      (new Date().getTime() - new Date(selectedVendor.joinedDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365),
    );
    return `${years} years`;
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
  // Confirm create — called when vendor clicks create in the preview modal
  // ===========================================================
  async function handleConfirmSave() {
    //TODO: wire up to GraphQL createVenue mutation
    setIsSubmitting(true);
    try {
      setSaveSuccess(true);
      localStorage.removeItem("createVenueDraft");
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

  function handleSaveDraft() {
    localStorage.setItem(
      "createVenueDraft",
      JSON.stringify({
        name,
        location,
        capacity,
        pricePerDay,
        shortDescription,
        imageURL,
        availabilityStatus,
        amenities,
        suitabilityTags,
      }),
    );
  }

  // ===========================================================
  // Cancel form — reset all form fields to empty, clear saved draft from localStorage
  // ===========================================================
  function handleCancel() {
    setName("");
    setLocation("");
    setCapacity("");
    setPricePerDay("");
    setShortDescription("");
    setImageURL("");
    setAvailabilityStatus("Available");
    setSuitabilityTags([]);
    setAmenities([]);
    setSelectedVendor(null);
    localStorage.removeItem("createVenueDraft");
  }

  // ===========================================================
  // Helper — availability badge colour (matches myVenues.tsx)
  // ===========================================================
  function getAvailabilityColor(status: string) {
    if (status === "Available") return "green";
    if (status === "Limited Availability") return "orange";
    return "red";
  }

  return (
    <AdminDashboardLayout>
      {/* Back to Venues link */}
      <Link to="/venues">
        <Text
          color="brand.primary"
          fontSize="md"
          mb={4}
          cursor="pointer"
          fontWeight="semibold"
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to Venues
        </Text>
      </Link>

      {/* Page title */}
      <Flex justify="space-between" mt={8} mb={4} maxW="80%">
        <Box mt={8} mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Add a new Venue
          </Text>
          <Text fontSize="sm" color="gray.500">
            Create a new venue for VenueVendors
          </Text>
        </Box>

        <Flex gap={3}>
          <Link to="/venues">
            <Button
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Link>
          <Button
            bg="brand.primary"
            color="white"
            onClick={handleSaveDraft}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            Save Draft
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
        </Flex>

        <Box p={6}>
          <Stack spacing={5}>
            {/* Venue Name + Location */}
            <Flex gap={4}>
              <FormControl isRequired isInvalid={!!nameError} flex="1">
                <FormLabel fontWeight="semibold">Venue Name</FormLabel>
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

              <FormControl isRequired isInvalid={!!locationError} flex="1">
                <FormLabel fontWeight="semibold">Venue Location</FormLabel>
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
              <FormControl isRequired isInvalid={!!capacityError} flex="1">
                <FormLabel fontWeight="semibold">Capacity</FormLabel>
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

              <FormControl isRequired isInvalid={!!priceError} flex="0.5">
                <FormLabel fontWeight="semibold">Price</FormLabel>
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
            <FormControl isRequired isInvalid={!!descriptionError}>
              <FormLabel fontWeight="semibold">Venue Description</FormLabel>
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
            <FormControl isRequired isInvalid={!!imageURLError}>
              <FormLabel fontWeight="semibold">Venue Image</FormLabel>
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
            {/* Top row — vendor select + years of experience */}
            <Flex gap={4}>
              <FormControl flex="1" isRequired isInvalid={!!vendorError}>
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
                <FormLabel fontWeight="semibold">Years of Experience</FormLabel>
                <Input
                  value={getVendorYearsExperience()}
                  isReadOnly
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "gray.200", boxShadow: "none" }}
                  placeholder="How many days since they joined VenueVendors"
                />
              </FormControl>
            </Flex>

            {/* Bottom row — email + phone */}
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

      {/* Add Venue btn */}
      <Flex mt={10} justify={"flex-end"} maxW={"80%"}>
        <Button
          bg="brand.primary"
          color="white"
          onClick={handleSaveClick}
          isLoading={isSubmitting}
          _hover={{ bg: "brand.secondary", color: "brand.primary" }}
        >
          Add Venue
        </Button>
      </Flex>

      {/* ===========================================================
          SAVE PREVIEW MODAL
          Shows a summary card of the updated venue before confirming.
      =========================================================== */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="brand.primary">
            {" "}
            {saveSuccess ? "Venue successfully created!" : "Create Venue Confirmation Preview"}
          </ModalHeader>

          <ModalBody>
            {saveSuccess ? (
              // Success state — shown after save confirmed
              <Flex direction="column" align="center" py={6} gap={3}>
                <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                  ✓ Venue Created Successfully!
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
                {/* Assigned vendor */}
                {selectedVendor && (
                  <>
                    <Divider mb={3} />
                    <Text fontWeight="semibold" fontSize="sm">
                      Assigned Vendor
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {selectedVendor.firstName} {selectedVendor.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedVendor.email}
                    </Text>
                  </>
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
                  Create
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminDashboardLayout>
  );
}
