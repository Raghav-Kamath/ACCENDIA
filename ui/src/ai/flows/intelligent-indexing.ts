'use server';

/**
 * @fileOverview This file contains the Genkit flow for intelligent indexing of documents.
 *
 * - intelligentIndexing - A function that takes document content and returns indexed information.
 * - IntelligentIndexingInput - The input type for the intelligentIndexing function.
 * - IntelligentIndexingOutput - The return type for the intelligentIndexing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentIndexingInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to be indexed.'),
});
export type IntelligentIndexingInput = z.infer<typeof IntelligentIndexingInputSchema>;

const IntelligentIndexingOutputSchema = z.object({
  indexedInformation: z
    .string()
    .describe(
      'The extracted and indexed information from the document content, optimized for semantic search.'
    ),
});
export type IntelligentIndexingOutput = z.infer<typeof IntelligentIndexingOutputSchema>;

export async function intelligentIndexing(
  input: IntelligentIndexingInput
): Promise<IntelligentIndexingOutput> {
  return intelligentIndexingFlow(input);
}

const intelligentIndexingPrompt = ai.definePrompt({
  name: 'intelligentIndexingPrompt',
  input: {schema: IntelligentIndexingInputSchema},
  output: {schema: IntelligentIndexingOutputSchema},
  prompt: `You are an expert in information retrieval and semantic search.
  Your task is to extract and index information from the given document content.
  The extracted information should be optimized for efficient semantic search.
  Consider the key topics, entities, and relationships within the document.
  Return the indexed information in a format suitable for storage in a FAISS database.

  Document Content: {{{documentContent}}}`,
});

const intelligentIndexingFlow = ai.defineFlow(
  {
    name: 'intelligentIndexingFlow',
    inputSchema: IntelligentIndexingInputSchema,
    outputSchema: IntelligentIndexingOutputSchema,
  },
  async input => {
    const {output} = await intelligentIndexingPrompt(input);
    return output!;
  }
);
