'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConfirmInteractionPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [interactionCode, setInteractionCode] = useState<string | null>(null);
  const [peerCode, setPeerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Generate a new interaction code for the current user
  useEffect(() => {
    if (!firestore || !user) return;

    const generateCode = async () => {
      setIsLoading(true);
      try {
        // Simple random code generation
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const codesRef = collection(firestore, 'interactionCodes');
        const docRef = await addDoc(codesRef, {
          code: newCode,
          userId: user.uid,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
        });
        
        setInteractionCode(newCode);
      } catch (error) {
        console.error("Error generating interaction code:", error);
        toast({
          variant: "destructive",
          title: "Could not generate code",
          description: "There was an issue generating a new interaction code. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateCode();
    // We can add a cleanup function to delete the code from firestore, but for now we'll let it expire
  }, [firestore, user, toast]);

  const handleConfirm = async () => {
    if (!firestore || !user || !peerCode) {
      toast({ variant: "destructive", title: "Invalid code", description: "Please enter a valid code." });
      return;
    }

    setIsConfirming(true);
    try {
      const codesRef = collection(firestore, 'interactionCodes');
      const q = query(codesRef, where("code", "==", peerCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Invalid Code", description: "The code you entered is invalid or has expired." });
        setIsConfirming(false);
        return;
      }

      const peerCodeDoc = querySnapshot.docs[0];
      const peerCodeData = peerCodeDoc.data();
      
      if (peerCodeData.userId === user.uid) {
        toast({ variant: "destructive", title: "Cannot use your own code", description: "Please enter the code from your peer." });
        setIsConfirming(false);
        return;
      }

      // Create interaction for both users
      const batch = writeBatch(firestore);
      const timestamp = new Date();
      
      // Interaction for current user
      const userInteractionsRef = collection(firestore, `users/${user.uid}/interactions`);
      const userInteractionDoc = await addDoc(userInteractionsRef, {
        participant1Id: user.uid,
        participant2Id: peerCodeData.userId,
        timestamp: timestamp,
      });

      // Interaction for peer
      const peerInteractionsRef = collection(firestore, `users/${peerCodeData.userId}/interactions`);
       await addDoc(peerInteractionsRef, {
        participant1Id: peerCodeData.userId,
        participant2Id: user.uid,
        timestamp: timestamp,
      });

      // Delete the used code
      batch.delete(peerCodeDoc.ref);

      await batch.commit();

      toast({
        title: "Interaction Confirmed!",
        description: "You can now give feedback to your peer.",
      });

      // Redirect to give feedback page for the peer
      router.push(`/dashboard/give-feedback?revieweeId=${peerCodeData.userId}`);

    } catch (error) {
      console.error("Error confirming interaction:", error);
      toast({
        variant: "destructive",
        title: "Confirmation Failed",
        description: "Could not confirm the interaction. Please check the code and try again.",
      });
      setIsConfirming(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirm an Interaction</CardTitle>
          <CardDescription>
            Generate or enter a code to verify a peer interaction. This ensures feedback is based on real-world engagements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8">
            <h3 className="text-lg font-semibold">Your Interaction Code</h3>
            <p className="text-sm text-muted-foreground">Share this code with your peer.</p>
            <div className="flex h-10 items-center space-x-2 rounded-md bg-muted px-4 py-2">
              {isLoading || !interactionCode ? (
                <Skeleton className="h-6 w-28" />
              ) : (
                <span className="text-2xl font-bold tracking-widest text-primary">{interactionCode}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Or let them scan your QR code.</p>
            <div className="rounded-lg bg-white p-2 shadow-md h-28 w-28 flex items-center justify-center">
              {isLoading || !interactionCode ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <QRCode value={interactionCode} size={96} />
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-8">
            <h3 className="text-lg font-semibold">Enter a Peer's Code</h3>
            <p className="text-sm text-muted-foreground">
              Input the code provided by your peer to confirm your interaction and leave feedback.
            </p>
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="XXX-XXX"
                className="text-center text-lg tracking-widest"
                value={peerCode}
                onChange={(e) => setPeerCode(e.target.value)}
                disabled={isConfirming}
              />
              <Button onClick={handleConfirm} disabled={isConfirming || !peerCode}>
                {isConfirming ? 'Confirming...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
