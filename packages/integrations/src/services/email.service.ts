import { env } from "../config/env.js";

export type EmailTemplateType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_APPROVED"
  | "PROGRAM_LIVE"
  | "APPLICATION_DECLINED"
  | "VERIFY_EMAIL"
  | "RESET_PASSWORD";

interface TemplateParams {
  firstName: string;
  verificationUrl?: string;
  resetUrl?: string;
}

const emailTemplates = {
  VERIFY_EMAIL: ({ firstName, verificationUrl }: TemplateParams) => ({
    subject: "Verify your Nebula account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Welcome to Nebula, ${firstName}!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account and start exploring our coaching programs.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Nebula. All rights reserved.</p>
      </div>
    `,
    text: `
      Welcome to Nebula, ${firstName}!
      
      Thank you for signing up. Please verify your email address to activate your account and start exploring our coaching programs.
      
      Verify your email by clicking or copying the following link:
      ${verificationUrl}
      
      This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Nebula. All rights reserved.
    `,
  }),
  RESET_PASSWORD: ({ firstName, resetUrl }: TemplateParams) => ({
    subject: "Reset your Nebula password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Hello ${firstName},</h2>
        <p>We received a request to reset your Nebula password. Click the button below to choose a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="color: #64748b; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Nebula. All rights reserved.</p>
      </div>
    `,
    text: `
      Hello ${firstName},
      
      We received a request to reset your Nebula password. Reset your password by clicking or copying the following link:
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Nebula. All rights reserved.
    `,
  }),
  APPLICATION_RECEIVED: ({ firstName }: TemplateParams) => ({
    subject: "We’ve received your Immersion Program application",
    html: `
      <p>Hello ${firstName},</p>
      <p>Thank you for submitting your application to propose an Immersion Program on Nebula.</p>
      <p>Our team will get back to you shortly.</p>
      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),
  APPLICATION_APPROVED: ({ firstName }: TemplateParams) => ({
    subject: "Your Immersion Program proposal has been approved",
    html: `
      <p>Hello ${firstName},</p>
      <p>We’re pleased to inform you that your Immersion Program proposal has been approved by the Nebula team.</p>
      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),
  PROGRAM_LIVE: ({ firstName }: TemplateParams) => ({
    subject: "Your Immersion Program is now live on Nebula 🚀",
    html: `
      <p>Hello ${firstName},</p>
      <p>We’re excited to let you know that your Immersion Program is now live on the Nebula platform.</p>
      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),
  APPLICATION_DECLINED: ({ firstName }: TemplateParams) => ({
    subject: "Update on your Immersion Program application",
    html: `
      <p>Hello ${firstName},</p>
      <p>Thank you for taking the time to submit your Immersion Program application to Nebula.</p>
      <p>After careful review, we regret to inform you that we will not be moving forward at this stage.</p>
      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),
};

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface WebinarRegistrationEmailData {
  userName: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  meetingUrl: string;
  organizerName: string;
}

interface EventRegistrationEmailData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  lumaEventLink: string;
  eventImage?: string;
}

interface SessionBookingEmailData {
  studentName: string;
  coachName: string;
  sessionDate: string;
  duration: number;
  meetLink?: string;
}

export class EmailService {
  async sendEmail(
    options: SendEmailOptions & { replyTo?: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const apiKey = env.ZEPTOMAIL_API_KEY;
      const fromAddress = env.ZEPTOMAIL_FROM_ADDRESS;

      const recipients = Array.isArray(options.to)
        ? options.to.map((email) => ({
            email_address: { address: email.trim() },
          }))
        : [{ email_address: { address: options.to.trim() } }];

      const payload: any = {
        from: { address: fromAddress, name: "Nebula" },
        to: recipients,
        subject: options.subject,
        htmlbody: options.html,
        textbody: options.text || this.stripHtml(options.html),
      };

      if (options.replyTo) {
        payload.reply_to = [{ address: options.replyTo, name: "Reply To" }];
      }

      const response = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ZeptoMail API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }
  }

  async sendWebinarRegistrationEmail(userEmail: string, data: WebinarRegistrationEmailData) {
    const subject = `Webinar Registration Confirmed: ${data.eventTitle}`;
    const html = `<h2>Hi ${data.userName}!</h2><p>Registration confirmed for ${data.eventTitle}.</p>`;
    return this.sendEmail({ to: userEmail, subject, html });
  }

  async sendVerificationEmail(email: string, firstName: string, verificationUrl: string) {
    const template = emailTemplates.VERIFY_EMAIL({ firstName, verificationUrl });
    return this.sendEmail({ to: email, subject: template.subject, html: template.html, text: template.text });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
    const template = emailTemplates.RESET_PASSWORD({ firstName, resetUrl });
    return this.sendEmail({ to: email, subject: template.subject, html: template.html, text: template.text });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, "").trim();
  }
}

export const emailService = new EmailService();
