'use server';

/**
 * @fileOverview Summarizes user feedback insights, highlighting strengths, areas for improvement, and actionable suggestions.
 *
 * - summarizeFeedbackInsights - A function that summarizes feedback insights.
 * - SummarizeFeedbackInsightsInput - The input type for the summarizeFeedbackInsights function.
 * - SummarizeFeedbackInsightsOutput - The return type for the summarizeFeedbackInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInsightsInputSchema = z.object({
  ratings: z.array(z.number().min(1).max(5)).describe('An array of star ratings.'),
  strengths: z.array(z.string()).describe('An array of strings describing strengths.'),
  improvementAreas: z.array(z.string()).describe('An array of strings describing areas for improvement.'),
});
export type SummarizeFeedbackInsightsInput = z.infer<typeof SummarizeFeedbackInsightsInputSchema>;

const SummarizeFeedbackInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the feedback insights, highlighting key strengths, areas for improvement, and actionable suggestions.'),
});
export type SummarizeFeedbackInsightsOutput = z.infer<typeof SummarizeFeedbackInsightsOutputSchema>;

export async function summarizeFeedbackInsights(input: SummarizeFeedbackInsightsInput): Promise<SummarizeFeedbackInsightsOutput> {
  return summarizeFeedbackInsightsFlow(input);
}

const summarizeFeedbackInsightsPrompt = ai.definePrompt({
  name: 'summarizeFeedbackInsightsPrompt',
  input: {schema: SummarizeFeedbackInsightsInputSchema},
  output: {schema: SummarizeFeedbackInsightsOutputSchema},
  prompt: `You are an AI assistant designed to summarize feedback insights.

  Based on the provided feedback, identify key strengths, areas for improvement, and actionable suggestions for the user.

  Ratings: {{ratings}}
  Strengths: {{strengths}}
  Areas for Improvement: {{improvementAreas}}

  Provide a concise and actionable summary that the user can use to understand and act on the feedback.
  Use reasoning to decide how to incorporate the feedback into the summary.
  If the ratings are all 5s and there are no improvement areas, then the feedback is overwhelmingly positive, and the summary should reflect that.
  If the ratings are all 1s and there are no strengths, then the feedback is overwhelmingly negative, and the summary should reflect that.
`,
});

const summarizeFeedbackInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackInsightsFlow',
    inputSchema: SummarizeFeedbackInsightsInputSchema,
    outputSchema: SummarizeFeedbackInsightsOutputSchema,
  },
  async input => {
    const {output} = await summarizeFeedbackInsightsPrompt(input);
    return output!;
  }
);
