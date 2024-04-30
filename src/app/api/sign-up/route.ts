import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "~/helpers/sendVerificationEmail";
import { signUpSchema } from "~/schemas/signUpSchema";
import { ApiResponse } from "~/types/ApiResponse";
import { SignUp } from "~/types/RequestTypes";

export async function POST(request: Request) {
  try {
    const requestBody: SignUp = await request.json();

    const result = signUpSchema.safeParse(requestBody);

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

    const { username, email, password } = requestBody;
    const existingUserVerifiedByUsername = await db.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "User is already taken",
        },
        { status: 400 },
      );
    }

    const existingUserByEmail = await db.user.findUnique({ where: { email } });
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(existingUserByEmail);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 },
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
          },
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      await db.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessages: true,
        },
      });
    }

    let emailResponse: ApiResponse;
    if (existingUserByEmail) {
      emailResponse = await sendVerificationEmail(
        existingUserByEmail.email,
        existingUserByEmail.username,
        verifyCode,
      );
    } else {
      emailResponse = await sendVerificationEmail(email, username, verifyCode);
    }

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      },
    );
  }
}
