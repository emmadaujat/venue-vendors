import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Text, Box } from "@chakra-ui/react";
const COLOURS = ["#e260c2", "#4014a5", "#d69e2e"];

type Props = {
  data: Record<string, string | number>[];
  hirerNames: string[];
  venueNames: Record<string, string>;
};

// tooltip that shows venue name on hover instead of just the ID
const CustomTooltip = ({ active, payload, label, venueNames }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={3}>
        <Text fontWeight="bold" mb={2}>
          {venueNames[label] ?? label}
        </Text>

        {payload.map((entry: any) => (
          <Text key={entry.name} color={entry.fill} fontSize="sm">
            {entry.name}: {entry.value} approvals
          </Text>
        ))}
      </Box>
    );
  }
  return null;
};

const Graph = ({ data, hirerNames, venueNames }: Props) => {
  return (
    <BarChart
      width={900}
      height={600}
      data={data}
      margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
    >
      {/* draw a bar for each hirer */}
      {hirerNames.map((name, idx) => (
        <Bar key={name} dataKey={name} fill={COLOURS[idx]} />
      ))}

      <CartesianGrid stroke="#4C2C62" />

      <XAxis
        tick={{ fontSize: 20 }}
        dataKey="venue"
        height={60}
        textAnchor="middle"
        label={{
          position: "bottom",
          value: "Venues",
          offset: 40,
          fontSize: "large",
          fontWeight: "bold",
        }}
      />
      <YAxis
        label={{
          value: "Approvals",
          angle: -90,
          position: "insideLeft",
          offset: -10,
          fontSize: "large",
          fontWeight: "bold",
        }}
      />

      <Tooltip content={<CustomTooltip venueNames={venueNames} />} />
      <Legend />
    </BarChart>
  );
};

export default Graph;
