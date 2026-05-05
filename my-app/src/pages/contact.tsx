import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { Box, Text, Flex } from "@chakra-ui/react";

// contact info for the cards
const contactCards = [
  {
    title: "Contact Email",
    description: "Email to our team with questions or concerns you may have",
    detail: "venuevendor@email.com",
    linkText: "Email Support",
  },
  {
    title: "Contact Phone",
    description:
      "Give us a call with any urgent issues, available Mon-Fri 9am - 5pm to get help from our friendly support experts",
    detail: "03 9555555",
    linkText: "Call Support",
  },
  {
    title: "Visit our Office",
    description: "Read helpful articles and get help with VenueVendors",
    detail: "111 Doesn't Exist Avenue, Melbourne 3000",
    linkText: "Visit Us",
  },
];

export default function contact() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" overflow={"hidden"}>
      <NavBar />
      {/* purple header */}
      <Box height={"300px"} bg="brand.secondary" width={"100%"} alignItems="center">
        {/* title */}
        <Box textAlign="center" mt={10}>
          <Text color="brand.primary" fontSize="large" fontWeight="regular">
            Need help?
          </Text>
          <Text color="brand.primary" fontSize="3xl" fontWeight="bold">
            Get In Touch With Us Now!
          </Text>
        </Box>
      </Box>

      {/* contact cards */}
      <Flex gap={6} px={16} mt={"-115px"} mb={16} zIndex={1} position={"relative"} flex={"1"}>
        {contactCards.map((card) => (
          <Box
            key={card.title}
            p={16}
            flex="1"
            borderColor="grey"
            boxShadow="lg"
            bg="white"
            borderRadius={8}
          >
            <Text fontWeight="bold" fontSize="xl" color="brand.primary">
              {card.title}
            </Text>
            <Text mt={2} fontSize="sm">
              {card.description}
            </Text>
            <Text mt={2} fontSize="sm" fontWeight={"semibold"}>
              {card.detail}
            </Text>
            <Text mt={4} color="brand.primary" fontWeight="bold">
              {card.linkText} →
            </Text>
          </Box>
        ))}
      </Flex>
      <Footer />
    </Box>
  );
}
