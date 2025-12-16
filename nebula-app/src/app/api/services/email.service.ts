import nodemailer from "nodemailer";

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

export class EmailService {
  private static createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  static async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const transporter = this.createTransporter();

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
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
    data: WebinarRegistrationEmailData
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
                data.eventDate
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

  static validateConfiguration(): boolean {
    const requiredEnvVars = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
    ];

    return requiredEnvVars.every((varName) => !!process.env[varName]);
  }
}
