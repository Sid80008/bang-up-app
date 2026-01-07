"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const ProfileSetup = () => {
  const { user, profileCompleted } = useSession();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // If profile is already completed, redirect to AI verification or home
    if (profileCompleted) {
      // Check AI verification status
      const checkAiVerification = async () => {
        const { data: verificationData, error } = await supabase
          .from("profiles")
          .select("face_photo_path, body_photo_path, is_verified")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("[ProfileSetup] Error checking AI verification:", error);
        }
        
        const isAiVerified = verificationData && verificationData.is_verified;
        
        if (isAiVerified) {
          navigate("/");
        } else {
          navigate("/ai-verification");
        }
      };
      
      checkAiVerification();
      return;
    }
    
    // Load existing profile data if any
    const loadProfileData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("[ProfileSetup] Error loading profile:", error);
      } else if (data) {
        setInitialData({
          ...data,
          bodyCount: data.body_count || 0,
        });
      }
    };
    
    loadProfileData();
  }, [user, profileCompleted, navigate]);

  const handleProfileUpdate = async (data: any) => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    
    const profileData = {
      id: user.id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      body_count: data.bodyCount,
      body_type: data.bodyType,
      face_type: data.faceType,
      gender: data.gender,
      sexual_orientation: data.sexualOrientation,
      desired_partner_physical: data.desiredPartnerPhysical,
      sexual_interests: data.sexualInterests,
      comfort_level: data.comfortLevel,
      location_radius: data.locationRadius,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: 'id' });
    
    if (error) {
      console.error("[ProfileSetup] Error updating profile:", error);
      toast.error("Failed to update your preferences.");
    } else {
      toast.success("Profile updated successfully!");
      // Redirect to AI verification
      navigate("/ai-verification");
    }
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
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share your authentic self while maintaining your boundaries
            </p>
          </CardHeader>
          <CardContent>
            <ProfileForm initialData={initialData} onSubmitSuccess={handleProfileUpdate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;