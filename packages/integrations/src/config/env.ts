import "dotenv/config";

export const env = {
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  ZEPTOMAIL_API_KEY: process.env.ZEPTOMAIL_API_KEY!,
  ZEPTOMAIL_FROM_ADDRESS: process.env.ZEPTOMAIL_FROM_ADDRESS!,
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
};
