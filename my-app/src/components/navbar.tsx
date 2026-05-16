import SignOutButton from "@/components/signout";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/useAuth";
import { getVendorStats, getHirerStats } from "@/hirerRatingCalculation";
import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import type { Application, Venue, Booking, VendorComment } from "@/types";

import {
  Box,
  Flex,
  Input,
  Text,
  Button,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import NextLink from "next/link";

// single nav link with hover style
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Text
        color={"brand.primary"}
        fontWeight={"medium"}
        fontSize={"l"}
        _hover={{
          color: "brand.primary",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {children}
      </Text>
    </Link>
  );
}

// top nav bar - checks who is logged in and shows the right buttons
function NavBar() {
  const { user, isLoggedIn, isHirer, isVendor, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchText, setSearchText] = useState("");

  // pressing Enter in search bar goes to browseVenues with the query
  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchText.trim() !== "") {
      router.push("/browseVenues?search=" + encodeURIComponent(searchText.trim()));
    }
  }

  // display star rating (avgRating) with total bookings
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      if (isVendor) {
        const data = await vendorApi.getVendorBookings(user!.id);
        setBookings(data);
      }
      // TODO: add hirer bookings when built
    } catch (error) {
      console.log("Error fetching bookings", error); //log any error
    }
  };

  // Get avg rating
  const avgRating =
    bookings.length > 0
      ? bookings.reduce((acc, curr) => acc + curr.vendorRating, 0) / bookings.length
      : 0;

  return (
    <Box bg="white" p={4} ml={"20px"} mr={"20px"}>
      <Flex alignItems="center" justify="space-between">
        {/* logo */}
        <Flex>
          <Link href={"/"}>
            <Logo></Logo>
          </Link>
        </Flex>

        {/* search bar */}
        <Flex flex={1} maxW="400px">
          <InputGroup>
            <InputLeftElement>
              <SearchIcon color={"gray.400"} />
            </InputLeftElement>
            <Input
              variant="outline"
              placeholder="Search venues, locations or event types..."
              borderRadius={"8px"}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
          </InputGroup>
        </Flex>

        {/* links on the right */}
        <Flex gap={6} alignItems="center">
          <NavLink href="/browseVenues">Browse Venues</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact</NavLink>

          {/* show sign up/in if not logged in */}
          {!isLoggedIn ? (
            <>
              <NavLink href="/signup">Sign Up</NavLink>
              <Link href="/signin">
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
              </Link>
            </>
          ) : (
            <>
              {/* logged in - show user info and avatar dropdown */}
              <Flex alignItems="center" gap={3}>
                <Box textAlign="left">
                  <Text fontSize="sm" color="gray.600">
                    Hi, {user?.firstName} {user?.lastName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {isHirer ? "Hirer" : "Vendor"} Account
                  </Text>
                  <Flex alignItems="center" gap={3}>
                    <Box display="flex" alignItems={"center"} gap={1}>
                      <StarIcon color="yellow.600" boxSize={3} />
                      <Text color="yellow.600" fontSize="sm">
                        {avgRating.toFixed(1)} ({bookings.length})
                      </Text>
                    </Box>
                    <NextLink href={isHirer ? "/hirer/dashboard" : "/vendorDashboard"}>
                      <Text
                        fontSize="small"
                        color="brand.primary"
                        _hover={{ textDecoration: "underline" }}
                      >
                        Profile →
                      </Text>
                    </NextLink>
                  </Flex>
                </Box>
                {/* avatar with dropdown menu */}
                <Menu>
                  <MenuButton>
                    <Avatar
                      name={`${user?.firstName} ${user?.lastName}`}
                      bg="brand.secondary"
                      color="brand.primary"
                      size="lg"
                      cursor="pointer"
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => router.push(isHirer ? "/hirer/dashboard" : "/vendorDashboard")}
                    >
                      View Profile
                    </MenuItem>
                    <SignOutButton />
                  </MenuList>
                </Menu>
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default NavBar;
