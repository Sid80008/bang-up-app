"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import AnonymousProfileCard from "@/components/AnonymousProfileCard";
import MatchSwipeCarousel from "@/components/MatchSwipeCarousel";
import AnonymousProfileForm from "@/components/AnonymousProfileForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = {
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  desiredPartnerPhysical: string;
  sexualInterests: string[];
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
};

const Index = () => {
  const { user, loading: sessionLoading } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("[IndexPage] Error fetching user profile:", error);
          toast.error("Failed to load your profile.");
          setUserProfile(null);
        } else if (data) {
          setUserProfile({
            bodyType: data.body_type || "",
            faceType: data.face_type || "",
            gender: data.gender || "",
            sexualOrientation: data.sexual_orientation || "",
            desiredPartnerPhysical: data.desired_partner_physical || "",
            sexualInterests: data.sexual_interests || [],
            comfortLevel: (data.comfort_level as "chat only" | "make-out" | "sex") || "chat only",
            locationRadius: data.location_radius || "",
            isVerified: data.is_verified || false,
          });
        } else {
          // Profile not found, initialize with empty values
          setUserProfile({
            bodyType: "",
            faceType: "",
            gender: "",
            sexualOrientation: "",
            desiredPartnerPhysical: "",
            sexualInterests: [],
            comfortLevel: "chat only",
            locationRadius: "",
            isVerified: false,
          });
        }
        setProfileLoading(false);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleProfileUpdate = (data: UserProfile) => {
    setUserProfile(data);
    setIsDialogOpen(false); // Close dialog on successful update
  };

  const handleLike = (id: string) => {
    toast.success(`Liked match ${id}!`);
    console.log(`User liked match with ID: ${id}`);
    // In a real app, this would send a request to the backend to record the like
  };

  const handlePass = (id: string) => {
    toast.info(`Passed on match ${id}.`);
    console.log(`User passed on match with ID: ${id}`);
    // In a real app, this would send a request to the backend to record the pass
  };

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Please log in to view your profile and matches.</p>
        <Button asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your anonymous profile is ready!
        </p>
      </div>
      {userProfile && <AnonymousProfileCard {...userProfile} />}

      <div className="flex space-x-4 mt-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Edit Your Anonymous Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            {userProfile && <AnonymousProfileForm initialData={userProfile} onSubmitSuccess={handleProfileUpdate} />}
          </DialogContent>
        </Dialog>
        <Button asChild>
          <Link to="/matches">View Your Matches</Link>
        </Button>
      </div>

      <div className="text-center mt-12 mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Potential Matches</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Swipe through anonymous profiles</p>
      </div>
      <div className="w-full max-w-md">
        <MatchSwipeCarousel
          matches={[]} // Initially empty, match finding logic to be added later
          onLike={handleLike}
          onPass={handlePass}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;