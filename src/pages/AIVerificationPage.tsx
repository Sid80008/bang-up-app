"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, UserCheck } from "lucide-react";
import AIVerification from "@/components/AIVerification";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AIVerificationPage = () => {
  const { user, aiVerified, profileCompleted } = useSession();
  const navigate = useNavigate();

  // Check if user has completed profile and AI verification
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!profileCompleted) {
      navigate("/profile-setup");
      return;
    }

    if (aiVerified) {
      toast.success("Your profile is already verified!");
      navigate("/");
    }
  }, [user, profileCompleted, aiVerified, navigate]);

  const handleVerificationComplete = () => {
    toast.success("Verification submitted successfully!");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-2xl mt-8">
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">AI Profile Verification</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload clear photos for AI verification to confirm your profile accuracy
            </p>
          </CardHeader>
          <CardContent>
            <AIVerification />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIVerificationPage;