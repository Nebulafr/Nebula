import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const _env = {
    DATABASE_URL: process.env.DATABASE_URL,
}

export const env = _env;