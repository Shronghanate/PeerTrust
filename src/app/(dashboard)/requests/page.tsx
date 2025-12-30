import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { feedbackRequests } from "@/lib/placeholder-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Check, X, Clock } from "lucide-react";

export default function RequestsPage() {
  const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

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
            <Button>Request Feedback</Button>
        </div>
        <TabsContent value="incoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Requests</CardTitle>
              <CardDescription>Peers are asking for your valuable feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbackRequests.incoming.map((req) => (
                <div key={req.id} className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={getImage(req.avatarId)?.imageUrl} alt={req.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.name}</p>
                      <p className="text-sm text-muted-foreground">{req.role} &middot; {req.date}</p>
                    </div>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1">
                      <X className="mr-1 h-4 w-4" /> Decline
                    </Button>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1">
                      Give Feedback
                    </Button>
                  </div>
                </div>
              ))}
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
              {feedbackRequests.sent.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={getImage(req.avatarId)?.imageUrl} alt={req.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.name}</p>
                      <p className="text-sm text-muted-foreground">{req.role} &middot; {req.date}</p>
                    </div>
                  </div>
                  {req.status === 'Pending' ? (
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
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
