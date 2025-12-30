'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Signed in successfully!" });
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        // If user not found, try to sign up
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: "Account created and signed in!" });
          router.push('/');
        } catch (signUpError) {
          const signUpAuthError = signUpError as AuthError;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: signUpAuthError.message || "Could not create your account.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: authError.message || "Could not sign you in.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || user) {
    return <div>Loading...</div>; // Or a proper loader
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
                <Logo />
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="m@example.com" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
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
