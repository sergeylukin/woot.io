import { PrismaClient } from "@prisma/client";
import prisma from "../lib/prisma";
import { getSession } from "next-auth/react";

export type Context = {
  user?: any;
  prisma: PrismaClient;
};
export async function createContext({ req }): Promise<Context> {
  const session = await getSession({ req });

  // if the user is not logged in, omit returning the user and accessToken
  if (!session) return { prisma };

  const { user } = session;
  return {
    user,
    prisma,
  };
}
