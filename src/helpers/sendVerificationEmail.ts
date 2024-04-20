import { transporter } from "../lib/nodeMailer";
import { VerificationEmail } from "emails/VerificationEmail";
import { ApiResponse } from "~/types/ApiResponse";
import { render } from "@react-email/render";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  const emailHtml = render(VerificationEmail({ username, otp: verifyCode }));

  try {
    const options = {
      from: process.env.USER,
      to: email,
      subject: "FeedBack App | Verification Code",
      html: emailHtml,
    };

    await transporter.sendMail(options);

    return {
      success: true,
      message: "Verification email send successfully.",
    };
  } catch (emailError) {
    console.error("Error sending verification email.");
    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
