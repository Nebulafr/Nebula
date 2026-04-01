import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  ZEPTOMAIL_API_KEY: z.string().min(1),
  ZEPTOMAIL_FROM_ADDRESS: z.string().email().optional(),
  CONTACT_EMAIL: z.string().email().optional(),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_INDEX_NAME: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_WS_URL: z.string().url(),
  NEXT_PUBLIC_CALENDLY_URL: z.string().url(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

const mergedSchema = serverEnvSchema.merge(clientEnvSchema);
const isServer = typeof window === "undefined";

/** 
 * Direct mapping of NEXT_PUBLIC variables to ensure Next.js bundles them for the client.
 */
const clientEnvValues = {
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || (process.env as any).STRIPE_PUBLISHABLE_KEY,
};

// Validate server env only on server
const serverParsed = isServer ? serverEnvSchema.safeParse(process.env) : { success: true, data: {} };
// Validate client env everywhere
const clientParsed = clientEnvSchema.safeParse(clientEnvValues);

if (!serverParsed.success || !clientParsed.success) {
  if (isServer) {
    console.error("❌ Invalid environment variables in @nebula/web:", {
      ...(serverParsed.success ? {} : (serverParsed as any).error.format()),
      ...(clientParsed.success ? {} : (clientParsed as any).error.format()),
    });
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
  }
}

/** Server + Client env (typed) */
export const env = {
  ...clientEnvValues,
  ...(serverParsed.success ? (serverParsed as any).data : {}),
} as z.infer<typeof mergedSchema>;

/** Public Client-only env (typed) */
export const publicEnv = clientParsed.success
  ? clientParsed.data
  : clientEnvSchema.parse(clientEnvValues);
