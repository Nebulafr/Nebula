import { Pinecone } from '@pinecone-database/pinecone';
import Stripe from "stripe";
import OpenAI from "openai";

export * from './types.js';
/* --- Pinecone (Vector Store) --- */

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

export const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'nebula-ai-index';


/** Get a reference to a Pinecone index with a specific namespace */
export const getPineconeIndex = (namespace: string) => {
  return pinecone.index(PINECONE_INDEX).namespace(namespace);
};

/* --- Stripe (Payments) --- */

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2022-08-01" as any,
  typescript: true,
});

/* --- OpenAI (AI Service) --- */

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
