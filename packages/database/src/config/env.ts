import "dotenv/config";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
};