import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
