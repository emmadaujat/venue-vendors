import { Flex, Text } from "@chakra-ui/react";

interface LogoProps {
  fontSize?: string;
}

// text logo component - just need to specify the font size when using
export default function Logo({ fontSize = "35px " }: LogoProps) {
  return (
    <Flex>
      <Text fontWeight="bold" fontSize={fontSize} color="black">
        Venue
      </Text>
      <Text fontWeight="bold" fontSize={fontSize} color="brand.primary">
        Vendors
      </Text>
    </Flex>
  );
}
