import jwt from "jsonwebtoken";
import { env } from "@/config/env";

const ACCESS_SECRET = env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = env.REFRESH_TOKEN_SECRET!;

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ACCESS_SECRET);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET);
