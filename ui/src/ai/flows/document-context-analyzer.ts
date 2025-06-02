// The directive tells the Next.js runtime to execute this code on the server.
'use server';

/**
 * @fileOverview Analyzes the context of uploaded documents using a large language model.
 *
 * - analyzeDocumentContext - A function that analyzes the context of a document.
 * - AnalyzeDocumentContextInput - The input type for the analyzeDocumentContext function.
 * - AnalyzeDocumentContextOutput - The return type for the analyzeDocumentContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentContextInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to analyze.'),
});
export type AnalyzeDocumentContextInput = z.infer<typeof AnalyzeDocumentContextInputSchema>;

const AnalyzeDocumentContextOutputSchema = z.object({
  overallTheme: z.string().describe('The overall theme of the document.'),
  topicsCovered: z.string().describe('A list of topics covered in the document.'),
  summary: z.string().describe('A summary of the document.'),
});
export type AnalyzeDocumentContextOutput = z.infer<typeof AnalyzeDocumentContextOutputSchema>;

export async function analyzeDocumentContext(input: AnalyzeDocumentContextInput): Promise<AnalyzeDocumentContextOutput> {
  return analyzeDocumentContextFlow(input);
}

const analyzeDocumentContextPrompt = ai.definePrompt({
  name: 'analyzeDocumentContextPrompt',
  input: {schema: AnalyzeDocumentContextInputSchema},
  output: {schema: AnalyzeDocumentContextOutputSchema},
  prompt: `You are an expert document analyzer. Please analyze the context of the following document and provide the overall theme, a list of topics covered, and a summary of the document.\n\nDocument:\n{{{documentText}}}`,
});

const analyzeDocumentContextFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentContextFlow',
    inputSchema: AnalyzeDocumentContextInputSchema,
    outputSchema: AnalyzeDocumentContextOutputSchema,
  },
  async input => {
    const {output} = await analyzeDocumentContextPrompt(input);
    return output!;
  }
);
