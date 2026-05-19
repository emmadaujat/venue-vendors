// Step 1 Account: shows the logged-in user's details (read-only)

import { Box, Text, Flex, Input } from "@chakra-ui/react";
import Link from "next/link";
import type { User } from "@/types";

type StepAccountProps = {
    user: User;
};

export default function StepAccount({ user }: StepAccountProps) {
    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Account details</Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
                Your account information is shown below. This will be included with your application.
            </Text>

            <Flex gap={6} mb={4}>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>First name</Text>
                    <Input value={user.firstName} isReadOnly bg="gray.50" />
                </Box>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Last name</Text>
                    <Input value={user.lastName} isReadOnly bg="gray.50" />
                </Box>
            </Flex>

            <Flex gap={6} mb={4}>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Email address</Text>
                    <Input value={user.email} isReadOnly bg="gray.50" />
                </Box>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Phone number</Text>
                    <Input value={user.phoneNumber} isReadOnly bg="gray.50" />
                </Box>
            </Flex>

            <Text fontSize="xs" color="gray.400" mt={2}>
                To update your details, go to{" "}
                <Link href="/hirer/myDetails">
                    <Text as="span" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                        My Details
                    </Text>
                </Link>
            </Text>
        </Box>
    );
}
