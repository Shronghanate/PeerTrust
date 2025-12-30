'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoc, useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import type { UserProfile, Feedback } from "@/lib/types";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Edit, UserCheck2, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { EditProfileDialog } from "./edit-profile-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function RecentFeedbackItem({ feedback }: { feedback: Feedback }) {
    const { firestore } = useFirebase();
    
    const reviewerProfileRef = useMemoFirebase(() => {
        if(!firestore) return null;
        return doc(firestore, `users/${feedback.reviewerId}`);
    }, [firestore, feedback.reviewerId]);

    const { data: reviewer } = useDoc<UserProfile>(reviewerProfileRef);

    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 border">
                 <AvatarImage src={reviewer?.photoURL} alt={reviewer?.firstName} />
                <AvatarFallback>{reviewer?.firstName ? reviewer.firstName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Loading...'}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold text-sm text-foreground">{feedback.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                   {feedback.strengths}
                </p>
            </div>
        </div>
    )
}


export default function ProfilePage() {
    const { user, firestore } = useFirebase();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const feedbackQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/feedback`), orderBy('timestamp', 'desc'), limit(3));
    }, [user, firestore]);

    const { data: recentFeedback, isLoading: isFeedbackLoading } = useCollection<Feedback>(feedbackQuery);

    const isLoading = isProfileLoading || isFeedbackLoading;

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">View and manage your profile details.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isProfileLoading ? (
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
            </div>
          ) : userProfile ? (
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={userProfile?.photoURL} alt={userProfile?.firstName || ''} />
                <AvatarFallback>{userProfile?.firstName ? userProfile.firstName[0] : user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start">
                  <h2 className="text-2xl font-bold">{userProfile?.firstName || 'Anonymous'} {userProfile?.lastName}</h2>
                  <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent/80">
                      <UserCheck2 className="mr-1 h-3 w-3" />
                      Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto md:mx-0">
                  {userProfile?.email}
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          ) : (
             <p>No profile data found.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>A quick look at your latest feedback.</CardDescription>
        </CardHeader>
        <CardContent>
            {isFeedbackLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : recentFeedback && recentFeedback.length > 0 ? (
                <div className="space-y-6">
                    {recentFeedback.map(fb => <RecentFeedbackItem key={fb.id} feedback={fb} />)}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No feedback yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Feedback you receive will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
       {userProfile && (
        <EditProfileDialog 
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            userProfile={userProfile}
        />
       )}
    </div>
  );
}
