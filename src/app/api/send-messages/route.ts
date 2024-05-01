import { db } from "~/server/db";
import { messageSchema } from "~/schemas/messageSchema";
import { SendMessage } from "~/types/RequestTypes";

export async function POST(request: Request) {
  try {
    const reqBody = (await request.json()) as SendMessage;

    const result = messageSchema.safeParse(reqBody);

    if (!result.success) {
      const errors = result.error.flatten();

      let fieldErrorsCombined = "";
      for (const key in errors.fieldErrors) {
        const errorMessages =
          errors.fieldErrors[key as keyof typeof errors.fieldErrors]; // Asserting key type
        if (errorMessages) {
          if (errorMessages.length > 1) {
            fieldErrorsCombined += errorMessages.join(", ");
          } else {
            fieldErrorsCombined.length
              ? (fieldErrorsCombined += ", " + errorMessages.join(", "))
              : (fieldErrorsCombined += errorMessages.join(", "));
          }
        }
      }

      return Response.json(
        {
          success: false,
          message: fieldErrorsCombined,
        },
        { status: 400 },
      );
    }

    const { username, content } = reqBody;

    const user = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { message: "User is not accepting messages", success: false },
        { status: 403 }, // 403 Forbidden status
      );
    }

    await db.message.create({
      data: {
        userId: user.id,
        content,
      },
    });

    return Response.json(
      { message: "Message sent successfully", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
