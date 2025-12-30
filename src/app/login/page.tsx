import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
                <Logo />
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Enter your email to sign in to your account</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <Link href="/dashboard" className="w-full" passHref>
                      <Button className="w-full">Sign In with Email</Button>
                    </Link>
                </CardContent>
            </Card>
             <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative">
        {loginImage && (
          <Image 
              src={loginImage.imageUrl}
              alt={loginImage.description}
              fill
              className="object-cover"
              data-ai-hint={loginImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-3xl font-bold">Build Trust, Together.</h2>
            <p className="max-w-md mt-2">A new way to provide and receive transparent, constructive feedback within your professional network.</p>
        </div>
      </div>
    </div>
  );
}
