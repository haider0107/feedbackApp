import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { db } from "~/server/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const messages = await db.message.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!messages || messages.length === 0) {
      return Response.json(
        { message: "No Messages", success: false },
        { status: 404 },
      );
    }

    return Response.json(
      { messages: messages },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
