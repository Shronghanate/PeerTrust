
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  collaboration: z.string().min(1, { message: "Please select a rating." }),
  communication: z.string().min(1, { message: "Please select a rating." }),
  execution: z.string().min(1, { message: "Please select a rating." }),
  strengths: z.string().min(10, { message: "Please provide at least a brief comment on strengths." }),
  improvements: z.string().min(10, { message: "Please provide at least a brief comment on areas for improvement." }),
});

const criteria = [
  { id: "collaboration", label: "Collaboration & Teamwork" },
  { id: "communication", label: "Communication & Attitude" },
  { id: "execution", label: "Execution & Quality" },
] as const;

function StarRating({ field }: { field: any }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const currentValue = parseInt(field.value || "0");

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-6 w-6 cursor-pointer transition-colors",
            (hoverValue || currentValue) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
          )}
          onClick={() => field.onChange(star.toString())}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
        />
      ))}
    </div>
  );
}

export function GiveFeedbackForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { firestore, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const revieweeId = searchParams.get('revieweeId');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaboration: "",
      communication: "",
      execution: "",
      strengths: "",
      improvements: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!revieweeId || !firestore || !user) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Cannot submit feedback without a valid user and peer.",
        });
        return;
    }
    setIsSubmitting(true);

    try {
        const collaborationRating = parseInt(values.collaboration);
        const communicationRating = parseInt(values.communication);
        const executionRating = parseInt(values.execution);
        const averageRating = (collaborationRating + communicationRating + executionRating) / 3;

        const feedbackRef = collection(firestore, `users/${revieweeId}/feedback`);
        await addDoc(feedbackRef, {
            reviewerId: user.uid,
            revieweeId: revieweeId,
            rating: averageRating,
            strengths: values.strengths,
            areasForImprovement: values.improvements,
            criteria: {
                collaboration: collaborationRating,
                communication: communicationRating,
                execution: executionRating,
            },
            timestamp: serverTimestamp(),
            visibility: 'private',
        });
        
        toast({
            title: "Feedback Submitted!",
            description: "Thank you for helping your peer grow.",
        });
        form.reset();

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
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>To give feedback, first confirm an interaction with a peer.</p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {criteria.map((c) => (
            <FormField
              key={c.id}
              control={form.control}
              name={c.id}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{c.label}</FormLabel>
                  <FormControl>
                    <StarRating field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

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
          name="improvements"
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
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Form>
  );
}
