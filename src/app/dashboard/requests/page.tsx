'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where, updateDoc, writeBatch, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import type { FeedbackRequest, UserProfile, PendingInteraction, Interaction } from "@/lib/types";
import { Check, X, Clock, Send, Handshake } from "lucide-react";
import { useDoc } from "@/firebase/firestore/use-doc";
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
import { useToast } from "@/hooks/use-toast";


function FeedbackRequestListItem({ request }: { request: FeedbackRequest }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const otherUserId = request.requesterId;

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !otherUserId) return null;
    return doc(firestore, `users/${otherUserId}`);
  }, [firestore, otherUserId]);

  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  const handleDecline = async () => {
    if (!firestore || !request.id) return;
    try {
      const requestRef = doc(firestore, 'feedbackRequests', request.id);
      await updateDoc(requestRef, { status: 'declined' });
      toast({ title: "Request declined." });
    } catch (error) {
      console.error("Error declining request:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not decline the request." });
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={profile?.photoURL} alt={profile?.firstName} />
          <AvatarFallback>{profile?.firstName ? profile.firstName.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}</p>
          <p className="text-sm text-muted-foreground">Wants your feedback</p>
        </div>
      </div>
      {request.status === 'pending' && (
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleDecline}>
            <X className="mr-1 h-4 w-4" /> Decline
          </Button>
          <Link href={`/dashboard/give-feedback?revieweeId=${request.requesterId}&requestId=${request.id}`} passHref>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1">
              Give Feedback
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function SentRequestListItem({ request }: { request: FeedbackRequest | PendingInteraction }) {
    const { firestore } = useFirebase();
    const otherUserId = request.requesteeId;
    const isFeedback = 'requesterId' in request && !('status' in request && 'requesterId' in request && 'requesteeId' in request);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !otherUserId) return null;
        return doc(firestore, `users/${otherUserId}`);
    }, [firestore, otherUserId]);

    const { data: profile } = useDoc<UserProfile>(userProfileRef);

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={profile?.photoURL} alt={profile?.firstName} />
                    <AvatarFallback>{profile?.firstName ? profile.firstName.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}</p>
                    <p className="text-sm text-muted-foreground">
                        {isFeedback ? 'Feedback Request' : 'Interaction Confirmation'}
                    </p>
                </div>
            </div>
            <>
                {request.status === 'pending' ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Pending</span>
                    </div>
                ) : request.status === 'completed' || request.status === 'confirmed' ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        <span>{request.status === 'confirmed' ? 'Confirmed' : 'Completed'}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                        <X className="h-4 w-4" />
                        <span>Declined</span>
                    </div>
                )}
            </>
        </div>
    );
}

function InteractionRequestListItem({ request }: { request: PendingInteraction }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const otherUserId = request.requesterId;
  
    const userProfileRef = useMemoFirebase(() => {
      if (!firestore || !otherUserId) return null;
      return doc(firestore, `users/${otherUserId}`);
    }, [firestore, otherUserId]);
  
    const { data: profile } = useDoc<UserProfile>(userProfileRef);
  
    const handleApproval = async (approve: boolean) => {
      if (!firestore) return;
      if (approve) {
        try {
            const batch = writeBatch(firestore);
            
            // 1. Create interaction for requester
            const requesterInteractionsCol = collection(firestore, `users/${request.requesterId}/interactions`);
            const requesterInteractionRef = doc(requesterInteractionsCol);
            batch.set(requesterInteractionRef, {
                id: requesterInteractionRef.id,
                participant1Id: request.requesterId,
                participant2Id: request.requesteeId,
                timestamp: serverTimestamp(),
            });

            // 2. Create interaction for requestee (current user)
            const requesteeInteractionsCol = collection(firestore, `users/${request.requesteeId}/interactions`);
            const requesteeInteractionRef = doc(requesteeInteractionsCol);
            batch.set(requesteeInteractionRef, {
                id: requesteeInteractionRef.id,
                participant1Id: request.requesteeId,
                participant2Id: request.requesterId,
                timestamp: serverTimestamp(),
            });

            // 3. Delete the pending request
            const pendingRequestRef = doc(firestore, 'pendingInteractions', request.id);
            batch.delete(pendingRequestRef);

            await batch.commit();

            toast({ title: "Interaction Confirmed!" });
        } catch (error) {
            console.error("Error confirming interaction:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not confirm the interaction." });
        }
      } else {
        // Decline
        try {
            const requestRef = doc(firestore, 'pendingInteractions', request.id);
            await updateDoc(requestRef, { status: 'declined' });
            toast({ title: "Interaction request declined." });
        } catch (error) {
            console.error("Error declining interaction:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not decline the request." });
        }
      }
    };
  
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={profile?.photoURL} alt={profile?.firstName} />
            <AvatarFallback>{profile?.firstName ? profile.firstName.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}</p>
            <p className="text-sm text-muted-foreground">Wants to confirm an interaction</p>
          </div>
        </div>
        {request.status === 'pending' && (
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleApproval(false)}>
              <X className="mr-1 h-4 w-4" /> Decline
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => handleApproval(true)}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
          </div>
        )}
      </div>
    );
  }


export default function RequestsPage() {
  const { user, firestore } = useFirebase();

  // Queries for Feedback Requests
  const incomingFeedbackQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'feedbackRequests'), where('requesteeId', '==', user.uid));
  }, [user, firestore]);
  const sentFeedbackQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'feedbackRequests'), where('requesterId', '==', user.uid));
  }, [user, firestore]);

  // Queries for Interaction Requests
  const incomingInteractionQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'pendingInteractions'), where('requesteeId', '==', user.uid));
  }, [user, firestore]);
  const sentInteractionQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'pendingInteractions'), where('requesterId', '==', user.uid));
  }, [user, firestore]);

  const { data: incomingFeedback, isLoading: isLoadingIncomingFeedback } = useCollection<FeedbackRequest>(incomingFeedbackQuery);
  const { data: sentFeedback, isLoading: isLoadingSentFeedback } = useCollection<FeedbackRequest>(sentFeedbackQuery);
  const { data: incomingInteractions, isLoading: isLoadingIncomingInteractions } = useCollection<PendingInteraction>(incomingInteractionQuery);
  const { data: sentInteractions, isLoading: isLoadingSentInteractions } = useCollection<PendingInteraction>(sentInteractionQuery);
  
  const allSentRequests = useMemo(() => {
    const combined = [...(sentFeedback || []), ...(sentInteractions || [])];
    return combined.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
  }, [sentFeedback, sentInteractions]);
  
  const isLoadingIncoming = isLoadingIncomingFeedback || isLoadingIncomingInteractions;
  const isLoadingSent = isLoadingSentFeedback || isLoadingSentInteractions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Requests</h2>
        <p className="text-muted-foreground">Manage your pending and sent requests.</p>
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
              <CardDescription>Peers are asking for your confirmation or feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingIncoming ? (
                <p>Loading requests...</p>
              ) : (
                <>
                  {incomingInteractions && incomingInteractions.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Handshake className="h-4 w-4"/>Interaction Confirmations</h3>
                        {incomingInteractions.map((req) => (
                           <InteractionRequestListItem key={req.id} request={req} />
                        ))}
                    </div>
                  )}
                  {incomingFeedback && incomingFeedback.length > 0 && (
                     <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4"/>Feedback Requests</h3>
                        {incomingFeedback.map((req) => (
                            <FeedbackRequestListItem key={req.id} request={req} />
                        ))}
                    </div>
                  )}
                   {(!incomingInteractions || incomingInteractions.length === 0) && (!incomingFeedback || incomingFeedback.length === 0) && (
                     <p className="text-muted-foreground text-center py-8">No incoming requests.</p>
                   )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>You've requested confirmation or feedback from these peers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSent ? (
                <p>Loading requests...</p>
              ) : allSentRequests && allSentRequests.length > 0 ? (
                allSentRequests.map((req) => (
                  <SentRequestListItem key={req.id} request={req} />
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
