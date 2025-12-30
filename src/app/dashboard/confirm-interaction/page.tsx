'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

function PeerListItem({ peer, onSelect, isSelected }: { peer: UserProfile; onSelect: (id: string) => void; isSelected: boolean }) {
  return (
    <div 
      className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${isSelected ? 'bg-accent border-primary' : 'hover:bg-muted/50'}`}
      onClick={() => onSelect(peer.id)}
    >
      <Avatar>
        <AvatarImage src={peer.photoURL} alt={peer.firstName} />
        <AvatarFallback>{peer.firstName ? peer.firstName.charAt(0) : 'U'}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{peer.firstName} {peer.lastName}</p>
        <p className="text-sm text-muted-foreground">{peer.email}</p>
      </div>
    </div>
  )
}

export default function ConfirmInteractionPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"), where("id", "!=", user.uid));
  }, [firestore, user]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const handleConfirm = async () => {
    if (!firestore || !user || !selectedPeerId) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select a peer to confirm." });
      return;
    }

    setIsConfirming(true);
    try {
      // 1. Create interaction for current user
      const userInteractionsCol = collection(firestore, `users/${user.uid}/interactions`);
      const userInteractionRef = doc(userInteractionsCol);
      await setDoc(userInteractionRef, {
        id: userInteractionRef.id,
        participant1Id: user.uid,
        participant2Id: selectedPeerId,
        timestamp: serverTimestamp(),
      });

      // 2. Create interaction for peer
      const peerInteractionsCol = collection(firestore, `users/${selectedPeerId}/interactions`);
      const peerInteractionRef = doc(peerInteractionsCol);
      await setDoc(peerInteractionRef, {
        id: peerInteractionRef.id,
        participant1Id: selectedPeerId,
        participant2Id: user.uid,
        timestamp: serverTimestamp(),
      });
      
      toast({
        title: "Interaction Confirmed!",
        description: "You can now give feedback to your peer.",
      });

      router.push(`/dashboard/give-feedback?revieweeId=${selectedPeerId}`);

    } catch (error) {
      console.error("Error confirming interaction:", error);
      toast({
        variant: "destructive",
        title: "Confirmation Failed",
        description: "Could not confirm the interaction. Please try again.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirm an Interaction</CardTitle>
          <CardDescription>
            Select the peer you just interacted with to create a verified record and provide feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Select a Peer</h3>
          <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4 space-y-4">
              {isLoadingUsers ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : users && users.length > 0 ? (
                 users.map(peer => (
                   <PeerListItem 
                      key={peer.id}
                      peer={peer}
                      onSelect={setSelectedPeerId}
                      isSelected={selectedPeerId === peer.id}
                   />
                 ))
              ) : (
                <p className="text-center text-muted-foreground pt-4">No other users found.</p>
              )}
            </div>
          </ScrollArea>
           <Button onClick={handleConfirm} disabled={isConfirming || !selectedPeerId} className="w-full">
              {isConfirming ? 'Confirming...' : 'Confirm Interaction'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
