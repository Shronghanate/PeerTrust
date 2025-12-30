'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { summarizeFeedbackInsights } from '@/ai/flows/summarize-feedback-insights';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Feedback } from '@/lib/types';

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function DashboardClient() {
  const { user, firestore } = useFirebase();
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const feedbackQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/feedback`));
  }, [user, firestore]);

  const { data: feedbackData, isLoading: isFeedbackLoading } = useCollection<Feedback>(feedbackQuery);

  const ratingsDistribution = useMemoFirebase(() => {
    const distribution = [
      { name: '1 Star', total: 0 },
      { name: '2 Stars', total: 0 },
      { name: '3 Stars', total: 0 },
      { name: '4 Stars', total: 0 },
      { name: '5 Stars', total: 0 },
    ];

    if (feedbackData) {
      for (const feedback of feedbackData) {
        if (feedback.rating >= 1 && feedback.rating <= 5) {
          distribution[feedback.rating - 1].total++;
        }
      }
    }
    return distribution;
  }, [feedbackData]);

  useEffect(() => {
    async function getSummary() {
      if (!feedbackData || feedbackData.length === 0) {
        setSummary("No feedback available to summarize yet. Interact with a peer to get started!");
        setIsSummaryLoading(false);
        return;
      }

      setIsSummaryLoading(true);
      try {
        const insightsInput = {
          ratings: feedbackData.map(f => f.rating),
          strengths: feedbackData.map(f => f.strengths).filter(Boolean) as string[],
          improvementAreas: feedbackData.map(f => f.areasForImprovement).filter(Boolean) as string[],
        };
        const result = await summarizeFeedbackInsights(insightsInput);
        setSummary(result.summary);
      } catch (error) {
        console.error("Error fetching feedback summary:", error);
        setSummary("Could not load feedback summary. Please try again later.");
      } finally {
        setIsSummaryLoading(false);
      }
    }
    getSummary();
  }, [feedbackData]);
  
  const isLoading = isFeedbackLoading || isSummaryLoading;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
          <CardDescription>A distribution of all star ratings received.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFeedbackLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingsDistribution} margin={{ top: 20, right: 20, left: -10, bottom: 0 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>A summary of your feedback, highlighting key themes and suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{summary}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
