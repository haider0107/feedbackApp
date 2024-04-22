import { z } from "zod";
import { usernameValidation } from "./signUpSchema";

export const messageSchema = z.object({
  username: usernameValidation,
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters." })
    .max(300, { message: "Content must not be longer than 300 characters." }),
});
