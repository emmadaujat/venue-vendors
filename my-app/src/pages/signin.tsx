import { isValidEmail, isValidPassword } from "@/validation";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import { Box, FormControl, FormLabel, Text, Input, Button, Link, Spinner } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

export default function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validateEmail, setValidateEmail] = useState<string | null>(null); // can be a string or null
  const [validatePassword, setValidatePassword] = useState<string | null>(null);
  const [invalidSignIn, setInvalidSignIn] = useState(false); // State to track if signin details are registered
  const [signInSuccess, setSignInSuccess] = useState(false);

  // track if user tried to submit
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  // useAuth gives us the login() function so we don't have to write
  const { login } = useAuth();

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((curValue) => ({
      ...curValue,
      [name]: value, // This is saying "update whichever field matches the name of the input that was typed in."
    }));

    // clear errors as user types
    if (name === "email") setValidateEmail(null);
    if (name === "password") setValidatePassword(null);
    setInvalidSignIn(false);
  }

  // validates and submits the form
  async function handleSubmit() {
    setSubmitted(true);
    const emailError = isValidEmail(formData.email);
    const passwordError = isValidPassword(formData.password);

    // check if fields are valid
    if (emailError || passwordError) {
      // setting my functions to display error message
      setValidateEmail(emailError);
      setValidatePassword(passwordError);
    } else {
      // check with backend
      try {
        const user = await login(formData.email, formData.password);
        const redirectPath = user.role === "hirer" ? "/hirer/dashboard" : "/vendorDashboard";
        setTimeout(() => router.push(redirectPath), 2000); // Display sign in success and redirect after 2seconds
        setSignInSuccess(true);
      } catch (err) {
        setInvalidSignIn(true);
      }
    }
  }

  return (
    <Box display="flex" flexDirection="column" minHeight={"100vh"}>
      <NavBar />

      {/* purple header */}
      <Box
        height={"300px"}
        bg="brand.secondary"
        width={"100%"}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        pr={200}
      >
        {/* welcome text */}
        <Box textAlign="left" mb={3}>
          <Text color="brand.primary" fontSize="md" fontWeight="light">
            It's good to see you again...
          </Text>
          <Text mt={2} color="brand.primary" fontSize="3xl" fontWeight="regular">
            Welcome back to
          </Text>
          <Box pl={8}>
            <Logo fontSize="50px"></Logo>
          </Box>

          <Text color="brand.primary" fontSize="md" fontWeight="light">
            Sign in with your email and password to reconnect with us
          </Text>
        </Box>
      </Box>

      {/* form box */}
      <Box
        p={16}
        flex="1"
        position="relative"
        zIndex={1}
        width={"40%"}
        mt={"-250px"} // Pushing sign in box on top of purple background
        ml={16}
        mb={16}
        borderColor="grey"
        boxShadow="lg"
        justifyContent="center"
        bg="white"
        borderRadius={8}
      >
        {signInSuccess ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            py={10}
          >
            {/* success tick */}
            <CheckIcon color="green.400" boxSize={12} mb={4} />
            <Text mt={4} fontWeight="bold" color="brand.primary" fontSize="2xl">
              Sign in successful
            </Text>
            <Text fontSize="md" color="brand.primary" mb={4}>
              Please wait while we process your request
            </Text>
            <Spinner color="brand.primary" size="lg" />
          </Box>
        ) : (
          <>
            <Text
              justifySelf="center"
              fontSize={"3xl"}
              color="brand.primary"
              fontWeight="bold"
              marginBottom={8}
            >
              Sign In
            </Text>

            {/* email field */}
            <FormControl isRequired>
              <FormLabel>Enter your email address</FormLabel>
              <Input
                name="email"
                fontSize="small"
                placeholder="Please enter your email address"
                onChange={handleInput}
              />
              {submitted && validateEmail && (
                <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                  {validateEmail}
                </Text>
              )}{" "}
              {/* adding error message if email is not valid */}
            </FormControl>

            {/* password field */}
            <FormControl isRequired>
              <FormLabel marginTop={5}>Enter your password</FormLabel>
              <Input
                name="password"
                type="password" // this is used to hash password on type
                fontSize="small"
                placeholder="Please enter your password"
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} // press enter to sign in
              />
              {submitted && validatePassword && (
                <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                  {validatePassword}
                </Text>
              )}{" "}
              {/* adding error message if password is not valid */}
            </FormControl>

            {/* error if credentials dont match */}
            {submitted && invalidSignIn && (
              <Text fontSize={"13px"} fontWeight={"semibold"} color="red.400">
                Incorrect email or password. Please try again
              </Text>
            )}

            {/* submit button */}
            <Button
              justifyItems="center"
              onClick={handleSubmit}
              bg="brand.primary"
              color="white"
              size="md"
              mt={10}
              width={"100%"}
              fontSize="xl"
              _hover={{ bg: "brand.secondary", color: "brand.primary" }}
            >
              Sign In
            </Button>

            {/* link to sign up */}
            <Text fontSize="sm" mt={4} textAlign={"center"}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                color="brand.primary"
                fontWeight="m"
                textDecoration="underline"
                _hover={{ fontWeight: "semibold" }}
              >
                Sign up here
              </Link>
            </Text>
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
