'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert } from "lucide-react";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const handleVisibilityChange = async (value: 'private' | 'managers' | 'all') => {
    if (!userProfileRef) return;
    try {
      await updateDoc(userProfileRef, { feedbackVisibility: value });
      toast({ title: "Privacy setting updated." });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({ variant: "destructive", title: "Update failed", description: "Could not save your privacy setting." });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and privacy settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control who can see your feedback and interact with you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label htmlFor="visibility-radio" className="font-semibold">Feedback Visibility</Label>
              <p className="text-sm text-muted-foreground">Choose who can view the feedback you receive.</p>
            </div>
            {isProfileLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : (
              <RadioGroup
                value={userProfile?.feedbackVisibility || 'private'}
                onValueChange={handleVisibilityChange as (value: string) => void}
                id="visibility-radio"
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="r1" />
                  <Label htmlFor="r1">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="managers" id="r2" />
                  <Label htmlFor="r2">Managers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="r3" />
                  <Label htmlFor="r3">Private</Label>
                </div>
              </RadioGroup>
            )}
          </div>
          <Separator />
          <div className="flex items-start justify-between space-x-2">
            <div>
              <Label className="font-semibold">Blocked Users</Label>
              <p className="text-sm text-muted-foreground">Users you block cannot request or give you feedback.</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for new feedback and requests.</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get real-time alerts on your devices.</p>
            </div>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 rounded-lg border border-destructive/50 p-4">
            <div>
              <p className="font-semibold text-destructive">Delete Account</p>
              <p className="text-sm text-destructive/80">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
