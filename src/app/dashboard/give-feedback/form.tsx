"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const formSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating." }).max(5),
  strengths: z.string().min(10, { message: "Please provide at least a brief comment on strengths." }),
  areasForImprovement: z.string().min(10, { message: "Please provide at least a brief comment on areas for improvement." }),
});

function StarRating({ field }: { field: any }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const currentValue = field.value || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-8 w-8 cursor-pointer transition-colors",
            (hoverValue || currentValue) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
          )}
          onClick={() => field.onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
        />
      ))}
    </div>
  );
}

export function GiveFeedbackForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firestore, user } = useFirebase();

  const [revieweeId, setRevieweeId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRevieweeId(searchParams.get('revieweeId'));
    setRequestId(searchParams.get('requestId'));
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      strengths: "",
      areasForImprovement: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !revieweeId) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Cannot submit feedback. Invalid user or context.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Add feedback to the reviewee's feedback subcollection
      const feedbackRef = collection(firestore, `users/${revieweeId}/feedback`);
      await addDoc(feedbackRef, {
        ...values,
        reviewerId: user.uid,
        revieweeId: revieweeId,
        timestamp: serverTimestamp(),
        visibility: 'private', // Default visibility
      });

      // If this feedback is for a specific request, update the request status
      if (requestId) {
        const requestRef = doc(firestore, 'feedbackRequests', requestId);
        await updateDoc(requestRef, { status: 'completed' });
      }

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping your peer grow.",
      });

      form.reset();
      router.push('/dashboard/requests'); // Redirect after successful submission

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was a problem submitting your feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!revieweeId) {
    return (
        <div className="text-center text-muted-foreground py-12">
            <p>No user selected for feedback.</p>
            <p className="text-sm">Please start from the "Confirm Interaction" or "Requests" page.</p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
            <FormItem className="flex flex-col items-center space-y-3">
                <FormLabel className="text-lg">Overall Rating</FormLabel>
                <FormControl>
                <StarRating field={field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="strengths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strengths</FormLabel>
              <FormControl>
                <Textarea placeholder="What did they do well? Be specific." {...field} />
              </FormControl>
              <FormDescription>
                Highlight areas where your peer excelled.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="areasForImprovement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Areas for Improvement</FormLabel>
              <FormControl>
                <Textarea placeholder="Where could they improve? Provide constructive suggestions." {...field} />
              </FormControl>
              <FormDescription>
                Offer actionable advice for growth.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </Form>
  );
}
