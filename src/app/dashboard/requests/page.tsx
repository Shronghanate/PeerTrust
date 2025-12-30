'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { FeedbackRequest, UserProfile } from "@/lib/types";
import { Check, X, Clock, Send } from "lucide-react";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RequestFeedbackForm } from "./request-feedback-form";


function RequestListItem({ request, type }: { request: FeedbackRequest, type: 'incoming' | 'sent' }) {
  const { firestore, user } = useFirebase();
  const otherUserId = type === 'incoming' ? request.requesterId : request.requesteeId;

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !otherUserId) return null;
    return doc(firestore, `users/${otherUserId}`);
  }, [firestore, otherUserId]);

  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={profile?.photoURL} alt={profile?.firstName} />
          <AvatarFallback>{profile?.firstName ? profile.firstName.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(request.timestamp?.toDate()).toLocaleDateString()}
          </p>
        </div>
      </div>
      {type === 'incoming' && request.status === 'pending' && (
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1">
            <X className="mr-1 h-4 w-4" /> Decline
          </Button>
          <Link href={`/dashboard/give-feedback?revieweeId=${request.requesterId}&requestId=${request.id}`} passHref>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1">
              Give Feedback
            </Button>
          </Link>
        </div>
      )}
      {type === 'sent' && (
         <>
          {request.status === 'pending' ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-accent">
                <Check className="h-4 w-4" />
                <span>Completed</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}


export default function RequestsPage() {
  const { user, firestore } = useFirebase();

  const incomingRequestsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'feedbackRequests'), where('requesteeId', '==', user.uid));
  }, [user, firestore]);

  const sentRequestsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'feedbackRequests'), where('requesterId', '==', user.uid));
  }, [user, firestore]);

  const { data: incomingRequests, isLoading: isLoadingIncoming } = useCollection<FeedbackRequest>(incomingRequestsQuery);
  const { data: sentRequests, isLoading: isLoadingSent } = useCollection<FeedbackRequest>(sentRequestsQuery);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Feedback Requests</h2>
        <p className="text-muted-foreground">Manage your pending and completed feedback requests.</p>
      </div>

      <Tabs defaultValue="incoming" className="w-full">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="incoming">Incoming</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Send className="mr-2 h-4 w-4" />Request Feedback</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Feedback</DialogTitle>
                  <DialogDescription>
                    Select a peer to request feedback from. They will be notified.
                  </DialogDescription>
                </DialogHeader>
                <RequestFeedbackForm />
              </DialogContent>
            </Dialog>
        </div>
        <TabsContent value="incoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Requests</CardTitle>
              <CardDescription>Peers are asking for your valuable feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingIncoming ? (
                <p>Loading requests...</p>
              ) : incomingRequests && incomingRequests.length > 0 ? (
                incomingRequests.map((req) => (
                  <RequestListItem key={req.id} request={req} type="incoming" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No incoming requests.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>You've requested feedback from these peers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSent ? (
                <p>Loading requests...</p>
              ) : sentRequests && sentRequests.length > 0 ? (
                sentRequests.map((req) => (
                  <RequestListItem key={req.id} request={req} type="sent" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">You haven't sent any requests yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
