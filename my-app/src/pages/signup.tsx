import {
  isValidConfirmPassword,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
} from "@/validation";
import { useState } from "react";
import { useRouter } from "next/router";
import { authApi } from "@/services/authApi";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import {
  Box,
  FormControl,
  FormLabel,
  Text,
  Input,
  Button,
  IconButton,
  Flex,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "",
  });

  // TODO: Make it so you can press enter to sign up

  const [validateEmail, setValidateEmail] = useState<string | null>(null); // can be a string or null
  const [validatePassword, setValidatePassword] = useState<string | null>(null);
  const [validateConfirmPassword, setValidateConfirmPassword] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [validateFirstName, setValidateFirstName] = useState<string | null>(null);
  const [validateLastName, setValidateLastName] = useState<string | null>(null);
  const [validatePhoneNumber, setValidatePhoneNumber] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>("hirer"); // Track if user is hirer or vendor
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // track if user tried to submit
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((curValue) => ({
      ...curValue,
      [name]: value, // This is saying "update whichever field matches the name of the input that was typed in."
    }));

    // clear errors as user types
    if (name === "email") setValidateEmail(null);
    if (name === "password") setValidatePassword(null);
    if (name === "firstName") setValidateFirstName(null);
    if (name === "lastName") setValidateLastName(null);
    if (name === "confirmPassword") setValidateConfirmPassword(null);
    if (name == "phoneNumber") setValidatePhoneNumber(null);
  }

  // validates and submits
  async function handleSubmit() {
    setSubmitted(true);
    const emailError = isValidEmail(formData.email);
    const passwordError = isValidPassword(formData.password);
    const phoneNumberError = isValidPhoneNumber(formData.phoneNumber);

    const passwordConfirmError = isValidConfirmPassword(
      formData.password,
      formData.confirmPassword,
    );
    const firstNameError = !formData.firstName ? "First Name is required" : null;
    const lastNameError = !formData.lastName ? "Last Name is required" : null;

    // check if fields are valid
    if (emailError || passwordError || passwordConfirmError || phoneNumberError) {
      // setting my functions to display error message
      setValidateEmail(emailError);
      setValidatePassword(passwordError);
      setValidateConfirmPassword(passwordConfirmError);
      setValidateFirstName(firstNameError);
      setValidateLastName(lastNameError);
      setValidatePhoneNumber(phoneNumberError);
    } else {
      // send to backend
      try {
        await authApi.signUp({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: accountType,
        });
        setSignUpSuccess(true);
        setTimeout(() => router.push("/signin"), 2000); // Display sign up success and redirect after 2seconds
      } catch (err) {
        setSignUpError("Sign up failed. Please try again.");
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
            It's nice to meet you...
          </Text>
          <Text mt={2} color="brand.primary" fontSize="3xl" fontWeight="regular">
            Welcome to
          </Text>
          <Box pl={8}>
            <Logo fontSize="50px"></Logo>
          </Box>

          <Text color="brand.primary" fontSize="md" fontWeight="light">
            Register your details to connect with us
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
        {signUpSuccess ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            {/* success tick */}
            <IconButton
              isRound={true}
              variant="solid"
              colorScheme="green"
              aria-label="Done"
              boxSize="100px"
              fontSize="50px"
              icon={<CheckIcon />}
            />
            <Text mt={8} fontWeight="bold" color="brand.primary" fontSize="2xl">
              {" "}
              Sign Up successful
            </Text>
            <Text fontSize="md" color={"brand.primary"}>
              Please wait while we process your request
            </Text>
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
              Sign Up
            </Text>

            {/* name fields */}
            <Flex gap={4}>
              <FormControl isRequired>
                <FormLabel>Enter your first name</FormLabel>
                <Input
                  name="firstName"
                  fontSize="small"
                  placeholder="First Name"
                  onChange={handleInput}
                />
                {submitted && validateFirstName && (
                  <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                    {validateFirstName}
                  </Text>
                )}{" "}
                {/* adding error message if email is not valid */}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Enter your last name</FormLabel>
                <Input
                  name="lastName"
                  fontSize="small"
                  placeholder="Last Name"
                  onChange={handleInput}
                />
                {submitted && validateLastName && (
                  <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                    {validateLastName}
                  </Text>
                )}{" "}
                {/* adding error message if email is not valid */}
              </FormControl>
            </Flex>

            {/* account type */}
            <FormControl isRequired mt={5}>
              <FormLabel>I am signing up as a:</FormLabel>
              <RadioGroup value={accountType} onChange={setAccountType}>
                <Stack direction="row" spacing={6}>
                  <Radio value="hirer">Hirer</Radio>
                  <Radio value="vendor">Vendor</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* email field */}
            <FormControl isRequired>
              <FormLabel mt={5}>Enter your email address</FormLabel>
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

            {/* phone number field */}
            <FormControl isRequired>
              <FormLabel mt={5}>Enter your phone number</FormLabel>
              <Input
                name="phoneNumber"
                fontSize="small"
                placeholder="Please enter your phone number"
                onChange={handleInput}
              />
              {submitted && validatePhoneNumber && (
                <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                  {validatePhoneNumber}
                </Text>
              )}{" "}
              {/* adding error message if email is not valid */}
            </FormControl>

            {/* password field */}
            <FormControl isRequired>
              <FormLabel mt={5}>Enter your password</FormLabel>
              <Input
                name="password"
                type="password" // this is used to hash password on type
                fontSize="small"
                placeholder="Please enter your password"
                onChange={handleInput}
              />
              {submitted && validatePassword && (
                <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                  {validatePassword}
                </Text>
              )}{" "}
              {/* adding error message if password is not valid */}
            </FormControl>

            {/* confirm password */}
            <FormControl isRequired>
              <FormLabel mt={5}>Please confirm your password</FormLabel>
              <Input
                name="confirmPassword"
                type="password" // this is used to hash password on type
                fontSize="small"
                placeholder="Please confirm your password"
                onChange={handleInput}
              />
              {submitted && validateConfirmPassword && (
                <Text fontSize={"13px"} fontWeight={"semibold"} color={"red.400"}>
                  {validateConfirmPassword}
                </Text>
              )}{" "}
              {/* adding error message for confirming password */}
            </FormControl>

            {signUpError && (
              <Text fontSize={"13px"} fontWeight={"semibold"} color="red.400">
                {signUpError}
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
              Sign Up
            </Button>
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
