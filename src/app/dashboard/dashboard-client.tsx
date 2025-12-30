'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { summarizeFeedbackInsights } from '@/ai/flows/summarize-feedback-insights';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Star, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Feedback, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';

const chartConfig = {
  total: {
    label: "Total",
  },
  ratings: {
    label: "Ratings",
  },
} satisfies ChartConfig

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function RecentFeedbackItem({ feedback }: { feedback: Feedback }) {
    const { firestore } = useFirebase();
    
    const reviewerProfileRef = useMemoFirebase(() => {
        if(!firestore) return null;
        return doc(firestore, `users/${feedback.reviewerId}`);
    }, [firestore, feedback.reviewerId]);

    const { data: reviewer } = useDoc<UserProfile>(reviewerProfileRef);
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-32');

    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 border">
                 <AvatarImage src={reviewer?.photoURL || userAvatar?.imageUrl} alt={reviewer?.firstName} />
                <AvatarFallback>{reviewer?.firstName ? reviewer.firstName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Loading...'}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold text-sm text-foreground">{feedback.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                   {feedback.strengths}
                </p>
            </div>
        </div>
    )
}

export default function DashboardClient() {
  const { user, firestore } = useFirebase();
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const feedbackQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/feedback`));
  }, [user, firestore]);

  const { data: feedbackData, isLoading: isFeedbackLoading } = useCollection<Feedback>(feedbackQuery);

  const { totalFeedback, averageRating, ratingsDistribution } = useMemo(() => {
    if (!feedbackData) {
      return { totalFeedback: 0, averageRating: 0, ratingsDistribution: [] };
    }

    const total = feedbackData.length;
    const avg = total > 0 ? feedbackData.reduce((acc, f) => acc + f.rating, 0) / total : 0;
    
    const distribution = [
      { name: '1 Star', total: 0 },
      { name: '2 Stars', total: 0 },
      { name: '3 Stars', total: 0 },
      { name: '4 Stars', total: 0 },
      { name: '5 Stars', total: 0 },
    ];

    for (const feedback of feedbackData) {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        distribution[feedback.rating - 1].total++;
      }
    }

    return { totalFeedback: total, averageRating: avg, ratingsDistribution: distribution };
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
    <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalFeedback}</div>}
                    <p className="text-xs text-muted-foreground">Total feedback sessions recorded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{averageRating.toFixed(2)}</div>}
                    <p className="text-xs text-muted-foreground">Across all feedback received</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Feedback Distribution</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   {isLoading ? (
                       <Skeleton className="h-[60px] w-full" />
                   ) : (
                    <div className="flex items-center justify-center -mt-2">
                         <ChartContainer config={chartConfig} className="h-[60px] w-[60px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart accessibilityLayer>
                                <Pie data={ratingsDistribution} dataKey="total" nameKey="name" innerRadius={18} outerRadius={26} paddingAngle={2}>
                                    {ratingsDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                         </ChartContainer>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                             {ratingsDistribution.map((entry, index) => (
                                 <div key={entry.name} className="flex items-center gap-2">
                                     <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}/>
                                     <span>{entry.name}: <strong>{entry.total}</strong></span>
                                 </div>
                             ))}
                         </div>
                     </div>
                   )}
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI-Powered Insights
                </CardTitle>
                <CardDescription>Key themes and suggestions from your feedback.</CardDescription>
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
                    <p className="text-sm text-muted-foreground italic">"{summary}"</p>
                )}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Feedback</CardTitle>
                    <CardDescription>Here's the latest feedback you've received.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                         </div>
                    ) : feedbackData && feedbackData.length > 0 ? (
                        <div className="space-y-6">
                            {feedbackData.slice(0, 3).map(fb => <RecentFeedbackItem key={fb.id} feedback={fb} />)}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No feedback yet</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Use "Confirm Interaction" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
