import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import { db } from "~/server/db";
import { AcceptMessageSchema } from "../../../schemas/acceptMessageSchema";
import { AcceptMessage } from "~/types/RequestTypes";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session?.user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = user.id;

    const reqBody: AcceptMessage = await request.json();

    const result = AcceptMessageSchema.safeParse(reqBody);

    if (!result.success) {
      const usernameErrors =
        result.error.format().acceptMessages?._errors ?? [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 },
      );
    }

    const { acceptMessages } = reqBody;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isAcceptingMessages: acceptMessages,
      },
    });

    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: "Unable to find user to update message acceptance status",
        },
        { status: 404 },
      );
    }

    // Successfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error updating message acceptance status" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session?.user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const foundUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!foundUser) {
      // User not found
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 },
    );
  }
}
