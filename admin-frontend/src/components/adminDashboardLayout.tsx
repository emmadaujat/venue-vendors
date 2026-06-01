import NavBar from "./navbar";
import Footer from "./footer";
import SignOutButton from "./signout";
import { Box, Text, Flex } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

// sidebar links grouped by section
const sidebarLinks = [
  { label: "Dashboard", group: "ADMIN DASHBOARD", href: "/dashboard" },
  { label: "Venues", group: "ADMIN DASHBOARD", href: "/venues" },
  { label: "Reports", group: "ADMIN DASHBOARD", href: "/reports" },
];

const sidebarGroups = ["ADMIN DASHBOARD", "ACCOUNT"];

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // gets the current path for active link detection
  const location = useLocation();

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
                  const active = location.pathname === item.href;
                  return (
                    <Link to={item.href} key={item.label}>
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
                        {/* Small circle indicator for active state */}
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg={active ? "brand.primary" : "blackAlpha.200"}
                          flexShrink={0}
                        />
                        <Text
                          fontSize="md"
                          fontWeight={active ? "bold" : "normal"}
                          color={active ? "brand.primary" : "gray.700"}
                        >
                          {item.label}
                        </Text>
                      </Flex>
                    </Link>
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

export default AdminDashboardLayout;
