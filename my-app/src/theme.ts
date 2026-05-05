import { extendTheme } from "@chakra-ui/react";

// our app colours and font
const theme = extendTheme({
  colors: {
    brand: {
      primary: "#4C2C62",
      secondary: "#E3D6EB",
    },
  },
  fonts: {
    heading: `'Inter Variable', sans-serif`,
    body: `'Inter Variable', sans-serif`,
  },
});

export default theme;
