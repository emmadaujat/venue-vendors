// Step 2 Event Details: event name, type, dates, guest count, setup time, description

import { Box, Text, Flex, Input, Textarea, Select } from "@chakra-ui/react";

// Event type dropdown options
const EVENT_TYPE_OPTIONS = ["Corporate", "Wedding", "Conference", "Gala Dinner", "Other"];

type StepEventDetailsProps = {
    eventNameText: string;
    setEventNameText: (val: string) => void;
    eventTypeChoice: string;
    setEventTypeChoice: (val: string) => void;
    eventStartDateText: string;
    setEventStartDateText: (val: string) => void;
    eventEndDateText: string;
    setEventEndDateText: (val: string) => void;
    expectedGuestCountText: string;
    setExpectedGuestCountText: (val: string) => void;
    setupTimeText: string;
    setSetupTimeText: (val: string) => void;
    eventDescriptionText: string;
    setEventDescriptionText: (val: string) => void;
    errors: { [fieldName: string]: string };
};

export default function StepEventDetails(props: StepEventDetailsProps) {
    return (
        <Box>
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6} mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>Event details</Text>

                {/* Event name + Event type */}
                <Flex gap={6} mb={4}>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Event name</Text>
                        <Input
                            placeholder="e.g. Annual corporate gala"
                            value={props.eventNameText}
                            onChange={(e) => props.setEventNameText(e.target.value)}
                        />
                        {props.errors.eventName && (
                            <Text fontSize="xs" color="red.500" mt={1}>{props.errors.eventName}</Text>
                        )}
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Event type</Text>
                        <Select
                            placeholder="Select event type"
                            value={props.eventTypeChoice}
                            onChange={(e) => props.setEventTypeChoice(e.target.value)}
                        >
                            {EVENT_TYPE_OPTIONS.map((eventType) => (
                                <option key={eventType} value={eventType}>{eventType}</option>
                            ))}
                        </Select>
                        {props.errors.eventType && (
                            <Text fontSize="xs" color="red.500" mt={1}>{props.errors.eventType}</Text>
                        )}
                    </Box>
                </Flex>

                {/* Event date + End date */}
                <Flex gap={6} mb={4}>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Event date</Text>
                        <Input
                            placeholder="DD/MM/YYYY"
                            value={props.eventStartDateText}
                            onChange={(e) => props.setEventStartDateText(e.target.value)}
                        />
                        {props.errors.eventStartDate && (
                            <Text fontSize="xs" color="red.500" mt={1}>{props.errors.eventStartDate}</Text>
                        )}
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>End date (if multi-day)</Text>
                        <Input
                            placeholder="DD/MM/YYYY"
                            value={props.eventEndDateText}
                            onChange={(e) => props.setEventEndDateText(e.target.value)}
                        />
                        {props.errors.eventEndDate && (
                            <Text fontSize="xs" color="red.500" mt={1}>{props.errors.eventEndDate}</Text>
                        )}
                    </Box>
                </Flex>

                {/* Guest count + Setup time */}
                <Flex gap={6} mb={4}>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Expected guest count</Text>
                        <Input
                            placeholder="e.g. 150"
                            value={props.expectedGuestCountText}
                            onChange={(e) => props.setExpectedGuestCountText(e.target.value)}
                        />
                        {props.errors.expectedGuestCount && (
                            <Text fontSize="xs" color="red.500" mt={1}>{props.errors.expectedGuestCount}</Text>
                        )}
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Setup time required</Text>
                        <Input
                            placeholder="2 hours"
                            value={props.setupTimeText}
                            onChange={(e) => props.setSetupTimeText(e.target.value)}
                        />
                    </Box>
                </Flex>

                {/* Event description */}
                <Box mb={2}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Event description</Text>
                    <Textarea
                        placeholder="Describe your event, purpose, and any special requirements..."
                        value={props.eventDescriptionText}
                        onChange={(e) => props.setEventDescriptionText(e.target.value)}
                        rows={4}
                    />
                </Box>
            </Box>
        </Box>
    );
}
