import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const QrCodePlaceholder = () => (
  <svg width="96" height="96" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4H4V12H12V4ZM10 6H6V10H10V6Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 20H4V28H12V20ZM10 22H6V26H10V22Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M28 4H20V12H28V4ZM26 6H22V10H26V6Z" fill="currentColor"/>
      <path d="M18 4H14V6H18V4Z" fill="currentColor"/>
      <path d="M18 10H14V12H18V10Z" fill="currentColor"/>
      <path d="M18 14H16V16H18V14Z" fill="currentColor"/>
      <path d="M14 16H12V18H14V16Z" fill="currentColor"/>
      <path d="M6 14H4V16H6V14Z" fill="currentColor"/>
      <path d="M20 14H18V16H20V14Z" fill="currentColor"/>
      <path d="M22 14H20V16H22V14Z" fill="currentColor"/>
      <path d="M24 14H22V16H24V14Z" fill="currentColor"/>
      <path d="M26 14H24V16H26V14Z" fill="currentColor"/>
      <path d="M28 14H26V16H28V14Z" fill="currentColor"/>
      <path d="M6 18H4V20H6V18Z" fill="currentColor"/>
      <path d="M14 20H12V22H14V20Z" fill="currentColor"/>
      <path d="M14 26H12V28H14V26Z" fill="currentColor"/>
      <path d="M18 28H14V30H18V28Z" fill="currentColor"/>
      <path d="M20 28H18V30H20V28Z" fill="currentColor"/>
      <path d="M22 18H20V20H22V18Z" fill="currentColor"/>
      <path d="M20 22H18V24H20V22Z" fill="currentColor"/>
      <path d="M22 24H20V26H22V24Z" fill="currentColor"/>
      <path d="M24 26H22V28H24V26Z" fill="currentColor"/>
      <path d="M26 22H24V24H26V22Z" fill="currentColor"/>
      <path d="M28 20H26V22H28V20Z" fill="currentColor"/>
      <path d="M28 24H26V26H28V24Z" fill="currentColor"/>
      <path d="M28 28H26V30H28V28Z" fill="currentColor"/>
  </svg>
);


export default function ConfirmInteractionPage() {
  const interactionCode = "A4T-87P-LMN";

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
            <div className="flex items-center space-x-2 rounded-md bg-muted px-4 py-2">
              <span className="text-2xl font-bold tracking-widest text-primary">{interactionCode}</span>
            </div>
            <p className="text-xs text-muted-foreground">Or let them scan your QR code.</p>
            <div className="rounded-lg bg-white p-2 shadow-md">
              <QrCodePlaceholder />
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-8">
            <h3 className="text-lg font-semibold">Enter a Peer's Code</h3>
            <p className="text-sm text-muted-foreground">
              Input the code provided by your peer to confirm your interaction and leave feedback.
            </p>
            <div className="flex w-full items-center space-x-2">
              <Input placeholder="XXX-XXX-XXX" className="text-center text-lg tracking-widest" />
              <Button>Confirm</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
