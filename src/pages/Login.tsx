"use client";
import React, { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  useEffect(() => {
    // Set redirect URL after component mounts (to ensure window is available)
    setRedirectUrl(`${window.location.origin}/`);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          console.log("[Login] Auth state changed - user logged in");
          toast.success("Welcome to Choice Matters!");
          // Small delay to ensure session is fully established
          setTimeout(() => {
            navigate("/");
          }, 500);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20 p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              {/* <img src="/choicematterslogo.png" alt="Choice Matters Logo" className="h-8 w-8" /> */}
              <Heart className="h-8 w-8 text-primary-foreground fill-current" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Welcome to Choice Matters</CardTitle>
          <p className="text-foreground/70 mt-2">
            Safe, respectful connections based on clear boundaries
          </p>
        </CardHeader>
        <CardContent>
          {redirectUrl && (
            <Auth
              supabaseClient={supabase}
              providers={[]} // You can add 'google', 'github', etc. here if desired
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "hsl(var(--primary))",
                      brandAccent: "hsl(var(--primary-foreground))",
                    },
                  },
                },
              }}
              theme="light" // Use "dark" if your app primarily uses dark mode
              redirectTo={redirectUrl}
            />
          )}
          <div className="mt-6 text-center text-sm text-foreground/70">
            <Sparkles className="h-4 w-4 inline mr-1" />
            By continuing, you agree to our respectful community guidelines
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;