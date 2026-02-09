import nodemailer from "nodemailer";
import { emailTemplates, EmailTemplateType } from "@/lib/email-templates";

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

interface SessionBookingEmailData {
  studentName: string;
  coachName: string;
  sessionDate: string;
  duration: number;
  meetLink?: string;
}

export class EmailService {
  private static createTransporter() {
    return nodemailer.createTransport({
      // host: process.env.SMTP_HOST,
      // port: parseInt(process.env.SMTP_PORT || "587"),
      // secure: process.env.SMTP_SECURE === "true",
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  static async sendEmail(
    options: SendEmailOptions & { replyTo?: string },
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const transporter = this.createTransporter();

      await transporter.sendMail({
        from: `"From Nebula"`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }
  }

  static async sendWebinarRegistrationEmail(
    userEmail: string,
    data: WebinarRegistrationEmailData,
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Webinar Registration Confirmed: ${data.eventTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #ffffff; }
          .meeting-info { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Webinar Registration Confirmed</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            
            <p>Thank you for registering for our upcoming webinar. Here are your event details:</p>
            
            <div class="meeting-info">
              <h3>${data.eventTitle}</h3>
              <p><strong>Date & Time:</strong> ${new Date(
                data.eventDate,
              ).toLocaleString()}</p>
              <p><strong>Host:</strong> ${data.organizerName}</p>
              <p><strong>Description:</strong></p>
              <p>${data.eventDescription}</p>
            </div>
            
            <h3>Join the Webinar</h3>
            <p>Click the button below to join the webinar at the scheduled time:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${
                data.meetingUrl
              }" class="button" target="_blank">Join Google Meet</a>
            </p>
            
            <p><strong>Meeting Link:</strong> <a href="${
              data.meetingUrl
            }" target="_blank">${data.meetingUrl}</a></p>
            
            <h3>Important Notes</h3>
            <ul>
              <li>Please join the meeting a few minutes before the scheduled start time</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Test your audio and video beforehand</li>
              <li>Have a backup plan (phone dial-in) in case of technical issues</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to reach out to us.</p>
            
            <p>Looking forward to seeing you at the webinar!</p>
            
            <p>Best regards,<br>The Nebula Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent because you registered for a webinar on Nebula.</p>
            <p>© ${new Date().getFullYear()} Nebula. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Webinar Registration Confirmed: ${data.eventTitle}
      
      Hi ${data.userName},
      
      Thank you for registering for our upcoming webinar.
      
      Event Details:
      - Title: ${data.eventTitle}
      - Date: ${new Date(data.eventDate).toLocaleString()}
      - Host: ${data.organizerName}
      - Description: ${data.eventDescription}
      
      Join the webinar: ${data.meetingUrl}
      
      Please join a few minutes before the scheduled start time.
      
      Best regards,
      The Nebula Team
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }

  static async sendSessionBookingEmails(
    coachEmail: string,
    studentEmail: string,
    data: SessionBookingEmailData,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Send email to coach
      const coachResult = await this.sendSessionBookingEmailToCoach(
        coachEmail,
        data,
      );

      // Send email to student
      const studentResult = await this.sendSessionBookingEmailToStudent(
        studentEmail,
        data,
      );

      if (!coachResult.success || !studentResult.success) {
        return {
          success: false,
          error: `Failed to send emails: ${coachResult.error || ""} ${
            studentResult.error || ""
          }`.trim(),
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to send session booking emails",
      };
    }
  }

  static async sendSessionBookingEmailToCoach(
    coachEmail: string,
    data: SessionBookingEmailData,
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `New Session Booked with ${data.studentName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #ffffff; }
          .session-info { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Session Booked</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${data.coachName}!</h2>
            
            <p>Great news! ${
              data.studentName
            } has booked a coaching session with you.</p>
            
            <div class="session-info">
              <h3>Session Details</h3>
              <p><strong>Student:</strong> ${data.studentName}</p>
              <p><strong>Date & Time:</strong> ${new Date(
                data.sessionDate,
              ).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
              ${
                data.meetLink
                  ? `
                <p><strong>Meeting Link:</strong> <a href="${data.meetLink}" target="_blank">${data.meetLink}</a></p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="${data.meetLink}" class="button" target="_blank">Join Google Meet</a>
                </p>
              `
                  : ""
              }
            </div>
            
            <h3>Preparation Tips</h3>
            <ul>
              <li>Review the student's profile and goals beforehand</li>
              <li>Prepare relevant materials or exercises</li>
              <li>Test your video and audio setup before the session</li>
              <li>Join the meeting a few minutes early</li>
            </ul>
            
            <p>You can manage your sessions and view more details in your coach dashboard.</p>
            
            <p>Best regards,<br>The Nebula Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Nebula. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: coachEmail, subject, html });
  }

  static async sendSessionBookingEmailToStudent(
    studentEmail: string,
    data: SessionBookingEmailData,
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Session Confirmed with ${data.coachName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #ffffff; }
          .session-info { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Session Booking Confirmed</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${data.studentName}!</h2>
            
            <p>Your coaching session has been successfully booked! Here are the details:</p>
            
            <div class="session-info">
              <h3>Session Details</h3>
              <p><strong>Coach:</strong> ${data.coachName}</p>
              <p><strong>Date & Time:</strong> ${new Date(
                data.sessionDate,
              ).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
              ${
                data.meetLink
                  ? `
                <p><strong>Meeting Link:</strong> <a href="${data.meetLink}" target="_blank">${data.meetLink}</a></p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="${data.meetLink}" class="button" target="_blank">Join Google Meet</a>
                </p>
              `
                  : ""
              }
            </div>
            
            <h3>What to Expect</h3>
            <ul>
              <li>Join the meeting a few minutes before the scheduled time</li>
              <li>Come prepared with any questions or topics you'd like to discuss</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Find a quiet space for the session</li>
            </ul>
            
            <h3>Need to Reschedule?</h3>
            <p>If you need to reschedule or cancel this session, please contact your coach or visit your dashboard at least 24 hours in advance.</p>
            
            <p>We're excited for your upcoming session!</p>
            
            <p>Best regards,<br>The Nebula Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Nebula. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: studentEmail, subject, html });
  }

  static async sendProgramProposalEmail(
    recipientEmail: string,
    templateType: EmailTemplateType,
    firstName: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates[templateType]({ firstName });

      return this.sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
      });
    } catch (error: any) {
      console.error("Failed to send program proposal email:", error);
      return {
        success: false,
        error: error.message || "Failed to send program proposal email",
      };
    }
  }

  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationUrl: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates.VERIFY_EMAIL({
        firstName,
        verificationUrl,
      });

      return this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error: any) {
      console.error("Failed to send verification email:", error);
      return {
        success: false,
        error: error.message || "Failed to send verification email",
      };
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetUrl: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates.RESET_PASSWORD({
        firstName,
        resetUrl,
      });

      return this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      return {
        success: false,
        error: error.message || "Failed to send password reset email",
      };
    }
  }

  static async sendSessionCancelledEmails(
    coachEmail: string,
    studentEmail: string,
    data: SessionBookingEmailData & { reason?: string; cancelledBy: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = `Session Cancelled: ${data.studentName} & ${data.coachName}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #ef4444;">Session Cancelled</h2>
          <p>The coaching session scheduled for <strong>${new Date(data.sessionDate).toLocaleString()}</strong> has been cancelled by <strong>${data.cancelledBy}</strong>.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <p>If you have any questions, please contact the other party or bridge the gap through our messaging system.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Nebula. All rights reserved.</p>
        </div>
      `;

      const coachResult = await this.sendEmail({
        to: coachEmail,
        subject,
        html,
      });
      const studentResult = await this.sendEmail({
        to: studentEmail,
        subject,
        html,
      });

      return { success: coachResult.success && studentResult.success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async sendSessionRescheduledEmails(
    coachEmail: string,
    studentEmail: string,
    data: SessionBookingEmailData & { oldDate: string; rescheduledBy: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = `Session Rescheduled: ${data.studentName} & ${data.coachName}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Session Rescheduled</h2>
          <p>The coaching session has been rescheduled by <strong>${data.rescheduledBy}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Old Time:</strong> ${new Date(data.oldDate).toLocaleString()}</p>
            <p style="margin: 5px 0 0 0;"><strong>New Time:</strong> ${new Date(data.sessionDate).toLocaleString()}</p>
            <p style="margin: 5px 0 0 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
          </div>
          ${data.meetLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetLink}">${data.meetLink}</a></p>` : ""}
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Dashboard</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Nebula. All rights reserved.</p>
        </div>
      `;

      const coachResult = await this.sendEmail({
        to: coachEmail,
        subject,
        html,
      });
      const studentResult = await this.sendEmail({
        to: studentEmail,
        subject,
        html,
      });

      return { success: coachResult.success && studentResult.success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async sendContactFormEmail(data: {
    fullName: string;
    email: string;
    university: string;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = `New Contact Form Submission from ${data.fullName}`;
      const recipientEmail =
        process.env.CONTACT_EMAIL || process.env.SMTP_USER || "";

      if (!recipientEmail) {
        throw new Error(
          "Recipient email not configured (CONTACT_EMAIL or SMTP_USER)",
        );
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #059669;">New Contact Form Message</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.fullName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>University:</strong> ${data.university}</p>
          </div>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">${data.message}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Sent from Nebula Contact Form</p>
        </div>
      `;

      return this.sendEmail({
        to: recipientEmail,
        subject,
        html,
        replyTo: data.email,
        text: `New message from ${data.fullName} (${data.email}) - University: ${data.university}\n\n${data.message}`,
      });
    } catch (error: any) {
      console.error("Failed to send contact form email:", error);
      return { success: false, error: error.message };
    }
  }

  static validateConfiguration(): boolean {
    const requiredEnvVars = [
      "SMTP_USER",
      "SMTP_PASSWORD",
      // "CONTACT_EMAIL" // Optional, falls back to SMTP_USER
    ];

    return requiredEnvVars.every((varName) => !!process.env[varName]);
  }
}
