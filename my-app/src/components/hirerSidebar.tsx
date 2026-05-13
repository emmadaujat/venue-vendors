import { Box, Text, Flex } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";
import NextLink from "next/link";
import { useRouter } from "next/router";
import SignOutButton from "@/components/signout";

// sidebar links for the hirer pages
const SIDEBAR_LINKS = [
  { label: "My Dashboard", pagePath: "/hirer/dashboard" },
  { label: "My Profile", pagePath: "/hirer/userProfile" },
  { label: "Saved Venues", pagePath: "/hirer/savedVenues" },
  { label: "Booking History", pagePath: "/hirer/bookingHistory" },
  { label: "Compliance Documents", pagePath: "/hirer/complianceDocuments" },
  { label: "My Details", pagePath: "/hirer/myDetails" },
];

function HirerSidebar() {
  const router = useRouter();
  const currentPage = router.pathname;

  return (
    <Box w="220px" minH="100%" bg="blackAlpha.200" p={4} flexShrink={0}>
      {/* menu links */}
      <Box mb={2} ml={4}>
        <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={2}>
          ACCOUNT PROFILE
        </Text>

        {SIDEBAR_LINKS.map((item) => {
          const active = currentPage === item.pagePath;
          return (
            <NextLink href={item.pagePath} key={item.label}>
              <Flex
                align="center"
                gap={2}
                px={3}
                py={2}
                bg={active ? "white" : "transparent"}
                _hover={{ bg: "white", cursor: "pointer" }}
                borderRight={active ? "5px solid" : "5px solid transparent"}
                borderColor={active ? "brand.primary" : "transparent"}
                mx={-4}
              >
                <FaCircle size={8} color={active ? "#4C2C62" : "rgba(0, 0, 0, 0.08)"} />
                <Text
                  fontSize="md"
                  fontWeight={active ? "bold" : "normal"}
                  color={active ? "brand.primary" : "gray.700"}
                >
                  {item.label}
                </Text>
              </Flex>
            </NextLink>
          );
        })}
      </Box>

      {/* sign out button at the bottom */}
      <Box mb={2} ml={4}>
        <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={2}>
          ACCOUNT
        </Text>
        <SignOutButton />
      </Box>
    </Box>
  );
}

export default HirerSidebar;
