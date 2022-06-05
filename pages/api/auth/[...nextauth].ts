import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: "71576b9573d910b7a9b0",
      clientSecret: "cd1a9436606e039e78ee946c3641976bcf028ca2",
    }),
    // ...add more providers here
  ],
});
