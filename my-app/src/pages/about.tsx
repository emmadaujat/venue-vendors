import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { Box, Text, Flex } from "@chakra-ui/react";

export default function about() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />
      {/* purple header */}
      <Box height={"300px"} bg="brand.secondary" width={"100%"}>
        {/* title */}
        <Box textAlign="center" mt={10} ml={10}>
          <Text color="brand.primary" fontSize="3xl" fontWeight="bold">
            About Us
          </Text>
        </Box>
      </Box>

      {/* main content */}
      <Flex
        gap={6}
        px={10}
        ml={16}
        mt={"-200px"}
        mb={16}
        zIndex={1}
        position="relative"
        flex="1"
        width="70%"
      >
        <Box p={16} flex="1" borderColor="grey" boxShadow="lg" bg="white" borderRadius={8}>
          <Text fontWeight="bold" fontSize="xl" color="brand.primary">
            Who are we?
          </Text>
          <Text fontSize={"large"}>
            Venue Vendors is a private based company in Melbourne that aims to finding and hiring
            venues quick and seamless! We assist with the selection and hiring of venues for events
            offered by Venue Vendors
          </Text>
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
}
