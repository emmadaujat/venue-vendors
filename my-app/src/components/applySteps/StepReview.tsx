// Step 5 Review: shows all entered info, credibility score, and submit button

import { Box, Text, Flex, Badge, Button } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import type { User, Venue } from "@/types";

type StepReviewProps = {
    user: User;
    selectedVenue: Venue | null;

    // Event details
    eventNameText: string;
    eventTypeChoice: string;
    eventStartDateText: string;
    eventEndDateText: string;
    expectedGuestCountText: string;
    setupTimeText: string;
    eventDescriptionText: string;

    // Reputation
    previousVenuesHiredText: string;
    yearsOfExperienceText: string;
    selectedReputationTags: string[];

    // Document upload statuses
    licenseUploaded: boolean;
    licenseFileName: string;
    insuranceUploaded: boolean;
    insuranceFileName: string;
    permitUploaded: boolean;
    permitFileName: string;
    isApplyingForBusiness: boolean;
    businessAbnNumberText: string;
    businessCertUploaded: boolean;
    businessCertFileName: string;

    // Credibility + submit
    credibilityStarRating: number;
    handleSubmitApplication: () => void;
};

export default function StepReview(props: StepReviewProps) {
    return (
        <Box>
            {/* All details review */}
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={4}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>Review your application</Text>
                <Text fontSize="sm" color="gray.500" mb={4}>
                    Please review all details below before submitting.
                </Text>

                {props.selectedVenue && (
                    <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Venue</Text>
                        <Text fontSize="sm">{props.selectedVenue.name}</Text>
                        <Text fontSize="xs" color="gray.500">{props.selectedVenue.location}</Text>
                    </Box>
                )}

                {/* Account details */}
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Account</Text>
                    <Text fontSize="sm">{props.user.firstName} {props.user.lastName}</Text>
                    <Text fontSize="xs" color="gray.500">{props.user.email} · {props.user.phoneNumber}</Text>
                </Box>

                {/* Event details */}
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Event details</Text>
                    <Flex gap={8} flexWrap="wrap">
                        <Box>
                            <Text fontSize="xs" color="gray.500">Event name</Text>
                            <Text fontSize="sm">{props.eventNameText}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">Event type</Text>
                            <Text fontSize="sm">{props.eventTypeChoice}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">Expected guests</Text>
                            <Text fontSize="sm">{props.expectedGuestCountText}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">Event date</Text>
                            <Text fontSize="sm">{props.eventStartDateText}</Text>
                        </Box>
                        {props.eventEndDateText && (
                            <Box>
                                <Text fontSize="xs" color="gray.500">End date</Text>
                                <Text fontSize="sm">{props.eventEndDateText}</Text>
                            </Box>
                        )}
                        {props.setupTimeText && (
                            <Box>
                                <Text fontSize="xs" color="gray.500">Setup time</Text>
                                <Text fontSize="sm">{props.setupTimeText}</Text>
                            </Box>
                        )}
                    </Flex>
                    {props.eventDescriptionText && (
                        <Box mt={2}>
                            <Text fontSize="xs" color="gray.500">Description</Text>
                            <Text fontSize="sm">{props.eventDescriptionText}</Text>
                        </Box>
                    )}
                </Box>

                {/* Reputation */}
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Reputation</Text>
                    <Flex gap={8}>
                        {props.previousVenuesHiredText && (
                            <Box>
                                <Text fontSize="xs" color="gray.500">Previous venues hired</Text>
                                <Text fontSize="sm">{props.previousVenuesHiredText}</Text>
                            </Box>
                        )}
                        {props.yearsOfExperienceText && (
                            <Box>
                                <Text fontSize="xs" color="gray.500">Years of experience</Text>
                                <Text fontSize="sm">{props.yearsOfExperienceText}</Text>
                            </Box>
                        )}
                    </Flex>
                    {props.selectedReputationTags.length > 0 && (
                        <Flex gap={2} mt={2} flexWrap="wrap">
                            {props.selectedReputationTags.map((tag) => (
                                <Badge
                                    key={tag}
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    bg="brand.secondary"
                                    color="brand.primary"
                                    fontSize="xs"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </Flex>
                    )}
                </Box>

                {/* Documents */}
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Documents uploaded</Text>
                    <Flex flexDirection="column" gap={1}>
                        <Flex alignItems="center" gap={2}>
                            {props.licenseUploaded ? (
                                <CheckCircleIcon color="green.500" boxSize={3} />
                            ) : (
                                <WarningIcon color="orange.400" boxSize={3} />
                            )}
                            <Text fontSize="sm">
                                Driver&apos;s license: {props.licenseUploaded ? props.licenseFileName : "Not uploaded"}
                            </Text>
                        </Flex>
                        <Flex alignItems="center" gap={2}>
                            {props.insuranceUploaded ? (
                                <CheckCircleIcon color="green.500" boxSize={3} />
                            ) : (
                                <WarningIcon color="orange.400" boxSize={3} />
                            )}
                            <Text fontSize="sm">
                                Public liability insurance: {props.insuranceUploaded ? props.insuranceFileName : "Not uploaded"}
                            </Text>
                        </Flex>
                        <Flex alignItems="center" gap={2}>
                            {props.permitUploaded ? (
                                <CheckCircleIcon color="green.500" boxSize={3} />
                            ) : (
                                <WarningIcon color="orange.400" boxSize={3} />
                            )}
                            <Text fontSize="sm">
                                Event permit: {props.permitUploaded ? props.permitFileName : "Not uploaded"}
                            </Text>
                        </Flex>
                        {props.isApplyingForBusiness && (
                            <>
                                <Text fontSize="sm" mt={1}>
                                    ABN: {props.businessAbnNumberText || "Not provided"}
                                </Text>
                                <Flex alignItems="center" gap={2}>
                                    {props.businessCertUploaded ? (
                                        <CheckCircleIcon color="green.500" boxSize={3} />
                                    ) : (
                                        <WarningIcon color="orange.400" boxSize={3} />
                                    )}
                                    <Text fontSize="sm">
                                        Business certificate: {props.businessCertUploaded ? props.businessCertFileName : "Not uploaded"}
                                    </Text>
                                </Flex>
                            </>
                        )}
                    </Flex>
                </Box>

                {/* Credibility Score */}
                <Box p={4} bg="brand.secondary" borderRadius="md" textAlign="center">
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Credibility Score</Text>
                    <Flex justifyContent="center" gap={1}>
                        {[1, 2, 3, 4, 5].map((starNumber) => (
                            <Text
                                key={starNumber}
                                fontSize="xl"
                                color={starNumber <= props.credibilityStarRating ? "yellow.500" : "gray.300"}
                            >
                                ★
                            </Text>
                        ))}
                    </Flex>
                    <Text fontSize="sm" color="gray.600">
                        {props.credibilityStarRating} out of 5 stars
                    </Text>
                </Box>
            </Box>

            {/* Submit button */}
            <Flex justifyContent="center" mt={4}>
                <Button
                    bg="brand.primary"
                    color="white"
                    size="lg"
                    px={10}
                    _hover={{ opacity: 0.85 }}
                    onClick={props.handleSubmitApplication}
                >
                    Submit Application
                </Button>
            </Flex>
        </Box>
    );
}
