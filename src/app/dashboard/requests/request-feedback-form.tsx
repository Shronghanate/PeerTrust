
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp, where, query } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { useState } from "react";

const formSchema = z.object({
  requesteeId: z.string().min(1, { message: "Please select a user." }),
});

export function RequestFeedbackForm() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"));
  }, [firestore, user]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requesteeId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Cannot submit request without being logged in.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const requestRef = collection(firestore, `feedbackRequests`);
      await addDoc(requestRef, {
        requesterId: user.uid,
        requesteeId: values.requesteeId,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      
      toast({
        title: "Feedback Request Sent!",
        description: "Your peer has been notified.",
      });
      form.reset();

    } catch (error) {
      console.error("Error submitting feedback request:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was a problem sending your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
        <FormField
          control={form.control}
          name="requesteeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a Peer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to request feedback from" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading && <SelectItem value="loading" disabled>Loading users...</SelectItem>}
                  {users && users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Sending..." : "Send Request"}
        </Button>
      </form>
    </Form>
  );
}
