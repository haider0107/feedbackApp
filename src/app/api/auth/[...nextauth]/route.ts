import NextAuth from "next-auth";
import { authOptions } from "./options";
import { NextApiHandler } from "next";

const handler: NextApiHandler = NextAuth(authOptions) as NextApiHandler;

export { handler as GET, handler as POST };
