// Step 4 Documents: file uploads for license, insurance, permit, business cert

import { Box, Text, Flex, Input, Button, Checkbox } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, AttachmentIcon } from "@chakra-ui/icons";
import React from "react";

type StepDocumentsProps = {
    // Driver's license (JPG)
    licenseFileName: string;
    licenseUploaded: boolean;
    licenseErrorText: string;
    licenseFileInputRef: React.RefObject<HTMLInputElement | null>;
    handleLicenseFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveLicense: () => void;

    // Public liability insurance (PDF)
    insuranceFileName: string;
    insuranceUploaded: boolean;
    insuranceErrorText: string;
    insuranceFileInputRef: React.RefObject<HTMLInputElement | null>;
    handleInsuranceFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveInsurance: () => void;

    // Event permit (PDF)
    permitFileName: string;
    permitUploaded: boolean;
    permitErrorText: string;
    permitFileInputRef: React.RefObject<HTMLInputElement | null>;
    handlePermitFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemovePermit: () => void;

    // Business fields
    isApplyingForBusiness: boolean;
    setIsApplyingForBusiness: (val: boolean) => void;
    businessAbnNumberText: string;
    setBusinessAbnNumberText: (val: string) => void;
    businessCertFileName: string;
    businessCertUploaded: boolean;
    businessCertErrorText: string;
    businessCertFileInputRef: React.RefObject<HTMLInputElement | null>;
    handleBusinessCertUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveBusinessCert: () => void;

    errors: { [fieldName: string]: string };
};

export default function StepDocuments(props: StepDocumentsProps) {
    return (
        <Box>
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>Compliance documents</Text>
                <Text fontSize="sm" color="gray.500" mb={4}>
                    Upload your documents to improve your credibility score.
                    <Text as="span" color="red.500"> * Files must be less than 2MB</Text>
                </Text>

                {/* Driver's license (JPG) */}
                <Box mb={5}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Applicant&apos;s driver&apos;s license (JPG)
                    </Text>
                    {props.licenseUploaded ? (
                        <Flex alignItems="center" gap={2}>
                            <CheckCircleIcon color="green.500" />
                            <Text fontSize="sm" color="gray.600">{props.licenseFileName}</Text>
                            <Button size="xs" colorScheme="red" variant="ghost" onClick={props.handleRemoveLicense}>Remove</Button>
                        </Flex>
                    ) : (
                        <Box
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            p={4}
                            textAlign="center"
                            cursor="pointer"
                            _hover={{ borderColor: "brand.primary" }}
                            onClick={() => props.licenseFileInputRef.current?.click()}
                        >
                            <AttachmentIcon color="gray.400" mb={1} />
                            <Text fontSize="sm" color="gray.500">Click to upload a JPG</Text>
                        </Box>
                    )}
                    <input
                        type="file"
                        ref={props.licenseFileInputRef}
                        style={{ display: "none" }}
                        accept=".jpg,.jpeg"
                        onChange={props.handleLicenseFileUpload}
                    />
                    {props.licenseErrorText && (
                        <Flex alignItems="center" gap={1} mt={1}>
                            <WarningIcon color="red.500" boxSize={3} />
                            <Text fontSize="xs" color="red.500">{props.licenseErrorText}</Text>
                        </Flex>
                    )}
                </Box>

                {/* Public liability insurance (PDF) */}
                <Box mb={5}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Public liability insurance certificate (PDF)
                    </Text>
                    {props.insuranceUploaded ? (
                        <Flex alignItems="center" gap={2}>
                            <CheckCircleIcon color="green.500" />
                            <Text fontSize="sm" color="gray.600">{props.insuranceFileName}</Text>
                            <Button size="xs" colorScheme="red" variant="ghost" onClick={props.handleRemoveInsurance}>Remove</Button>
                        </Flex>
                    ) : (
                        <Box
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            p={4}
                            textAlign="center"
                            cursor="pointer"
                            _hover={{ borderColor: "brand.primary" }}
                            onClick={() => props.insuranceFileInputRef.current?.click()}
                        >
                            <AttachmentIcon color="gray.400" mb={1} />
                            <Text fontSize="sm" color="gray.500">Click to upload a PDF</Text>
                        </Box>
                    )}
                    <input
                        type="file"
                        ref={props.insuranceFileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf"
                        onChange={props.handleInsuranceFileUpload}
                    />
                    {props.insuranceErrorText && (
                        <Flex alignItems="center" gap={1} mt={1}>
                            <WarningIcon color="red.500" boxSize={3} />
                            <Text fontSize="xs" color="red.500">{props.insuranceErrorText}</Text>
                        </Flex>
                    )}
                </Box>

                {/* Event permit (PDF) */}
                <Box mb={5}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Event permit if required (PDF)
                    </Text>
                    {props.permitUploaded ? (
                        <Flex alignItems="center" gap={2}>
                            <CheckCircleIcon color="green.500" />
                            <Text fontSize="sm" color="gray.600">{props.permitFileName}</Text>
                            <Button size="xs" colorScheme="red" variant="ghost" onClick={props.handleRemovePermit}>Remove</Button>
                        </Flex>
                    ) : (
                        <Box
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            p={4}
                            textAlign="center"
                            cursor="pointer"
                            _hover={{ borderColor: "brand.primary" }}
                            onClick={() => props.permitFileInputRef.current?.click()}
                        >
                            <AttachmentIcon color="gray.400" mb={1} />
                            <Text fontSize="sm" color="gray.500">Click to upload a PDF</Text>
                        </Box>
                    )}
                    <input
                        type="file"
                        ref={props.permitFileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf"
                        onChange={props.handlePermitFileUpload}
                    />
                    {props.permitErrorText && (
                        <Flex alignItems="center" gap={1} mt={1}>
                            <WarningIcon color="red.500" boxSize={3} />
                            <Text fontSize="xs" color="red.500">{props.permitErrorText}</Text>
                        </Flex>
                    )}
                </Box>
            </Box>

            {/* Business / Organisation section */}
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
                <Flex alignItems="center" gap={3} mb={4}>
                    <Checkbox
                        isChecked={props.isApplyingForBusiness}
                        onChange={() => {
                            const newVal = !props.isApplyingForBusiness;
                            props.setIsApplyingForBusiness(newVal);
                            localStorage.setItem("complianceDoc_isBusiness", String(newVal));
                        }}
                        colorScheme="purple"
                        size="lg"
                    />
                    <Text fontSize="sm" fontWeight="medium">
                        Are you applying on behalf of a business or organisation?
                    </Text>
                </Flex>

                {props.isApplyingForBusiness && (
                    <Box pl={8}>
                        {/* ABN Number */}
                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>ABN Number</Text>
                            <Input
                                placeholder="e.g. 51 824 753 556"
                                value={props.businessAbnNumberText}
                                onChange={(e) => {
                                    props.setBusinessAbnNumberText(e.target.value);
                                    localStorage.setItem("complianceDoc_abn", e.target.value);
                                }}
                            />
                            {props.errors.businessAbn && (
                                <Text fontSize="xs" color="red.500" mt={1}>{props.errors.businessAbn}</Text>
                            )}
                        </Box>

                        {/* Certificate of registration (PDF) */}
                        <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>
                                Certificate of registration for business name (PDF)
                            </Text>
                            {props.businessCertUploaded ? (
                                <Flex alignItems="center" gap={2}>
                                    <CheckCircleIcon color="green.500" />
                                    <Text fontSize="sm" color="gray.600">{props.businessCertFileName}</Text>
                                    <Button size="xs" colorScheme="red" variant="ghost" onClick={props.handleRemoveBusinessCert}>Remove</Button>
                                </Flex>
                            ) : (
                                <Box
                                    border="2px dashed"
                                    borderColor="gray.300"
                                    borderRadius="md"
                                    p={4}
                                    textAlign="center"
                                    cursor="pointer"
                                    _hover={{ borderColor: "brand.primary" }}
                                    onClick={() => props.businessCertFileInputRef.current?.click()}
                                >
                                    <AttachmentIcon color="gray.400" mb={1} />
                                    <Text fontSize="sm" color="gray.500">Click to upload a PDF</Text>
                                </Box>
                            )}
                            <input
                                type="file"
                                ref={props.businessCertFileInputRef}
                                style={{ display: "none" }}
                                accept=".pdf"
                                onChange={props.handleBusinessCertUpload} 
                            />
                            {props.businessCertErrorText && (
                                <Flex alignItems="center" gap={1} mt={1}>
                                    <WarningIcon color="red.500" boxSize={3} />
                                    <Text fontSize="xs" color="red.500">{props.businessCertErrorText}</Text>
                                </Flex>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
