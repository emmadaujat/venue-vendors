// infographicReport.tsx - vendor analytics page (Distinction Implementation)
// Four charts powered by GET /api/vendor/stats?range=...:
//   Chart 1 - bar chart of hirer tallies per venue (CHANGE 2.1)
//   Chart 2 - stacked bar of hirer totals by venue (CHANGE 2.2)
//   Chart 3 - pie chart of most/least active hirers (CHANGE 2.3)
//   Chart 4 - line chart of venue utilization over time with zoom dropdown (CHANGE 3)

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Text,
  Avatar,
  Flex,
  Box,
  Button,
  Select,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import VendorDashboardLayout from "@/components/vendorDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { vendorApi, type VendorStats } from "@/services/vendorApi";

// Consistent colour palette across all charts so the same hirer/venue keeps the same colour.
const CHART_COLOURS = [
  "#4C2C62", // brand purple
  "#e260c2",
  "#d69e2e",
  "#38A169",
  "#3182CE",
  "#E53E3E",
  "#805AD5",
  "#DD6B20",
];

const TIME_RANGES = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "all", label: "All time" },
];

export default function InfographicReport() {
  const { user } = useAuth("vendor");

  const [selectedRange, setSelectedRange] = useState("all");
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Holds a friendly message if the backend call fails, so the
  // page never just shows a blank/forever-spinner (which looked
  // like the page "wouldn't open"). Empty string = no error.
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage("");
    vendorApi
      .getStats(selectedRange)
      .then((data) => setStats(data))
      .catch((error) => {
        console.error("Failed to load vendor stats", error);
        setErrorMessage(
          "Could not load your report data. Make sure you are signed in as a vendor and the backend server is running.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [user, selectedRange]);

  if (!user) return null;

  return (
    <VendorDashboardLayout>
      {/* Header */}
      <Flex justify="space-between">
        <Flex alignItems={"center"} gap={3}>
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            bg="brand.secondary"
            color="brand.primary"
            size="xl"
          />
          <Box>
            <Text fontWeight="semibold" color="brand.primary" fontSize="3xl">
              Welcome Back,
            </Text>
            <Text fontSize="2xl" color="brand.primary">
              {user.firstName} {user.lastName}
            </Text>
          </Box>
        </Flex>
        <NextLink href={`/vendorDashboard/myVenues`}>
          <Button
            bg="brand.primary"
            color={"white"}
            _hover={{ bg: "brand.secondary", color: "brand.primary" }}
          >
            Manage Venues
          </Button>
        </NextLink>
      </Flex>

      {/* Page title + time-range selector */}
      <Flex mt={8} mb={4} alignItems="flex-end" justify="space-between">
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            My Reports
          </Text>
          <Text fontSize="sm" color="gray.500">
            Visual overview of hirer activity across your venues.
          </Text>
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Time range (zoom)
          </Text>
          <Select
            size="sm"
            width="200px"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            bg="white"
            borderColor="gray.300"
          >
            {TIME_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>

      {/* Loading spinner while fetching */}
      {isLoading && (
        <Flex justify="center" align="center" py={20}>
          <Spinner size="lg" color="brand.primary" />
        </Flex>
      )}

      {/* Visible error banner if the backend call failed, so the
          page explains itself instead of silently showing nothing. */}
      {!isLoading && errorMessage && (
        <Box
          p={6}
          textAlign="center"
          bg="red.50"
          borderRadius="md"
          border="1px solid"
          borderColor="red.200"
        >
          <Text fontSize="md" fontWeight="semibold" color="red.600">
            {errorMessage}
          </Text>
        </Box>
      )}

      {/* Empty-state when this vendor has no activity in the
          chosen window - keeps the page from looking broken. */}
      {!isLoading && !errorMessage && stats && stats.totalBookings === 0 && (
        <Box
          p={10}
          textAlign="center"
          bg="gray.50"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            No booking activity in this period
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Try a wider time range, or wait for hirers to apply.
          </Text>
        </Box>
      )}

      {/* The four charts - only shown when we have data */}
      {!isLoading && !errorMessage && stats && stats.totalBookings > 0 && (
        <>
          {/* Chart 1 (CHANGE 2.1) - bar chart: hirer tallies per venue */}
          <Box mt={6} mb={10} p={4} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              Hirers per Venue
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Tally of every hirer who has booked each of your venues in
              the selected period.
            </Text>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.perVenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="venue" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {stats.hirerNames.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    fill={CHART_COLOURS[index % CHART_COLOURS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Chart 2 (CHANGE 2.2) - stacked bar: hirer totals by venue */}
          <Box mt={6} mb={10} p={4} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              Total Bookings per Hirer (stacked by venue)
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Each bar = one hirer&apos;s total bookings, split by which of
              your venues they booked.
            </Text>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.stackedTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hirer" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {stats.venueNames.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="all"
                    fill={CHART_COLOURS[index % CHART_COLOURS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Chart 3 (CHANGE 2.3) - pie chart: most/least active hirers */}
          <Box mt={6} mb={10} p={4} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              Hirer Activity
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Each slice is one hirer&apos;s share of bookings. The most
              and least active hirers are highlighted below.
            </Text>

            <Flex gap={6} flexWrap="wrap" alignItems="center">
              <Box flex="1" minW="320px" height="320px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.hirerPieData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      // boolean label uses recharts' built-in renderer; a custom
                      // label function crashes on some recharts versions.
                      label
                    >
                      {stats.hirerPieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLOURS[idx % CHART_COLOURS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Most/least active summary cards */}
              <Box minW="240px">
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.200"
                  mb={3}
                >
                  <Badge colorScheme="green" mb={1}>
                    Most active
                  </Badge>
                  <Text fontWeight="bold">
                    {stats.mostActive?.name ?? "N/A"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {stats.mostActive?.count ?? 0} bookings
                  </Text>
                </Box>
                <Box
                  p={4}
                  bg="orange.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <Badge colorScheme="orange" mb={1}>
                    Least active
                  </Badge>
                  <Text fontWeight="bold">
                    {stats.leastActive?.name ?? "N/A"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {stats.leastActive?.count ?? 0} bookings
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Box>

          {/* Chart 4 (CHANGE 3) - line chart: venue utilization over time */}
          <Box mt={6} mb={10} p={4} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              Venue Utilization Over Time
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Daily count of bookings across all your venues. Use the
              time-range dropdown above to zoom in or out.
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.utilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Bookings"
                  stroke={CHART_COLOURS[0]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Summary table */}
          <Box mt={8} mb={10}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Activity Summary
            </Text>
            <Table
              variant="simple"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Thead bg="brand.primary">
                <Tr>
                  <Th color="white">Hirer</Th>
                  <Th color="white">Bookings</Th>
                  <Th color="white">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.hirerPieData.map((hirer) => (
                  <Tr key={hirer.name}>
                    <Td>{hirer.name}</Td>
                    <Td>{hirer.count}</Td>
                    <Td>
                      {hirer.name === stats.mostActive?.name && (
                        <Badge colorScheme="green">Most active</Badge>
                      )}
                      {hirer.name === stats.leastActive?.name &&
                        hirer.name !== stats.mostActive?.name && (
                          <Badge colorScheme="orange">Least active</Badge>
                        )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </VendorDashboardLayout>
  );
}
