'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Edit, UserCheck2 } from "lucide-react";

export default function ProfilePage() {
    const { user, firestore } = useFirebase();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">View and manage your profile details.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={userProfile?.photoURL} alt={userProfile?.firstName || ''} />
                <AvatarFallback>{userProfile?.firstName?.[0] || user?.email?.[0]}</AvatarFallback>
                </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start">
                <h2 className="text-2xl font-bold">{userProfile?.firstName || 'Anonymous'} {userProfile?.lastName}</h2>
                <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent/80">
                    <UserCheck2 className="mr-1 h-3 w-3" />
                    Verified
                </Badge>
              </div>
              <p className="font-medium text-primary">Role not set</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto md:mx-0">
                Profile description not set.
              </p>
            </div>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>A quick look at your latest feedback.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground py-12">
                <p>No recent feedback to display.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
