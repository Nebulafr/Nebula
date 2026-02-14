"use server";

import { emailService } from "@/app/api/services/email.service";
import { contactFormSchema, ContactFormData } from "@/lib/validations";

export async function submitContactForm(data: ContactFormData) {
  try {
    const validatedData = contactFormSchema.parse(data);

    const result = await emailService.sendContactFormEmail(validatedData);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send message",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return {
      success: false,
      error: error.message || "Failed to submit contact form",
    };
  }
}
