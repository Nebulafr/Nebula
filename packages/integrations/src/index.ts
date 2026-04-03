import { Pinecone } from '@pinecone-database/pinecone';
import Stripe from "stripe";
import OpenAI from "openai";
import { env } from './config/env.js';

export * from './types';

/* --- Pinecone (Vector Store) --- */

export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const PINECONE_INDEX = env.PINECONE_INDEX_NAME;


/** Get a reference to a Pinecone index with a specific namespace */
export const getPineconeIndex = (namespace: string) => {
  return pinecone.index(PINECONE_INDEX).namespace(namespace);
};

/* --- Stripe (Payments) --- */

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01" as any,
  typescript: true,
});

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/* --- Services --- */

export * from './services/openai.service';
export * from './services/vector-db.service';
export * from './services/vector-hub.service';
export * from './services/upload.service';
export * from './services/email.service';
export * from './services/stripe-account.service';
