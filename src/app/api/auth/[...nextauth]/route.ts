import NextAuth from "next-auth/next";
import { authOptions } from "./options";
import { NextAuthOptions } from "next-auth";

const handler: NextAuthOptions = NextAuth(authOptions);

export { handler as GET, handler as POST };
