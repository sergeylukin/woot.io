import { SessionProvider } from "next-auth/react";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import "../styles/tailwind.css";
import Layout from "../components/Layout";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../lib/apollo";
import WithAuth from "@lib/auth/WithAuth";

import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const colors = {
  brand: {
    500: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

const ui = (child: ReactJSXElement) => (
  <ChakraProvider theme={theme}>{child}</ChakraProvider>
);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apolloClient}>
        <Layout>
          {Component.auth ? (
            <WithAuth options={Component.auth}>
              {ui(<Component {...pageProps} />)}
            </WithAuth>
          ) : (
            ui(<Component {...pageProps} />)
          )}
        </Layout>
      </ApolloProvider>
    </SessionProvider>
  );
}

export default MyApp;
