import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { verifyPassword, hashPassword } from "@lib/auth/passwords";
import { Session } from "@lib/auth/session";
import prisma from "@lib/prisma";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    // The maximum age of the NextAuth.js issued JWT in seconds.
    //   // Defaults to `session.maxAge`.
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/sign-in",
    // signOut: "/auth/logout",
    // error: "/auth/error", // Error code passed in query string as ?error=
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "app-login",
      name: "App Login",
      credentials: {
        email: {
          label: "Email Address",
          type: "email",
          placeholder: "john.doe@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your super secure password",
        },
      },
      async authorize(credentials) {
        try {
          let maybeUser = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              role: true,
            },
          });

          if (!maybeUser) {
            if (!credentials.password || !credentials.email) {
              throw new Error("Invalid Credentials");
            }

            maybeUser = await prisma.user.create({
              data: {
                email: credentials.email,
                password: await hashPassword(credentials.password),
              },
              select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
              },
            });
          } else {
            const isValid = await verifyPassword(
              credentials.password,
              maybeUser.password
            );

            if (!isValid) {
              throw new Error("Invalid Credentials");
            }
          }

          return {
            id: maybeUser.id,
            email: maybeUser.email,
            name: maybeUser.name,
            role: maybeUser.role,
          };
        } catch (error) {
          console.log(error);
          throw error;
        }
      },
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Administrator Login",
      credentials: {
        email: {
          label: "Email Address",
          type: "email",
          placeholder: "john.doe@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your super secure password",
        },
      },
      async authorize(credentials) {
        let maybeUser = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
          },
        });

        if (!maybeUser) {
          throw new Error("Unauthorized.");
        }

        if (maybeUser?.role !== "ADMIN") {
          throw new Error("Unauthorized.");
        }

        const isValid = await verifyPassword(
          credentials.password,
          maybeUser.password
        );

        if (!isValid) {
          throw new Error("Invalid Credentials");
        }

        return {
          id: maybeUser.id,
          email: maybeUser.email,
          name: maybeUser.name,
          role: maybeUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token, user }) {
      const sess: Session = {
        ...session,
        user: {
          ...session.user,
          id: token && token.id ? (token.id as string) : null,
          role: token && token.role ? (token.role as string) : null,
        },
      };

      return sess;
    },
  },
});
