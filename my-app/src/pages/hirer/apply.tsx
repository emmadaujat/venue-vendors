import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import useApplicationForm from "@/hooks/useApplicationForm";
import { CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";

import { Box, Text, Flex, Button, Badge } from "@chakra-ui/react";
import Link from "next/link";

// Import each step component
import StepAccount from "@/components/applySteps/StepAccount";
import StepEventDetails from "@/components/applySteps/StepEventDetails";
import StepReputation from "@/components/applySteps/StepReputation";
import StepDocuments from "@/components/applySteps/StepDocuments";
import StepReview from "@/components/applySteps/StepReview";

// The five steps shown in the progress bar
const APPLICATION_STEP_LABELS = ["Account", "Event details", "Reputation", "Documents", "Review"];


export default function HirerApplyForVenue() {
    const { user } = useAuth("hirer");

    // All form state + logic lives in this hook (see hooks/useApplicationForm.ts)
    const form = useApplicationForm(user);

    if (!user) return null;


    // Success page after submission
    if (form.applicationSubmittedSuccessfully) {
        return (
            <Flex flexDirection="column" minHeight="100vh">
                <NavBar />
                <Flex flex="1" justifyContent="center" alignItems="center">
                    <Box textAlign="center" p={10}>
                        <CheckCircleIcon color="green.500" boxSize={16} mb={4} />
                        <Text fontSize="2xl" fontWeight="bold" mb={2}>Application Submitted!</Text>
                        <Text color="gray.600" mb={2}>Your application for <strong>{form.selectedVenue?.name}</strong> has been submitted successfully.</Text>
                        <Text color="gray.500" mb={6}>Status: <Badge colorScheme="yellow" fontSize="sm">Pending</Badge></Text>
                        <Flex gap={4} justifyContent="center">
                            <Link href="/hirer/dashboard"><Button bg="brand.primary" color="white" _hover={{ opacity: 0.85 }}>Go to Dashboard</Button></Link>
                            <Link href="/browseVenues"><Button variant="outline" borderColor="brand.primary" color="brand.primary">Browse More Venues</Button></Link>
                        </Flex>
                    </Box>
                </Flex>
                <Footer />
            </Flex>
        );
    }


    // Main page render
    return (
        <Flex flexDirection="column" minHeight="100vh">
            <NavBar />
            <Flex flex="1">

                {/* LEFT SIDEBAR */}
                <Box w="220px" flexShrink={0} py={6} pl={6} pr={4}>
                    <Text fontSize="md" fontWeight="bold" mb={1}>My Application</Text>
                    {form.selectedVenue && (
                        <Box mb={4}>
                            <Text fontSize="xs" color="gray.500">Venue:</Text>
                            <Text fontSize="sm" fontWeight="medium">{form.selectedVenue.name},</Text>
                            <Text fontSize="sm" color="gray.600">{form.selectedVenue.location}</Text>
                        </Box>
                    )}
                    <Flex flexDirection="column" gap={2} mb={6}>
                        {APPLICATION_STEP_LABELS.map((label, index) => {
                            const stepNum = index + 1;
                            const isActive = stepNum === form.currentStepNumber;
                            const isCompleted = stepNum < form.currentStepNumber;
                            return (
                                <Flex key={label} alignItems="center" gap={2} cursor={isCompleted ? "pointer" : "default"} onClick={() => { if (isCompleted) form.setCurrentStepNumber(stepNum); }}>
                                    <Box w="8px" h="8px" borderRadius="full" bg={isActive ? "brand.primary" : isCompleted ? "green.400" : "gray.300"} />
                                    <Text fontSize="sm" fontWeight={isActive ? "bold" : "normal"} color={isActive ? "brand.primary" : "gray.600"}>{label}</Text>
                                </Flex>
                            );
                        })}
                    </Flex>
                    <Text fontSize="xs" color="gray.400" mt={6} mb={1}>MyAccount</Text>
                    <Link href="/hirer/myDetails"><Text fontSize="sm" color="gray.600" _hover={{ textDecoration: "underline" }} mb={1}>Settings</Text></Link>
                </Box>

                {/* MAIN CONTENT */}
                <Box flex="1" p={6} maxW="800px">

                    {/* Title + Save / Delete Draft */}
                    <Flex justifyContent="space-between" alignItems="center" mb={4}>
                        <Text fontSize="xl" fontWeight="bold">Hire application</Text>
                        <Flex alignItems="center" gap={3}>
                            {form.showDraftSavedMessage && <Text fontSize="sm" color="green.500">Draft saved!</Text>}
                            <Button bg="brand.primary" color="white" size="sm" _hover={{ opacity: 0.85 }} onClick={form.handleSaveDraft}>Save draft</Button>
                            <Button colorScheme="red" variant="outline" size="sm" onClick={form.handleDeleteDraft}>Delete draft</Button>
                        </Flex>
                    </Flex>

                    {/* PROGRESS BAR */}
                    <Flex justifyContent="center" alignItems="center" mb={2} mt={2}>
                        {APPLICATION_STEP_LABELS.map((label, index) => {
                            const stepNum = index + 1;
                            const isActive = stepNum === form.currentStepNumber;
                            const isCompleted = stepNum < form.currentStepNumber;
                            return (
                                <Flex key={label} alignItems="center">
                                    <Flex flexDirection="column" alignItems="center" mx={2}>
                                        <Flex w="36px" h="36px" borderRadius="full" bg={isCompleted ? "brand.primary" : "white"} border="2px solid" borderColor={isCompleted || isActive ? "brand.primary" : "gray.300"} justifyContent="center" alignItems="center" color={isCompleted ? "white" : isActive ? "brand.primary" : "gray.400"} fontWeight="bold" fontSize="sm">
                                            {isCompleted ? <CheckIcon boxSize={3} /> : stepNum}
                                        </Flex>
                                        <Text fontSize="xs" mt={1} color={isActive ? "brand.primary" : "gray.500"} fontWeight={isActive ? "bold" : "normal"}>{label}</Text>
                                    </Flex>
                                    {index < APPLICATION_STEP_LABELS.length - 1 && <Box w="60px" h="2px" bg={stepNum < form.currentStepNumber ? "brand.primary" : "gray.300"} mb={4} />}
                                </Flex>
                            );
                        })}
                    </Flex>
                    <Text textAlign="center" fontSize="sm" color="gray.500" mb={6}>Complete all steps to submit your venue hire application.</Text>

                    {/* STEP CONTENT - each step is its own component */}
                    {form.currentStepNumber === 1 && <StepAccount user={user} />}

                    {form.currentStepNumber === 2 && (
                        <StepEventDetails
                            eventNameText={form.eventNameText} setEventNameText={form.setEventNameText}
                            eventTypeChoice={form.eventTypeChoice} setEventTypeChoice={form.setEventTypeChoice}
                            eventStartDateText={form.eventStartDateText} setEventStartDateText={form.setEventStartDateText}
                            eventEndDateText={form.eventEndDateText} setEventEndDateText={form.setEventEndDateText}
                            expectedGuestCountText={form.expectedGuestCountText} setExpectedGuestCountText={form.setExpectedGuestCountText}
                            setupTimeText={form.setupTimeText} setSetupTimeText={form.setSetupTimeText}
                            eventDescriptionText={form.eventDescriptionText} setEventDescriptionText={form.setEventDescriptionText}
                            errors={form.stepTwoErrors}
                        />
                    )}

                    {form.currentStepNumber === 3 && (
                        <StepReputation
                            previousVenuesHiredText={form.previousVenuesHiredText} setPreviousVenuesHiredText={form.setPreviousVenuesHiredText}
                            yearsOfExperienceText={form.yearsOfExperienceText} setYearsOfExperienceText={form.setYearsOfExperienceText}
                            selectedReputationTags={form.selectedReputationTags} handleReputationTagToggle={form.handleReputationTagToggle}
                            errors={form.stepThreeErrors}
                        />
                    )}

                    {form.currentStepNumber === 4 && (
                        <StepDocuments
                            licenseFileName={form.licenseFileName} licenseUploaded={form.licenseUploaded} licenseErrorText={form.licenseErrorText}
                            licenseFileInputRef={form.licenseFileInputRef} handleLicenseFileUpload={form.handleLicenseFileUpload} handleRemoveLicense={form.handleRemoveLicense}
                            insuranceFileName={form.insuranceFileName} insuranceUploaded={form.insuranceUploaded} insuranceErrorText={form.insuranceErrorText}
                            insuranceFileInputRef={form.insuranceFileInputRef} handleInsuranceFileUpload={form.handleInsuranceFileUpload} handleRemoveInsurance={form.handleRemoveInsurance}
                            permitFileName={form.permitFileName} permitUploaded={form.permitUploaded} permitErrorText={form.permitErrorText}
                            permitFileInputRef={form.permitFileInputRef} handlePermitFileUpload={form.handlePermitFileUpload} handleRemovePermit={form.handleRemovePermit}
                            isApplyingForBusiness={form.isApplyingForBusiness} setIsApplyingForBusiness={form.setIsApplyingForBusiness}
                            businessAbnNumberText={form.businessAbnNumberText} setBusinessAbnNumberText={form.setBusinessAbnNumberText}
                            businessCertFileName={form.businessCertFileName} businessCertUploaded={form.businessCertUploaded} businessCertErrorText={form.businessCertErrorText}
                            businessCertFileInputRef={form.businessCertFileInputRef} handleBusinessCertUpload={form.handleBusinessCertUpload} handleRemoveBusinessCert={form.handleRemoveBusinessCert}
                            errors={form.stepFourErrors}
                        />
                    )}

                    {form.currentStepNumber === 5 && (
                        <StepReview
                            user={user} selectedVenue={form.selectedVenue}
                            eventNameText={form.eventNameText} eventTypeChoice={form.eventTypeChoice}
                            eventStartDateText={form.eventStartDateText} eventEndDateText={form.eventEndDateText}
                            expectedGuestCountText={form.expectedGuestCountText} setupTimeText={form.setupTimeText}
                            eventDescriptionText={form.eventDescriptionText}
                            previousVenuesHiredText={form.previousVenuesHiredText} yearsOfExperienceText={form.yearsOfExperienceText}
                            selectedReputationTags={form.selectedReputationTags}
                            licenseUploaded={form.licenseUploaded} licenseFileName={form.licenseFileName}
                            insuranceUploaded={form.insuranceUploaded} insuranceFileName={form.insuranceFileName}
                            permitUploaded={form.permitUploaded} permitFileName={form.permitFileName}
                            isApplyingForBusiness={form.isApplyingForBusiness} businessAbnNumberText={form.businessAbnNumberText}
                            businessCertUploaded={form.businessCertUploaded} businessCertFileName={form.businessCertFileName}
                            credibilityStarRating={form.calculateCredibilityStarRating()}
                            handleSubmitApplication={form.handleSubmitApplication}
                        />
                    )}

                    {/* BACK / CONTINUE buttons */}
                    {form.currentStepNumber < 5 && (
                        <Flex justifyContent="space-between" mt={8}>
                            {form.currentStepNumber > 1 ? (
                                <Button variant="outline" borderColor="brand.primary" color="brand.primary" onClick={form.handleGoBackToPreviousStep}>Back</Button>
                            ) : <Box />}
                            <Button bg="brand.primary" color="white" _hover={{ opacity: 0.85 }} onClick={form.handleContinueToNextStep}>
                                Continue to {APPLICATION_STEP_LABELS[form.currentStepNumber]}
                            </Button>
                        </Flex>
                    )}
                    {form.currentStepNumber === 5 && (
                        <Flex justifyContent="flex-start" mt={4}>
                            <Button variant="outline" borderColor="brand.primary" color="brand.primary" onClick={form.handleGoBackToPreviousStep}>Back</Button>
                        </Flex>
                    )}
                </Box>
            </Flex>
            <Footer />
        </Flex>
    );
}
