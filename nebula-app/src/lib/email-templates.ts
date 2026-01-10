export type EmailTemplateType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_APPROVED"
  | "PROGRAM_LIVE"
  | "APPLICATION_DECLINED";

interface TemplateParams {
  firstName: string;
}

export const emailTemplates = {
  APPLICATION_RECEIVED: ({ firstName }: TemplateParams) => ({
    subject: "We’ve received your Immersion Program application",
    html: `
      <p>Hello ${firstName},</p>

      <p>
        Thank you for submitting your application to propose an Immersion Program on Nebula.
        We confirm that our team has successfully received your application and is currently
        reviewing your profile and program structure.
      </p>

      <p>
        Please note that Immersion Programs on Nebula follow a selective and curated model,
        distinct from other offerings on the platform. Each proposal is reviewed based on
        expertise, pedagogical quality, and alignment with Nebula’s immersion framework.
      </p>

      <p>Our team will get back to you shortly with next steps.</p>

      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),

  APPLICATION_APPROVED: ({ firstName }: TemplateParams) => ({
    subject: "Your Immersion Program proposal has been approved",
    html: `
      <p>Hello ${firstName},</p>

      <p>
        We’re pleased to inform you that your Immersion Program proposal has been approved by
        the Nebula team.
      </p>

      <p>
        We believe your expertise and program vision align well with Nebula’s immersion model
        and quality standards.
      </p>

      <p>As a next step, we will move forward with:</p>

      <ul>
        <li>Finalizing the collaboration and confidentiality framework</li>
        <li>Structuring the program within Nebula’s standard immersion format</li>
        <li>Preparing onboarding for platform setup</li>
      </ul>

      <p>
        You will shortly receive the necessary documents to formalize our collaboration.
        We look forward to building this Immersion Program together.
      </p>

      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),

  PROGRAM_LIVE: ({ firstName }: TemplateParams) => ({
    subject: "Your Immersion Program is now live on Nebula 🚀",
    html: `
      <p>Hello ${firstName},</p>

      <p>
        We’re excited to let you know that your Immersion Program is now live on the Nebula
        platform.
      </p>

      <p>
        The program has been fully set up under the Nebula label and is ready to welcome its
        first cohort.
      </p>

      <p>
        As a reminder, Immersion Programs on Nebula are cohort-based, delivered within a
        structured pedagogical framework, and designed to generate strong, measurable
        outcomes for participants.
      </p>

      <p>Thank you for contributing your expertise to Nebula.</p>

      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),

  APPLICATION_DECLINED: ({ firstName }: TemplateParams) => ({
    subject: "Update on your Immersion Program application",
    html: `
      <p>Hello ${firstName},</p>

      <p>
        Thank you for taking the time to submit your Immersion Program application to Nebula.
      </p>

      <p>
        After careful review, we regret to inform you that we will not be moving forward with
        your proposal at this stage.
      </p>

      <p>
        This decision does not reflect the quality of your background or experience. Due to
        the selective nature of Nebula Immersion Programs, we must ensure a very close fit
        with our current pedagogical structure, positioning, and cohort objectives.
      </p>

      <p>
        We appreciate your interest in Nebula and encourage you to consider reapplying in the
        future as your program evolves.
      </p>

      <p>
        We wish you continued success in your professional and educational initiatives.
      </p>

      <p>Best regards,<br/>The Nebula Team</p>
    `,
  }),
};
