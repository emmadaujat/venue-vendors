import { Box, Text, Flex, Grid, Divider, Link, Button, Image } from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  StarIcon,
  ArrowUpIcon,
  AttachmentIcon,
  ArrowRightIcon,
} from "@chakra-ui/icons";
import NavBar from "../components/navbar";
import Footer from "../components/footer";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import { hirerApi } from "@/services/hirerApi";
import type { Venue } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isLoggedIn, isHirer, isVendor } = useAuth();

  const [venues, setVenues] = useState<Venue[]>([]);

  const [totalBookings, setTotalBookings] = useState<number>(0);

  useEffect(() => {
    hirerApi
      .getVenues()
      .then((data) => setVenues(data))
      .catch((error) => console.error("Failed to load venues", error));
    hirerApi
      .getPlatformStats()
      .then((data) => setTotalBookings(data.totalBookings))
      .catch((error) => console.error("Failed to load platform stats", error));
  }, []);

  // Venues an admin has marked as featured (via the admin dashboard toggle).
  // If none are featured yet, fall back to the first few venues so the
  // section is never empty.
  const featuredFromAdmin = venues.filter((v) => v.isFeatured);
  const featuredVenues = (featuredFromAdmin.length > 0 ? featuredFromAdmin : venues).slice(0, 4);

  // A couple of "limited availability" venues for the side panel.
  const limitedVenues = venues
    .filter((v) => v.availabilityStatus === "Limited Availability")
    .slice(0, 2);

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      {/* hero section */}
      <Box flex="1" bg="brand.primary" p={4} height="25vh">
        <Text ml="20px" mt="20px" color={"white"} fontSize={"3xl"} fontWeight={"regular"}>
          Find Your Perfect Venue
        </Text>
        <Box ml="20px" color={"brand.secondary"} fontSize={"small"} fontWeight={"regular"}>
          <Text>Explore hundreds of venues across Melbourne</Text>
          <Text>Submit your application to get approved in as little as 24 hours</Text>
        </Box>
        <Flex justify="flex-start" ml="20px" gap={10} mt={4}>
          {(!isLoggedIn || isVendor) && (
            <Button
              gap={2}
              as={NextLink}
              href={isVendor ? `/vendorDashboard/addVenue/` : "/signin"}
            >
              {" "}
              <span>
                {" "}
                <ArrowUpIcon />{" "}
              </span>
              List a venue
            </Button>
          )}

          {/* hide submit app button for vendors */}
          {(!isLoggedIn || isHirer) && (
            <Button gap={2} as={NextLink} href="/hirer/apply">
              {" "}
              <span>
                {" "}
                <AttachmentIcon />{" "}
              </span>{" "}
              Submit Application
            </Button>
          )}

          {/* browse venues button */}
          <Button gap={2} as={NextLink} href="/browseVenues">
            {" "}
            <span>
              {" "}
              <ArrowRightIcon />{" "}
            </span>{" "}
            Browse Venues
          </Button>
        </Flex>
      </Box>

      <Flex flex="1" gap={8} alignItems={"flex-start"} ml="20px" mr="20px" mt="20px">
        {/* left column - browse by type */}
        <Box
          w="20%"
          outline={"solid 2px"}
          outlineColor={"brand.primary"}
          borderRadius={8}
          overflow={"hidden"}
          ml="10px"
        >
          <Box bg="brand.secondary" p={4}>
            <Text fontWeight={"semibold"} fontSize={"large"} color={"brand.primary"}>
              Browse by type
            </Text>
          </Box>
          <Divider borderColor={"brand.primary"} borderWidth={"1px"} />

          <Box p={4}>
            <Flex justify="space-between">
              {" "}
              <span role="img" aria-label="briefcase">
                💼
                <Link
                  as={NextLink}
                  // link to browseVenues with filter
                  href="/browseVenues?category=Corporate"
                  _hover={{ textDecoration: "underline" }}
                  fontSize={"md"}
                >
                  Corporate
                </Link>
              </span>
              <Text fontSize={"small"} color="gray.500">
                7 venues
              </Text>
            </Flex>

            <Divider my={2} borderColor={"grey"} />

            <Flex justify={"space-between"}>
              {" "}
              <span role="img" aria-label="wedding-ring">
                💍
                <Link
                  as={NextLink}
                  // link to browseVenues with filter
                  href="/browseVenues?category=Wedding"
                  _hover={{ textDecoration: "underline" }}
                  fontSize={"md"}
                >
                  Weddings
                </Link>
              </span>
              <Text fontSize={"small"} color="gray.500">
                5 venues
              </Text>
            </Flex>
            <Divider my={2} borderColor={"grey"} />

            <Flex justify={"space-between"}>
              {" "}
              <span role="img" aria-label="microphone">
                🎤
                <Link
                  as={NextLink}
                  // link to browseVenues with filter
                  href="/browseVenues?category=Conferences"
                  _hover={{ textDecoration: "underline" }}
                  fontSize={"md"}
                >
                  Conferences
                </Link>
              </span>
              <Text fontSize={"small"} color="gray.500">
                5 venues
              </Text>
            </Flex>
            <Divider my={2} borderColor={"grey"} />

            <Flex justify={"space-between"}>
              {" "}
              <span role="img" aria-label="dinner-plate">
                🍽️
                <Link
                  as={NextLink}
                  // link to browseVenues with filter
                  href="/browseVenues?category=Gala Dinner"
                  _hover={{ textDecoration: "underline" }}
                  fontSize={"md"}
                >
                  Gala Dinners
                </Link>
              </span>
              <Text fontSize={"small"} color="gray.500">
                6 venues
              </Text>
            </Flex>
          </Box>
        </Box>

        {/* middle column - featured venues */}
        <Box flex="1">
          <Box>
            <Flex justify="space-between" alignItems="center">
              <Text fontWeight={"semibold"} fontSize={"large"}>
                Featured venues
              </Text>
              <Link href="/browseVenues">
                <Text
                  _hover={{ textDecoration: "underline" }}
                  color={"brand.primary"}
                  fontSize={"md"}
                  mt={2}
                >
                  View all venues <ArrowForwardIcon />
                </Text>
              </Link>
            </Flex>
            <Text color={"gray.500"} fontSize={"15px"}>
              Highly rated, available now
            </Text>
          </Box>

          {/* venue cards 2x2 grid */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4} mb="10%" alignItems={"stretch"}>
            {featuredVenues.map((venue) => (
              <Box
                key={venue.venueID}
                display="flex"
                flexDirection="column"
                p={10}
                flex="1"
                borderColor="grey"
                boxShadow="lg"
                bg="white"
                borderRadius={8}
                h="100%"
              >
                <Image src={venue.imageURL} alt={venue.name} objectFit="cover"></Image>
                <Text mt={2} fontWeight="bold" fontSize="xl" color="brand.primary">
                  {venue.name}
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {venue.location}
                </Text>
                <Text mt={2} fontSize="sm" fontWeight="regular">
                  {venue.shortDescription}
                </Text>
                <Box mt="auto">
                  <Flex justify="space-between" mb={2}>
                    <Text mt={4} color="brand.primary" fontWeight="semibold">
                      {venue.rating}{" "}
                      <span>
                        <StarIcon color="yellow.600"></StarIcon>
                      </span>
                    </Text>
                    <Text mt={4} color="brand.primary" fontWeight="semibold">
                      ${venue.pricePerDay}/day
                    </Text>
                  </Flex>
                  <NextLink href={`/venues/${venue.venueID}`}>
                    <Button
                      bg="brand.primary"
                      color="white"
                      width="100%"
                      mt={"auto"}
                      _hover={{
                        bg: "transparent",
                        border: "2px solid",
                        borderColor: "brand.primary",
                        color: "brand.primary",
                      }}
                    >
                      View Venue <ArrowForwardIcon />
                    </Button>
                  </NextLink>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* right column - stats and in-demand */}
        <Flex flexDirection="column" w="fit-content" gap={8} width="20%" mt={20}>
          {/* platform stats */}
          <Box
            outline={"solid 2px"}
            outlineColor={"brand.primary"}
            borderRadius={8}
            overflow={"hidden"}
            mr="10px"
          >
            <Box bg="brand.secondary" p={4}>
              <Text fontWeight={"semibold"} fontSize={"large"} color={"brand.primary"}>
                Platform overview
              </Text>
            </Box>
            <Divider borderColor={"brand.primary"} borderWidth={"1px"} />

            <Box p={4}>
              <Flex>
                <Box flex="1" textAlign="center">
                  <Text fontSize={"large"} fontWeight={"semibold"}>
                    {venues.length} +
                  </Text>
                  <Text fontSize={"md"} fontWeight={"regular"} color={"gray.500"}>
                    Venues listed
                  </Text>
                </Box>
                <Box flex="1" textAlign="center">
                  <Text fontSize={"large"} fontWeight={"semibold"}>
                    {totalBookings} +
                  </Text>
                  <Text fontSize={"md"} fontWeight={"regular"} color={"gray.500"}>
                    Events hosted
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* in-demand venues */}
          <Box
            outline={"solid 2px"}
            outlineColor={"brand.primary"}
            borderRadius={8}
            overflow={"hidden"}
            mr="10px"
          >
            <Box bg="brand.secondary" p={4}>
              <Text fontWeight={"semibold"} fontSize={"large"} color={"brand.primary"}>
                In-Demand Venues
              </Text>
              <Text fontSize={"2xs"} color={"brand.primary"}>
                Get in quick, they won't be available for long!
              </Text>
            </Box>
            <Divider borderColor={"brand.primary"} borderWidth={"1px"} />

            <Box p={4}>
              {limitedVenues.map((venue) => (
                <Box key={venue.venueID} mb={2}>
                  <Flex align={"center"} gap={4}>
                    <Text fontSize={"small"}>{venue.name}</Text>
                    <Flex align={"baseline"} gap={1}>
                      <Text fontSize={"14px"} color={"gray.500"}>
                        {venue.rating}
                      </Text>
                      <StarIcon color="yellow.600"></StarIcon>
                    </Flex>
                  </Flex>
                  <Divider borderColor={"gray"} mt={2} />
                </Box>
              ))}
            </Box>
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}
