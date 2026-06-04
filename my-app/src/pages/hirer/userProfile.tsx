// userProfile.tsx - hirer's read-only profile page showing personal details and quick stats.
import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import HirerSidebar from "@/components/hirerSidebar";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/services/authApi";
import { hirerApi } from "@/services/hirerApi";
import { StarIcon } from "@chakra-ui/icons";
import type { User } from "@/types";
import { Box, Text, Flex, Avatar } from "@chakra-ui/react";
import Link from "next/link";

type DashboardSummary = {
  totalApplications: number;
  savedVenues: number;
  averageRating: number;
  totalRatings: number;
};

export default function UserProfile() {
  const { user } = useAuth("hirer");

  const [profile, setProfile] = useState<User | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalApplications: 0,
    savedVenues: 0,
    averageRating: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    if (!user) return;

    authApi
      .getProfile(user.id)
      .then((data) => setProfile(data))
      .catch((error) => console.error("Failed to load profile", error));

    hirerApi
      .getDashboard()
      .then((data: DashboardSummary) => setSummary(data))
      .catch((error) => console.error("Failed to load dashboard", error));
  }, [user]);

  if (!user) return null;

  const fullName = profile
    ? profile.firstName + " " + profile.lastName
    : user.firstName + " " + user.lastName;

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <NavBar />

      <Flex flex="1">
        <HirerSidebar />

        <Box flex="1" p={6}>
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold">
              My Profile
            </Text>
            <Text fontSize="sm" color="gray.500">
              Your account information and a summary of your activity
            </Text>
          </Box>

          {/* Profile card */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
            maxW="700px"
            mb={6}
          >
            <Flex bg="brand.primary" color="white" px={6} py={3} justifyContent="space-between">
              <Text fontWeight="semibold">Your Details</Text>
              <Text fontSize="sm">Account Type: Hirer</Text>
            </Flex>

            <Box p={6}>
              <Flex alignItems="center" gap={4} mb={6}>
                <Avatar
                  name={fullName}
                  bg="brand.secondary"
                  color="brand.primary"
                  size="xl"
                />
                <Box>
                  <Text fontSize="xl" fontWeight="bold">
                    {fullName}
                  </Text>
                  <Link href="/hirer/myDetails">
                    <Text fontSize="sm" color="brand.primary" _hover={{ textDecoration: "underline" }}>
                      Edit my details →
                    </Text>
                  </Link>
                </Box>
              </Flex>

              <Box mb={3}>
                <Text fontSize="sm" color="gray.500">Email</Text>
                <Text fontWeight="medium">{profile?.email ?? user.email}</Text>
              </Box>
              <Box mb={3}>
                <Text fontSize="sm" color="gray.500">Phone Number</Text>
                <Text fontWeight="medium">
                  {profile?.phoneNumber ?? user.phoneNumber}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Date Joined</Text>
                <Text fontWeight="medium">
                  {profile?.joinedDate
                    ? new Date(profile.joinedDate).toLocaleDateString("en-AU")
                    : "-"}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Quick stats */}
          <Flex gap={4} maxW="700px">
            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Total bookings</Text>
              <Text fontSize="2xl" fontWeight="bold">{summary.totalApplications}</Text>
            </Box>
            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Saved Venues</Text>
              <Text fontSize="2xl" fontWeight="bold">{summary.savedVenues}</Text>
            </Box>
            <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">Avg Rating</Text>
              <Flex justifyContent="center" alignItems="center" gap={1}>
                <StarIcon color="yellow.500" boxSize={4} />
                <Text fontSize="2xl" fontWeight="bold">{summary.averageRating}</Text>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}
