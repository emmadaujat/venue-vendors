import { Box, Flex, Button, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/logo";
import SignOutButton from "./signout";

// Admin navbar — shows LOG IN button when logged out,
// shows Welcome admin + Sign Out when logged in
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if admin is logged in by looking for token in sessionStorage
  const isLoggedIn = !!sessionStorage.getItem("admin_token");

  // Don't show LOG IN button if already on signin page
  const isOnSignIn = location.pathname === "/signin";

  return (
    <Box bg="white" px={6} py={3} borderBottom="1px solid" borderColor="gray.100">
      <Flex align="center" justify="space-between">
        {/* Logo — clicking takes admin to dashboard if logged in */}
        <Box
          cursor={isLoggedIn ? "pointer" : "default"}
          onClick={() => isLoggedIn && navigate("/dashboard")}
        >
          <Logo />
        </Box>

        {/* Right side — conditional based on auth state */}
        {isLoggedIn ? (
          <Flex align="baseline" gap={4}>
            <Text fontSize="md" color="brand.primary">
              Welcome, <strong>admin</strong>
            </Text>
            <SignOutButton variant="button" />{" "}
          </Flex>
        ) : (
          !isOnSignIn && (
            <Button
              bg="brand.primary"
              color="white"
              borderRadius={"8px"}
              _hover={{
                bg: "transparent",
                border: "2px solid",
                borderColor: "brand.primary",
                color: "brand.primary",
              }}
            >
              Sign In
            </Button>
          )
        )}
      </Flex>
    </Box>
  );
}
