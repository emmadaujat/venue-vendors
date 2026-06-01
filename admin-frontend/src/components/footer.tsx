import { Box, Flex, Text } from "@chakra-ui/react";

// Admin console footer
export default function Footer() {
  return (
    <Box bg="brand.primary" color="white" p={5}>
      <Flex justify="space-between" ml={"20px"}>
        <Text>© 2026 Venue Vendors, Inc</Text>
        <Flex gap={7} fontSize="xs" mr={"20px"}>
          <Text>Privacy Policy</Text>
          <Text>Terms & Conditions</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
