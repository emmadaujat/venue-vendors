import { useState, useEffect, useRef } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { hirerApi } from "@/services/hirerApi";
import { savePDFtoDB, getPDFfromDB, deletePDFfromDB } from "@/pdfStorage";
import { CheckCircleIcon, WarningIcon, AttachmentIcon } from "@chakra-ui/icons";

import {
    Box,
    Text,
    Flex,
    Avatar,
    Checkbox,
    Input,
    Button,
} from "@chakra-ui/react";
import Link from "next/link";


// The maximum file size allowed is 2MB (in bytes)
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;


// Type for tracking each document's upload status
type DocumentUploadStatus = {
    fileName: string;
    isUploaded: boolean;
    errorMessage: string;
};

export default function HirerComplianceDocuments() {
    // Only hirers can access this page
    const { user } = useAuth("hirer");

    // Track the upload status for each document type
    const [insuranceUpload, setInsuranceUpload] = useState<DocumentUploadStatus>({
        fileName: "",
        isUploaded: false,
        errorMessage: "",
    });

    const [driversLicenseUpload, setDriversLicenseUpload] = useState<DocumentUploadStatus>({
        fileName: "",
        isUploaded: false,
        errorMessage: "",
    });

    const [businessCertUpload, setBusinessCertUpload] = useState<DocumentUploadStatus>({
        fileName: "",
        isUploaded: false,
        errorMessage: "",
    });

    // Whether the user is applying on behalf of a business
    const [isApplyingAsBusiness, setIsApplyingAsBusiness] = useState(false);

    // Business ABN text input
    const [businessAbnText, setBusinessAbnText] = useState("");

    // Credibility score as a percentage
    const [credibilityPercentage, setCredibilityPercentage] = useState(0);

    // File input refs so we can trigger file dialogs programmatically
    const insuranceFileInputRef = useRef<HTMLInputElement>(null);
    const licenseFileInputRef = useRef<HTMLInputElement>(null);
    const businessCertFileInputRef = useRef<HTMLInputElement>(null);

    // Load any previously uploaded documents on mount
    useEffect(() => {
        if (!user) return;

        // Load insurance PDF from IndexedDB (PDFs use IndexedDB per assignment spec)
        getPDFfromDB("complianceDoc_insurance").then((saved) => {
            if (saved) setInsuranceUpload({ fileName: saved.fileName, isUploaded: true, errorMessage: "" });
        });

        // Load driver's license from localStorage (JPG uses localStorage)
        const savedLicense = localStorage.getItem("complianceDoc_license");
        if (savedLicense) {
            const parsed = JSON.parse(savedLicense);
            setDriversLicenseUpload({ fileName: parsed.fileName, isUploaded: true, errorMessage: "" });
        }

        // Load business cert PDF from IndexedDB (PDFs use IndexedDB per assignment spec)
        getPDFfromDB("complianceDoc_businessCert").then((saved) => {
            if (saved) setBusinessCertUpload({ fileName: saved.fileName, isUploaded: true, errorMessage: "" });
        });

        const savedIsBusiness = localStorage.getItem("complianceDoc_isBusiness");
        if (savedIsBusiness === "true") {
            setIsApplyingAsBusiness(true);
        }

        const savedAbn = localStorage.getItem("complianceDoc_abn");
        if (savedAbn) {
            setBusinessAbnText(savedAbn);
        }

        // Load the credibility score from the backend (it is based
        // on how many compliance documents are saved in the DB).
        refreshComplianceScore();
    }, [user]);

    // Ask the backend for the current compliance score (0–5) and
    // turn it into the percentage the page shows.
    async function refreshComplianceScore() {
        try {
            const data = await hirerApi.getCompliance();
            setCredibilityPercentage(
                Math.round((data.complianceScore / 5) * 100),
            );
        } catch (error) {
            console.error("Failed to load compliance score", error);
        }
    }

    // Save one document's metadata to the database, then refresh
    // the score so the percentage updates immediately.
    async function persistComplianceDoc(documentType: string, fileName: string) {
        try {
            await hirerApi.addCompliance({
                documentType,
                fileName,
                isBusiness: isApplyingAsBusiness,
                abnNumber: businessAbnText || undefined,
            });
            await refreshComplianceScore();
        } catch (error) {
            console.error("Failed to save compliance document", error);
        }
    }


    // The credibility percentage now comes from the backend (it is
    // based on how many compliance documents are stored in the DB).
    // refreshComplianceScore() above keeps it up to date.


    // Handle file upload for insurance (must be PDF, stored in IndexedDB per assignment spec)
    function handleInsuranceFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setInsuranceUpload({ fileName: selectedFile.name, isUploaded: false, errorMessage: "Unable to upload file as it must be a PDF" });
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setInsuranceUpload({ fileName: selectedFile.name, isUploaded: false, errorMessage: "Unable to upload file as it exceeds 2MB" });
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = function () {
            // PDFs are stored in IndexedDB (not localStorage) as required by the assignment
            savePDFtoDB("complianceDoc_insurance", selectedFile.name, fileReader.result as string);
            setInsuranceUpload({ fileName: selectedFile.name, isUploaded: true, errorMessage: "" });
            persistComplianceDoc("Public Liability Insurance", selectedFile.name);
        };
        fileReader.readAsDataURL(selectedFile);
    }


    // Handle file upload for drivers license (must be JPG)
    function handleLicenseFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // Check file type - must be JPG/JPEG
        if (selectedFile.type !== "image/jpeg" && selectedFile.type !== "image/jpg") {
            setDriversLicenseUpload({
                fileName: selectedFile.name,
                isUploaded: false,
                errorMessage: "Unable to upload file as it must be a JPG",
            });
            return;
        }

        // Check file size - must be under 2MB
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setDriversLicenseUpload({
                fileName: selectedFile.name,
                isUploaded: false,
                errorMessage: "Unable to upload file as it exceeds 2MB",
            });
            return;
        }

        // Convert to base64 and save to localStorage
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const base64String = fileReader.result as string;
            localStorage.setItem(
                "complianceDoc_license",
                JSON.stringify({ fileName: selectedFile.name, data: base64String })
            );
            setDriversLicenseUpload({
                fileName: selectedFile.name,
                isUploaded: true,
                errorMessage: "",
            });
            persistComplianceDoc("Drivers License", selectedFile.name);
        };
        fileReader.readAsDataURL(selectedFile);
    }


    // Handle file upload for business certificate (must be PDF, stored in IndexedDB per assignment spec)
    function handleBusinessCertFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setBusinessCertUpload({ fileName: selectedFile.name, isUploaded: false, errorMessage: "Unable to upload file as it must be a PDF" });
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setBusinessCertUpload({ fileName: selectedFile.name, isUploaded: false, errorMessage: "Unable to upload file as it exceeds 2MB" });
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = function () {
            // PDFs are stored in IndexedDB (not localStorage) as required by the assignment
            savePDFtoDB("complianceDoc_businessCert", selectedFile.name, fileReader.result as string);
            setBusinessCertUpload({ fileName: selectedFile.name, isUploaded: true, errorMessage: "" });
            persistComplianceDoc("Business Registration Certificate", selectedFile.name);
        };
        fileReader.readAsDataURL(selectedFile);
    }


    // Handle business checkbox toggle
    function handleBusinessCheckboxToggle() {
        const newValue = !isApplyingAsBusiness;
        setIsApplyingAsBusiness(newValue);
        localStorage.setItem("complianceDoc_isBusiness", String(newValue));
    }


    // Remove uploaded documents
    function handleRemoveInsurance() {
        deletePDFfromDB("complianceDoc_insurance"); // PDF stored in IndexedDB
        setInsuranceUpload({ fileName: "", isUploaded: false, errorMessage: "" });
    }

    function handleRemoveLicense() {
        localStorage.removeItem("complianceDoc_license"); // JPG stored in localStorage
        setDriversLicenseUpload({ fileName: "", isUploaded: false, errorMessage: "" });
    }

    function handleRemoveBusinessCert() {
        deletePDFfromDB("complianceDoc_businessCert"); // PDF stored in IndexedDB
        setBusinessCertUpload({ fileName: "", isUploaded: false, errorMessage: "" });
    }


    // Handle ABN text change
    function handleAbnTextChange(newText: string) {
        setBusinessAbnText(newText);
        localStorage.setItem("complianceDoc_abn", newText);
    }




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
                            My Compliance Documents
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Add more compliance documents to get a better credibility rating
                        </Text>
                    </Box>

                    {/* Compliance documents table */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                        <Box bg="brand.primary" color="white" px={4} py={3}>
                            <Text fontWeight="semibold">Your Compliance Documents</Text>
                        </Box>

                        {/* Column headers */}
                        <Flex px={6} py={3} borderBottom="1px solid" borderColor="gray.200" gap={4}>
                            <Text fontSize="sm" fontWeight="bold" w="250px">
                                Document Type
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" flex="1">
                                Attachment <Text as="span" fontSize="xs" fontWeight="normal" color="red.500">* Files must be less than 2MB</Text>
                            </Text>
                        </Flex>

                        {/* Row 1: Public liability insurance */}
                        <Flex
                            px={6}
                            py={4}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            alignItems="center"
                            gap={4}
                        >
                            <Text fontSize="sm" fontWeight="medium" w="250px">
                                Public Liability Insurance Certificate
                            </Text>
                            <Flex flex="1" alignItems="center" gap={3}>
                                {insuranceUpload.isUploaded ? (
                                    // Show uploaded file name with green tick
                                    <Flex alignItems="center" gap={2}>
                                        <Text fontSize="sm" color="gray.600">{insuranceUpload.fileName}</Text>
                                        <CheckCircleIcon color="green.500" boxSize={5} />
                                        <Button size="xs" colorScheme="red" variant="ghost" onClick={handleRemoveInsurance}>Remove</Button>
                                    </Flex>
                                ) : (
                                    // Show upload area
                                    <Flex alignItems="center" gap={3}>
                                        <Box
                                            border="2px dashed"
                                            borderColor="gray.300"
                                            borderRadius="md"
                                            px={4}
                                            py={2}
                                            cursor="pointer"
                                            _hover={{ borderColor: "brand.primary" }}
                                            onClick={() => insuranceFileInputRef.current?.click()}
                                        >
                                            <Flex alignItems="center" gap={2}>
                                                <AttachmentIcon color="gray.400" />
                                                <Text fontSize="sm" color="gray.500">
                                                    Click to upload a PDF
                                                </Text>
                                            </Flex>
                                        </Box>
                                        <input
                                            type="file"
                                            ref={insuranceFileInputRef}
                                            style={{ display: "none" }}
                                            accept=".pdf"
                                            onChange={handleInsuranceFileUpload}
                                        />

                                        {/* Show error if upload failed */}
                                        {insuranceUpload.errorMessage && (
                                            <Flex alignItems="center" gap={2}>
                                                <WarningIcon color="red.500" boxSize={5} />
                                                <Text fontSize="sm" color="red.500">{insuranceUpload.errorMessage}</Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>

                        {/* Row 2: Drivers license */}
                        <Flex
                            px={6}
                            py={4}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            alignItems="center"
                            gap={4}
                        >
                            <Text fontSize="sm" fontWeight="medium" w="250px">
                                Drivers License
                            </Text>
                            <Flex flex="1" alignItems="center" gap={3}>
                                {driversLicenseUpload.isUploaded ? (
                                    <Flex alignItems="center" gap={2}>
                                        <Text fontSize="sm" color="gray.600">{driversLicenseUpload.fileName}</Text>
                                        <CheckCircleIcon color="green.500" boxSize={5} />
                                        <Button size="xs" colorScheme="red" variant="ghost" onClick={handleRemoveLicense}>Remove</Button>
                                    </Flex>
                                ) : (
                                    <Flex alignItems="center" gap={3}>
                                        <Box
                                            border="2px dashed"
                                            borderColor="gray.300"
                                            borderRadius="md"
                                            px={4}
                                            py={2}
                                            cursor="pointer"
                                            _hover={{ borderColor: "brand.primary" }}
                                            onClick={() => licenseFileInputRef.current?.click()}
                                        >
                                            <Flex alignItems="center" gap={2}>
                                                <AttachmentIcon color="gray.400" />
                                                <Text fontSize="sm" color="gray.500">
                                                    Click to upload a JPG
                                                </Text>
                                            </Flex>
                                        </Box>
                                        <input
                                            type="file"
                                            ref={licenseFileInputRef}
                                            style={{ display: "none" }}
                                            accept=".jpg,.jpeg"
                                            onChange={handleLicenseFileUpload}
                                        />

                                        {driversLicenseUpload.errorMessage && (
                                            <Flex alignItems="center" gap={2}>
                                                <WarningIcon color="red.500" boxSize={5} />
                                                <Box>
                                                    <Text fontSize="sm" color="red.500">
                                                        {driversLicenseUpload.errorMessage}
                                                    </Text>
                                                    {driversLicenseUpload.errorMessage.includes("2MB") && (
                                                        <Text fontSize="sm" color="red.500">or</Text>
                                                    )}
                                                    {driversLicenseUpload.errorMessage.includes("2MB") && (
                                                        <Text fontSize="sm" color="red.500">
                                                            Unable to upload file as it must be a JPG
                                                        </Text>
                                                    )}
                                                </Box>
                                            </Flex>
                                        )}
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>

                        {/* Row 3: Business checkbox */}
                        <Flex
                            px={6}
                            py={4}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            alignItems="center"
                            gap={4}
                        >
                            <Text fontSize="sm" fontWeight="medium" w="250px">
                                Are you applying on behalf of a business or organisation?
                            </Text>
                            <Flex flex="1" gap={3}>
                                <Checkbox
                                    isChecked={isApplyingAsBusiness}
                                    onChange={handleBusinessCheckboxToggle}
                                    colorScheme="purple"
                                    size="lg"
                                />
                            </Flex>
                        </Flex>

                        {/* Business fields - only show if checkbox is ticked */}
                        {isApplyingAsBusiness && (
                            <>
                                {/* ABN input field */}
                                <Flex
                                    px={6}
                                    py={4}
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                    alignItems="center"
                                    gap={4}
                                >
                                    <Text fontSize="sm" fontWeight="medium" w="250px">
                                        Business ABN Required:
                                    </Text>
                                    <Input
                                        placeholder="Please enter the ABN"
                                        value={businessAbnText}
                                        onChange={(e) => handleAbnTextChange(e.target.value)}
                                        maxW="300px"
                                        size="sm"
                                        borderColor="gray.300"
                                    />
                                </Flex>

                                {/* Certificate of Registration upload */}
                                <Flex
                                    px={6}
                                    py={4}
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                    alignItems="center"
                                    gap={4}
                                >
                                    <Text fontSize="sm" fontWeight="medium" w="250px">
                                        Certificate of Registration for Business
                                    </Text>
                                    <Flex flex="1" alignItems="center" gap={3}>
                                        {businessCertUpload.isUploaded ? (
                                            <Flex alignItems="center" gap={2}>
                                                <Text fontSize="sm" color="gray.600">{businessCertUpload.fileName}</Text>
                                                <CheckCircleIcon color="green.500" boxSize={5} />
                                                <Button size="xs" colorScheme="red" variant="ghost" onClick={handleRemoveBusinessCert}>Remove</Button>
                                            </Flex>
                                        ) : (
                                            <Flex alignItems="center" gap={3}>
                                                <Box
                                                    border="2px dashed"
                                                    borderColor="gray.300"
                                                    borderRadius="md"
                                                    px={4}
                                                    py={2}
                                                    cursor="pointer"
                                                    _hover={{ borderColor: "brand.primary" }}
                                                    onClick={() => businessCertFileInputRef.current?.click()}
                                                >
                                                    <Flex alignItems="center" gap={2}>
                                                        <AttachmentIcon color="gray.400" />
                                                        <Text fontSize="sm" color="gray.500">
                                                            Click to upload a PDF
                                                        </Text>
                                                    </Flex>
                                                </Box>
                                                <input
                                                    type="file"
                                                    ref={businessCertFileInputRef}
                                                    style={{ display: "none" }}
                                                    accept=".pdf"
                                                    onChange={handleBusinessCertFileUpload}
                                                />

                                                {businessCertUpload.errorMessage && (
                                                    <Flex alignItems="center" gap={2}>
                                                        <WarningIcon color="red.500" boxSize={5} />
                                                        <Text fontSize="sm" color="red.500">{businessCertUpload.errorMessage}</Text>
                                                    </Flex>
                                                )}
                                            </Flex>
                                        )}
                                    </Flex>
                                </Flex>
                            </>
                        )}
                    </Box>
                </Box>
            </Flex>

            <Footer />
        </Flex>
    );
}
