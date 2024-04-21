import { db } from "~/server/db";
import { verifySchema } from "~/schemas/verifySchema";

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();

    const result = verifySchema.safeParse(reqBody);

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
              ? (fieldErrorsCombined += ", " + errorMessages)
              : (fieldErrorsCombined += errorMessages);
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

    const { username, code } = reqBody;

    const user = await db.user.findUnique({ where: { username } });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry!) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      await db.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
        },
      });

      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 },
      );
    } else {
      // Code is incorrect
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 },
    );
  }
}
