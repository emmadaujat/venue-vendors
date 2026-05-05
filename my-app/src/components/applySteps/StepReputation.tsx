// Step 3 Reputation: previous venues hired, years of experience, reputation tags

import { Box, Text, Flex, Input, Badge } from "@chakra-ui/react";

// Reputation tag options the hirer can pick from
const ALL_REPUTATION_TAG_OPTIONS = [
    "Timely payer",
    "Good communicator",
    "No prior incidents",
    "Professional setup",
    "Insured events",
];

type StepReputationProps = {
    previousVenuesHiredText: string;
    setPreviousVenuesHiredText: (val: string) => void;
    yearsOfExperienceText: string;
    setYearsOfExperienceText: (val: string) => void;
    selectedReputationTags: string[];
    handleReputationTagToggle: (tagName: string) => void;
    errors: { [fieldName: string]: string };
};

export default function StepReputation(props: StepReputationProps) {
    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Hiring reputation</Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
                Tell us about your event hiring experience. This helps vendors assess your application.
            </Text>

            <Flex gap={6} mb={4}>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Previous venues hired</Text>
                    <Input
                        placeholder="Number of past hires"
                        value={props.previousVenuesHiredText}
                        onChange={(e) => props.setPreviousVenuesHiredText(e.target.value)}
                    />
                    {props.errors.previousVenuesHired && (
                        <Text fontSize="xs" color="red.500" mt={1}>{props.errors.previousVenuesHired}</Text>
                    )}
                </Box>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Years of event experience</Text>
                    <Input
                        placeholder="e.g. 5"
                        value={props.yearsOfExperienceText}
                        onChange={(e) => props.setYearsOfExperienceText(e.target.value)}
                    />
                    {props.errors.yearsOfExperience && (
                        <Text fontSize="xs" color="red.500" mt={1}>{props.errors.yearsOfExperience}</Text>
                    )}
                </Box>
            </Flex>

            <Text fontSize="sm" fontWeight="medium" mb={2}>Reputation tags (select all that apply)</Text>
            <Flex gap={2} flexWrap="wrap">
                {ALL_REPUTATION_TAG_OPTIONS.map((tagOption) => {
                    const isSelected = props.selectedReputationTags.includes(tagOption);
                    return (
                        <Badge
                            key={tagOption}
                            px={3}
                            py={1}
                            borderRadius="full"
                            cursor="pointer"
                            bg={isSelected ? "brand.secondary" : "gray.100"}
                            color={isSelected ? "brand.primary" : "gray.600"}
                            border="1px solid"
                            borderColor={isSelected ? "brand.primary" : "gray.300"}
                            fontWeight={isSelected ? "bold" : "normal"}
                            onClick={() => props.handleReputationTagToggle(tagOption)}
                            _hover={{ bg: isSelected ? "brand.secondary" : "gray.200" }}
                        >
                            {tagOption}
                        </Badge>
                    );
                })}
            </Flex>
        </Box>
    );
}
