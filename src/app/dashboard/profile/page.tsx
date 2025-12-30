import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Edit, UserCheck2 } from "lucide-react";

export default function ProfilePage() {
    const profileImage = PlaceHolderImages.find(p => p.id === 'profile-avatar-128');
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">View and manage your profile details.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            {profileImage && (
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={profileImage.imageUrl} alt="John Doe" data-ai-hint={profileImage.imageHint} />
                <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start">
                <h2 className="text-2xl font-bold">John Doe</h2>
                <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent/80">
                    <UserCheck2 className="mr-1 h-3 w-3" />
                    Verified
                </Badge>
              </div>
              <p className="font-medium text-primary">Senior Frontend Developer</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto md:mx-0">
                Building accessible and user-friendly interfaces. Passionate about open-source and design systems.
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
