import { GiveFeedbackForm } from './form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function GiveFeedbackSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}


export default function GiveFeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Provide Feedback</CardTitle>
          <CardDescription>
            Your feedback is valuable. Please rate your peer's performance across the following criteria and provide specific comments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<GiveFeedbackSkeleton />}>
            <GiveFeedbackForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
