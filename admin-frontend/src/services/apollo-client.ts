import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_ADMIN_API_URL || "http://localhost:4001/graphql",
});

const authLink = setContext((_: any, { headers }: { headers?: Record<string, string> }) => {
  // get the authentication token from session storage if it exists
  const token = sessionStorage.getItem("admin_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
