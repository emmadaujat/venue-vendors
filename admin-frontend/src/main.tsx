// ===========================================================
// admin-frontend — App 3 entry point (SCAFFOLD ONLY)
// ===========================================================
// Scaffolded as part of Task S1. The real admin dashboard
// (Apollo Client setup + login/dashboard/venues/reports pages)
// is Emma's Task B4.2, built from her Figma designs.
//
// Emma: wrap <App /> in <ApolloProvider client={client}> here,
// following weeklypracsforref/week10/week10LECTURE/example1/
// frontend (services/apollo-client.ts pattern). The GraphQL URL
// comes from import.meta.env.VITE_ADMIN_API_URL.
// ===========================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { client } from "./services/apollo-client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ApolloProvider>
  </StrictMode>,
);
