
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';

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

export default function LogInteractionPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"), where("id", "!=", user.uid));
  }, [firestore, user]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const handleRequest = async () => {
    if (!firestore || !user || !selectedPeerId) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select a peer to send a request." });
      return;
    }

    setIsRequesting(true);
    try {
      const pendingInteractionsCol = collection(firestore, 'pendingInteractions');
      await addDoc(pendingInteractionsCol, {
        requesterId: user.uid,
        requesteeId: selectedPeerId,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      
      toast({
        title: "Interaction Request Sent!",
        description: "Your peer has been notified and needs to approve the interaction.",
      });

      router.push(`/dashboard/requests`);

    } catch (error) {
      console.error("Error requesting interaction:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Could not send the interaction request. Please try again.",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Log an Interaction</CardTitle>
          <CardDescription>
            Select the peer you interacted with. They will be asked to confirm this interaction.
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
           <Button onClick={handleRequest} disabled={isRequesting || !selectedPeerId} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {isRequesting ? 'Sending Request...' : 'Send Interaction Request'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
