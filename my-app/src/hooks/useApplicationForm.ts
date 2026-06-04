// all the state and logic for the hire application form
// apply.tsx just handles the layout, this hook does the rest

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { hirerApi } from "@/services/hirerApi";

import type { Venue, User } from "@/types";

// Turn a "DD/MM/YYYY" string (what the form uses) into the
// "YYYY-MM-DD" the backend DTO expects (IsDateString).
function toIsoDate(ddmmyyyy: string): string {
  const parts = ddmmyyyy.trim().split("/");
  if (parts.length !== 3) return ddmmyyyy; // already ISO or empty
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
}

// Max file size for uploads (2MB)
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;

export default function useApplicationForm(user: User | null) {
  const router = useRouter();

  // Which venue we are applying for
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Current wizard step (1-5)
  const [currentStepNumber, setCurrentStepNumber] = useState(1);

  // Step 2  Event Details fields
  const [eventNameText, setEventNameText] = useState("");
  const [eventTypeChoice, setEventTypeChoice] = useState("");
  const [eventStartDateText, setEventStartDateText] = useState("");
  const [eventEndDateText, setEventEndDateText] = useState("");
  const [expectedGuestCountText, setExpectedGuestCountText] = useState("");
  const [setupTimeText, setSetupTimeText] = useState("");
  const [eventDescriptionText, setEventDescriptionText] = useState("");

  // Step 3  Reputation fields
  const [previousVenuesHiredText, setPreviousVenuesHiredText] = useState("");
  const [yearsOfExperienceText, setYearsOfExperienceText] = useState("");
  const [selectedReputationTags, setSelectedReputationTags] = useState<string[]>([]);

  // Step 4  Document upload state
  const [licenseFileName, setLicenseFileName] = useState("");
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [licenseErrorText, setLicenseErrorText] = useState("");
  const licenseFileInputRef = useRef<HTMLInputElement>(null);

  const [insuranceFileName, setInsuranceFileName] = useState("");
  const [insuranceUploaded, setInsuranceUploaded] = useState(false);
  const [insuranceErrorText, setInsuranceErrorText] = useState("");
  const insuranceFileInputRef = useRef<HTMLInputElement>(null);

  const [permitFileName, setPermitFileName] = useState("");
  const [permitUploaded, setPermitUploaded] = useState(false);
  const [permitErrorText, setPermitErrorText] = useState("");
  const permitFileInputRef = useRef<HTMLInputElement>(null);

  const [isApplyingForBusiness, setIsApplyingForBusiness] = useState(false);
  const [businessAbnNumberText, setBusinessAbnNumberText] = useState("");
  const [businessCertFileName, setBusinessCertFileName] = useState("");
  const [businessCertUploaded, setBusinessCertUploaded] = useState(false);
  const [businessCertErrorText, setBusinessCertErrorText] = useState("");
  const businessCertFileInputRef = useRef<HTMLInputElement>(null);

  // Validation errors per step
  const [stepTwoErrors, setStepTwoErrors] = useState<{ [key: string]: string }>({});
  const [stepThreeErrors, setStepThreeErrors] = useState<{ [key: string]: string }>({});
  const [stepFourErrors, setStepFourErrors] = useState<{ [key: string]: string }>({});

  // Submission + draft
  const [applicationSubmittedSuccessfully, setApplicationSubmittedSuccessfully] = useState(false);
  const [showDraftSavedMessage, setShowDraftSavedMessage] = useState(false);

  // load venue + saved draft + uploaded docs on page load
  useEffect(() => {
    if (!router.isReady) return;
    const venueIdFromUrl = router.query.venueId as string;

    if (venueIdFromUrl) {
      // Load the venue we are applying for from the database.
      hirerApi
        .getVenueById(parseInt(venueIdFromUrl))
        .then((venue) => setSelectedVenue(venue))
        .catch((error) => console.error("Failed to load venue", error));
    }

    // Load draft if it matches this venue
    const savedDraftString = localStorage.getItem("applicationDraft");
    if (savedDraftString) {
      const draft = JSON.parse(savedDraftString);
      if (String(draft.venueId) === venueIdFromUrl) {
        setEventNameText(draft.eventNameText || "");
        setEventTypeChoice(draft.eventTypeChoice || "");
        setEventStartDateText(draft.eventStartDateText || "");
        setEventEndDateText(draft.eventEndDateText || "");
        setExpectedGuestCountText(draft.expectedGuestCountText || "");
        setSetupTimeText(draft.setupTimeText || "");
        setEventDescriptionText(draft.eventDescriptionText || "");
        setPreviousVenuesHiredText(draft.previousVenuesHiredText || "");
        setYearsOfExperienceText(draft.yearsOfExperienceText || "");
        setSelectedReputationTags(draft.selectedReputationTags || []);
        setIsApplyingForBusiness(draft.isApplyingForBusiness || false);
        setBusinessAbnNumberText(draft.businessAbnNumberText || "");
      }
    }

    // Load uploaded docs
    const savedLicense = localStorage.getItem("complianceDoc_license");
    if (savedLicense) {
      const parsed = JSON.parse(savedLicense);
      setLicenseFileName(parsed.fileName);
      setLicenseUploaded(true);
    }
    const savedInsurance = localStorage.getItem("complianceDoc_insurance");
    if (savedInsurance) {
      const p = JSON.parse(savedInsurance);
      setInsuranceFileName(p.fileName);
      setInsuranceUploaded(true);
    }
    const savedPermit = localStorage.getItem("complianceDoc_permit");
    if (savedPermit) {
      const p = JSON.parse(savedPermit);
      setPermitFileName(p.fileName);
      setPermitUploaded(true);
    }
    const savedBizCert = localStorage.getItem("complianceDoc_businessCert");
    if (savedBizCert) {
      const p = JSON.parse(savedBizCert);
      setBusinessCertFileName(p.fileName);
      setBusinessCertUploaded(true);
    }

    const savedIsBusiness = localStorage.getItem("complianceDoc_isBusiness");
    if (savedIsBusiness === "true") setIsApplyingForBusiness(true);
    const savedAbn = localStorage.getItem("complianceDoc_abn");
    if (savedAbn) setBusinessAbnNumberText(savedAbn);
  }, [router.isReady, router.query.venueId]);

  // credibility score (0-5 stars)
  function calculateCredibilityStarRating(): number {
    let uploaded = 0;
    let total = 3;
    if (licenseUploaded) uploaded++;
    if (insuranceUploaded) uploaded++;
    if (permitUploaded) uploaded++;
    if (isApplyingForBusiness) {
      total = 4;
      if (businessCertUploaded) uploaded++;
    }
    if (total === 0) return 0;
    return Math.round((uploaded / total) * 5);
  }

  // validation
  function validateStepTwo(): boolean {
    const errors: { [key: string]: string } = {};
    if (!eventNameText.trim()) errors.eventName = "Event name is required";
    if (!eventTypeChoice) errors.eventType = "Please select an event type";
    if (!eventStartDateText.trim()) {
      errors.eventStartDate = "Event date is required";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(eventStartDateText.trim())) {
      errors.eventStartDate = "Date must be in DD/MM/YYYY format";
    }
    if (eventEndDateText.trim() && !/^\d{2}\/\d{2}\/\d{4}$/.test(eventEndDateText.trim())) {
      errors.eventEndDate = "End date must be in DD/MM/YYYY format";
    }
    if (!expectedGuestCountText.trim()) {
      errors.expectedGuestCount = "Expected guest count is required";
    } else if (isNaN(Number(expectedGuestCountText)) || Number(expectedGuestCountText) <= 0) {
      errors.expectedGuestCount = "Guest count must be a positive number";
    }
    setStepTwoErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStepThree(): boolean {
    const errors: { [key: string]: string } = {};
    if (previousVenuesHiredText.trim() && isNaN(Number(previousVenuesHiredText)))
      errors.previousVenuesHired = "Must be a number";
    if (yearsOfExperienceText.trim() && isNaN(Number(yearsOfExperienceText)))
      errors.yearsOfExperience = "Must be a number";
    setStepThreeErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStepFour(): boolean {
    const errors: { [key: string]: string } = {};
    if (isApplyingForBusiness && !businessAbnNumberText.trim())
      errors.businessAbn = "ABN number is required when applying on behalf of a business";
    setStepFourErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // navigation
  function handleContinueToNextStep() {
    if (currentStepNumber === 1) setCurrentStepNumber(2);
    else if (currentStepNumber === 2 && validateStepTwo()) setCurrentStepNumber(3);
    else if (currentStepNumber === 3 && validateStepThree()) setCurrentStepNumber(4);
    else if (currentStepNumber === 4 && validateStepFour()) setCurrentStepNumber(5);
  }

  function handleGoBackToPreviousStep() {
    if (currentStepNumber > 1) setCurrentStepNumber(currentStepNumber - 1);
  }

  // toggle a reputation tag on/off
  function handleReputationTagToggle(tagName: string) {
    if (selectedReputationTags.includes(tagName)) {
      setSelectedReputationTags(selectedReputationTags.filter((t) => t !== tagName));
    } else {
      setSelectedReputationTags([...selectedReputationTags, tagName]);
    }
  }

  // Save the half-finished form to localStorage so the hirer can
  // come back later. This is just a browser convenience — the real
  // application is only created in the database on submit.
  function handleSaveDraft() {
    if (!user || !selectedVenue) return;
    const draftData = {
      venueId: selectedVenue.venueID,
      eventNameText,
      eventTypeChoice,
      eventStartDateText,
      eventEndDateText,
      expectedGuestCountText,
      setupTimeText,
      eventDescriptionText,
      previousVenuesHiredText,
      yearsOfExperienceText,
      selectedReputationTags,
      isApplyingForBusiness,
      businessAbnNumberText,
    };
    localStorage.setItem("applicationDraft", JSON.stringify(draftData));

    setShowDraftSavedMessage(true);
    setTimeout(() => setShowDraftSavedMessage(false), 3000);
  }

  // Throw the saved draft away and go back to booking history.
  function handleDeleteDraft() {
    localStorage.removeItem("applicationDraft");
    router.push("/hirer/bookingHistory");
  }

  // Submit the application — this creates a real Application row
  // in the database via POST /api/bookings. The backend also
  // re-checks guest count, past dates and blocked dates and will
  // return an error message we show to the hirer.
  const [submitErrorText, setSubmitErrorText] = useState("");

  async function handleSubmitApplication() {
    if (!user || !selectedVenue) return;
    setSubmitErrorText("");

    try {
      await hirerApi.createBooking({
        venueID: selectedVenue.venueID,
        eventName: eventNameText.trim(),
        eventType: eventTypeChoice,
        eventDate: toIsoDate(eventStartDateText),
        eventEndDate: eventEndDateText.trim()
          ? toIsoDate(eventEndDateText)
          : undefined,
        guestCount: Number(expectedGuestCountText),
        additionalNotes: eventDescriptionText.trim() || undefined,
      });

      // After the booking is created, save each uploaded compliance document
      // to the database as a base64 string so vendors can view and download them.
      // Each document is stored using POST /api/hirer/compliance.
      // (Dipto: "convert the document to string or other format like blob, then store it in DB")

      const savedLicense = localStorage.getItem("complianceDoc_license");
      if (savedLicense) {
        const parsed = JSON.parse(savedLicense);
        await hirerApi.addCompliance({
          documentType: "Drivers License",
          fileName: parsed.fileName,
          fileURL: parsed.data,  // base64 data URL string
        });
      }

      const savedInsurance = localStorage.getItem("complianceDoc_insurance");
      if (savedInsurance) {
        const parsed = JSON.parse(savedInsurance);
        await hirerApi.addCompliance({
          documentType: "Public Liability Insurance",
          fileName: parsed.fileName,
          fileURL: parsed.data,  // base64 data URL string
        });
      }

      const savedPermit = localStorage.getItem("complianceDoc_permit");
      if (savedPermit) {
        const parsed = JSON.parse(savedPermit);
        await hirerApi.addCompliance({
          documentType: "Event Permit",
          fileName: parsed.fileName,
          fileURL: parsed.data,  // base64 data URL string, vendor can download this
        });
      }

      const savedBizCert = localStorage.getItem("complianceDoc_businessCert");
      if (savedBizCert) {
        const parsed = JSON.parse(savedBizCert);
        await hirerApi.addCompliance({
          documentType: "Business Registration Certificate",
          fileName: parsed.fileName,
          fileURL: parsed.data,  // base64 data URL string
          isBusiness: true,
          abnNumber: businessAbnNumberText || undefined,
        });
      }

      // Success, clear the local draft and show the success page.
      localStorage.removeItem("applicationDraft");
      setApplicationSubmittedSuccessfully(true);
    } catch (error: unknown) {
      // Show the backend's message (e.g. "timeslot blocked",
      // "Event date must be today or later").
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setSubmitErrorText(
        axiosError.response?.data?.message ||
        "Could not submit application. Please try again.",
      );
    }
  }

  // file upload handlers
  function handleLicenseFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
      setLicenseErrorText("File must be a JPG image");
      setLicenseUploaded(false);
      setLicenseFileName(file.name);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setLicenseErrorText("File exceeds 2MB limit");
      setLicenseUploaded(false);
      setLicenseFileName(file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(
        "complianceDoc_license",
        JSON.stringify({ fileName: file.name, data: reader.result }),
      );
      setLicenseFileName(file.name);
      setLicenseUploaded(true);
      setLicenseErrorText("");
    };
    reader.readAsDataURL(file);
  }

  function handleInsuranceFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setInsuranceErrorText("File must be a PDF");
      setInsuranceUploaded(false);
      setInsuranceFileName(file.name);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setInsuranceErrorText("File exceeds 2MB limit");
      setInsuranceUploaded(false);
      setInsuranceFileName(file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(
        "complianceDoc_insurance",
        JSON.stringify({ fileName: file.name, data: reader.result }),
      );
      setInsuranceFileName(file.name);
      setInsuranceUploaded(true);
      setInsuranceErrorText("");
    };
    reader.readAsDataURL(file);
  }

  function handlePermitFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPermitErrorText("File must be a PDF");
      setPermitUploaded(false);
      setPermitFileName(file.name);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setPermitErrorText("File exceeds 2MB limit");
      setPermitUploaded(false);
      setPermitFileName(file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(
        "complianceDoc_permit",
        JSON.stringify({ fileName: file.name, data: reader.result }),
      );
      setPermitFileName(file.name);
      setPermitUploaded(true);
      setPermitErrorText("");
    };
    reader.readAsDataURL(file);
  }

  function handleBusinessCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setBusinessCertErrorText("File must be a PDF");
      setBusinessCertUploaded(false);
      setBusinessCertFileName(file.name);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setBusinessCertErrorText("File exceeds 2MB limit");
      setBusinessCertUploaded(false);
      setBusinessCertFileName(file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(
        "complianceDoc_businessCert",
        JSON.stringify({ fileName: file.name, data: reader.result }),
      );
      setBusinessCertFileName(file.name);
      setBusinessCertUploaded(true);
      setBusinessCertErrorText("");
    };
    reader.readAsDataURL(file);
  }

  // Remove handlers
  function handleRemoveLicense() {
    localStorage.removeItem("complianceDoc_license");
    setLicenseFileName("");
    setLicenseUploaded(false);
    setLicenseErrorText("");
  }
  function handleRemoveInsurance() {
    localStorage.removeItem("complianceDoc_insurance");
    setInsuranceFileName("");
    setInsuranceUploaded(false);
    setInsuranceErrorText("");
  }
  function handleRemovePermit() {
    localStorage.removeItem("complianceDoc_permit");
    setPermitFileName("");
    setPermitUploaded(false);
    setPermitErrorText("");
  }
  function handleRemoveBusinessCert() {
    localStorage.removeItem("complianceDoc_businessCert");
    setBusinessCertFileName("");
    setBusinessCertUploaded(false);
    setBusinessCertErrorText("");
  }
  // return everything the page needs
  return {
    // Venue + step
    selectedVenue,
    currentStepNumber,
    setCurrentStepNumber,

    // Event details
    eventNameText,
    setEventNameText,
    eventTypeChoice,
    setEventTypeChoice,
    eventStartDateText,
    setEventStartDateText,
    eventEndDateText,
    setEventEndDateText,
    expectedGuestCountText,
    setExpectedGuestCountText,
    setupTimeText,
    setSetupTimeText,
    eventDescriptionText,
    setEventDescriptionText,

    // Reputation
    previousVenuesHiredText,
    setPreviousVenuesHiredText,
    yearsOfExperienceText,
    setYearsOfExperienceText,
    selectedReputationTags,
    handleReputationTagToggle,

    // Documents
    licenseFileName,
    licenseUploaded,
    licenseErrorText,
    licenseFileInputRef,
    handleLicenseFileUpload,
    handleRemoveLicense,
    insuranceFileName,
    insuranceUploaded,
    insuranceErrorText,
    insuranceFileInputRef,
    handleInsuranceFileUpload,
    handleRemoveInsurance,
    permitFileName,
    permitUploaded,
    permitErrorText,
    permitFileInputRef,
    handlePermitFileUpload,
    handleRemovePermit,
    isApplyingForBusiness,
    setIsApplyingForBusiness,
    businessAbnNumberText,
    setBusinessAbnNumberText,
    businessCertFileName,
    businessCertUploaded,
    businessCertErrorText,
    businessCertFileInputRef,
    handleBusinessCertUpload,
    handleRemoveBusinessCert,

    // Errors
    stepTwoErrors,
    stepThreeErrors,
    stepFourErrors,

    // Actions
    handleContinueToNextStep,
    handleGoBackToPreviousStep,
    handleSaveDraft,
    handleDeleteDraft,
    handleSubmitApplication,
    calculateCredibilityStarRating,

    // Status
    applicationSubmittedSuccessfully,
    showDraftSavedMessage,
    submitErrorText,
  };
}
