import NavBar from "../components/navbar";
import Footer from "../components/footer";
import { useAuth } from "@/hooks/useAuth";
import SignOutButton from "@/components/signout";
import { useRouter } from "next/router";
import NextLink from "next/link";

import { FaCircle } from "react-icons/fa";
import { Box, Text, Flex, List, ListItem, ListIcon, UnorderedList } from "@chakra-ui/react";

// sidebar links grouped by section
const sidebarLinks = [
  { label: "My Dashboard", group: "ACCOUNT PROFILE", href: "/vendorDashboard" },
  { label: "Applications", group: "ACCOUNT PROFILE", href: "/vendorDashboard/applications" },
  { label: "My Venues", group: "ACCOUNT PROFILE", href: "/vendorDashboard/myVenues" },
  { label: "My Details", group: "ACCOUNT PROFILE", href: "/vendorDashboard/myDetails" },
  { label: "Hirer Profiles", group: "MANAGEMENT", href: "/vendorDashboard/hirerProfiles" },
  {
    label: "Infographic Report",
    group: "MANAGEMENT",
    href: "/vendorDashboard/infographicReport",
  },
];

const sidebarGroups = ["ACCOUNT PROFILE", "MANAGEMENT", "ACCOUNT"];

const VendorDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />
      <Flex flex="1" gap={8}>
        {/* sidebar */}
        <Box w="220px" minH="100%" bg="blackAlpha.200" p={4} flexShrink={0}>
          {sidebarGroups.map((group) => (
            <Box key={group} mb={2} ml={4}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={2}>
                {group}
              </Text>

              {sidebarLinks
                .filter((item) => item.group === group)
                .map((item) => {
                  const active = router.pathname === item.href;
                  return (
                    <NextLink href={item.href} key={item.label}>
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

              {/* sign out at the bottom */}
              {group === "ACCOUNT" && <SignOutButton />}
            </Box>
          ))}
        </Box>

        {/* main content area */}
        <Box flex="1" p={6} minW={0}>
          {children}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default VendorDashboardLayout;
