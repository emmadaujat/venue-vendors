import { Box, Flex, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

// Admin console footer — white on sign in page, brand.primary everywhere else
export default function Footer() {
  const location = useLocation();
  const isSignIn = location.pathname === "/signin";

  return (
    <Box
      bg={isSignIn ? "white" : "brand.primary"}
      color={isSignIn ? "brand.primary" : "white"}
      borderTop={isSignIn ? "1px solid" : "none"}
      borderColor="gray.100"
      p={5}
    >
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
