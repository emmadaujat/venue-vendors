import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, Input, Button, Spinner } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import NavBar from "../components/navbar";
import Footer from "../components/footer";

// GraphQL mutation - calls adminLogin resolver in admin-backend
const ADMIN_LOGIN = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      token
    }
  }
`;

export default function SignIn() {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Apollo mutation hook
  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN);

  async function handleLogin() {
    setErrorMessage("");

    // Basic validation
    if (!username || !password) {
      setErrorMessage("Invalid Username or Password");
      return;
    }

    try {
      const { data } = await adminLogin({
        variables: { username, password },
      });

      // Store token in sessionStorage
      sessionStorage.setItem("admin_token", data.adminLogin.token);

      // Show success state then redirect to dashboard
      setLoginSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setErrorMessage("Invalid Username or Password");
    }
  }

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Navbar */}
      <NavBar />

      <Flex flex="1" bg="brand.primary" align="center" justify="center">
        <Box bg="white" borderRadius={8} p={10} w="640px">
          <Flex gap={10}>
            <Box flex="1" pt={2}>
              <Text
                fontSize="2xl"
                color="brand.primary"
                fontWeight="normal"
                mb={3}
                align={"center"}
              >
                WELCOME TO
              </Text>
              <img
                src="/logo.png"
                alt="VenueVendors Console"
                style={{ height: "60px", width: "auto", display: "block", margin: "0 auto" }}
              />
            </Box>

            {/* Right side */}
            <Box flex="1.2">
              {!loginSuccess ? (
                <>
                  <Text fontSize="xl" fontWeight="bold" color="brand.primary" mb={4}>
                    Sign In
                  </Text>

                  {/* Username field */}
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Enter your Username
                  </Text>
                  <Input
                    placeholder="Username"
                    bg="gray.50"
                    border="none"
                    mb={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  {/* Password field */}
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Enter your Password
                  </Text>
                  <Input
                    placeholder="Password"
                    type="password"
                    bg="gray.50"
                    border="none"
                    mb={3}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()} // lets you press enter to log in
                  />

                  {/* Error message */}
                  {errorMessage && (
                    <Text fontSize="sm" color="red.500" mb={2}>
                      {errorMessage}
                    </Text>
                  )}

                  {/* Login button */}
                  <Button
                    w="100%"
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: "brand.primary" }}
                    onClick={handleLogin}
                    isLoading={loading}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                /* Success state */
                <Flex direction="column" align="center" justify="center" h="100%" py={6}>
                  <Text fontSize="xl" fontWeight="bold" color="brand.primary" mb={4}>
                    Login successful...
                  </Text>
                  <CheckCircleIcon color="green.400" boxSize={12} mb={4} />
                  <Text fontSize="sm" color="gray.500">
                    Please wait while we process your request...
                  </Text>
                  <Spinner color="brand.primary" mt={4} />
                </Flex>
              )}
            </Box>
          </Flex>
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}
