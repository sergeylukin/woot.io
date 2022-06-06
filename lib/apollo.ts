import { ApolloClient, InMemoryCache } from "@apollo/client";

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://woot-io.vercel.app";

const apolloClient = new ApolloClient({
  uri: `${url}/api/graphql`,
  cache: new InMemoryCache(),
});

export default apolloClient;
