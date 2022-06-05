import { SessionProvider } from "next-auth/react";
import "../styles/tailwind.css";
import Layout from "../components/Layout";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../lib/apollo";
import WithAuth from "@lib/auth/WithAuth";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apolloClient}>
        <Layout>
          {Component.auth ? (
            <WithAuth options={Component.auth}>
              <Component {...pageProps} />
            </WithAuth>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </ApolloProvider>
    </SessionProvider>
  );
}

export default MyApp;
