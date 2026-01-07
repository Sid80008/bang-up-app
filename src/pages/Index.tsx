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
  id: string; // Added id for the profile
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
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUserProfile = async () => {
    if (user) {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("[IndexPage] Error fetching user profile:", error);
        toast.error("Failed to load your preferences.");
        setUserProfile(null);
      } else if (data) {
        setUserProfile({
          id: data.id,
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
        setUserProfile({
          id: user.id, // Initialize with user ID even if no profile data
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

  const fetchPotentialMatches = async (currentUserProfile: UserProfile) => {
    if (!user || !currentUserProfile.sexualInterests || currentUserProfile.sexualInterests.length === 0) {
      setPotentialMatches([]);
      setMatchesLoading(false);
      return;
    }

    setMatchesLoading(true);

    // Fetch users the current user has already interacted with
    const { data: interactions, error: interactionsError } = await supabase
      .from("user_interactions")
      .select("target_user_id")
      .eq("user_id", user.id);

    if (interactionsError) {
      console.error("[IndexPage] Error fetching user interactions:", interactionsError);
      toast.error("Failed to load interactions.");
      setMatchesLoading(false);
      return;
    }

    const interactedUserIds = interactions?.map(i => i.target_user_id) || [];

    // Fetch other profiles, excluding current user and already interacted users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .not("id", "in", `(${interactedUserIds.join(',')})`); // Exclude interacted users

    if (profilesError) {
      console.error("[IndexPage] Error fetching potential matches:", profilesError);
      toast.error("Failed to load potential matches.");
      setPotentialMatches([]);
    } else {
      const filteredMatches: UserProfile[] = (profiles || [])
        .filter(profile => {
          // Basic interest matching: at least one shared sexual interest
          if (!profile.sexual_interests || profile.sexual_interests.length === 0) {
            return false;
          }
          return currentUserProfile.sexualInterests.some(interest =>
            profile.sexual_interests.includes(interest)
          );
        })
        .map(profile => ({
          id: profile.id,
          bodyType: profile.body_type || "",
          faceType: profile.face_type || "",
          gender: profile.gender || "",
          sexualOrientation: profile.sexual_orientation || "",
          desiredPartnerPhysical: profile.desired_partner_physical || "",
          sexualInterests: profile.sexual_interests || [],
          comfortLevel: (profile.comfort_level as "chat only" | "make-out" | "sex") || "chat only",
          locationRadius: profile.location_radius || "",
          isVerified: profile.is_verified || false,
        }));
      setPotentialMatches(filteredMatches);
    }
    setMatchesLoading(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (userProfile && user) {
      fetchPotentialMatches(userProfile);
    }
  }, [userProfile, user]);

  const handleProfileUpdate = (data: UserProfile) => {
    setUserProfile(data);
    setIsDialogOpen(false);
    // Re-fetch matches after profile update, as interests might have changed
    if (user) {
      fetchPotentialMatches(data);
    }
  };

  const handleInteraction = async (targetUserId: string, interactionType: 'like' | 'pass') => {
    if (!user) {
      toast.error("You must be logged in to interact with profiles.");
      return;
    }

    const { error } = await supabase.from("user_interactions").insert({
      user_id: user.id,
      target_user_id: targetUserId,
      interaction_type: interactionType,
    });

    if (error) {
      console.error(`[IndexPage] Error recording ${interactionType}:`, error);
      toast.error(`Failed to record your ${interactionType}.`);
    } else {
      if (interactionType === 'like') {
        toast.success(`Liked Discovery Profile ${targetUserId.substring(0, 8)}...`);
        // Check for mutual like to create a chat
        const { data: mutualLike, error: mutualLikeError } = await supabase
          .from("user_interactions")
          .select("id")
          .eq("user_id", targetUserId)
          .eq("target_user_id", user.id)
          .eq("interaction_type", "like")
          .single();

        if (mutualLikeError && mutualLikeError.code !== 'PGRST116') {
          console.error("[IndexPage] Error checking for mutual like:", mutualLikeError);
        } else if (mutualLike) {
          // Mutual like found, create a chat
          const { data: chatData, error: chatError } = await supabase
            .from("chats")
            .insert({ user1_id: user.id, user2_id: targetUserId })
            .select()
            .single();

          if (chatError) {
            console.error("[IndexPage] Error creating chat:", chatError);
            toast.error("Failed to create chat.");
          } else if (chatData) {
            toast.success("It's a match! A new chat has been created.");
            navigate(`/chat/${chatData.id}`);
          }
        }
      } else {
        toast.info(`Passed on Discovery Profile ${targetUserId.substring(0, 8)}...`);
      }
      // Remove the interacted match from the current potential matches
      setPotentialMatches((prevMatches) => prevMatches.filter((match) => match.id !== targetUserId));
    }
  };

  if (sessionLoading || profileLoading || matchesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading application data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Please log in to view your preferences and discovery profiles.</p>
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
          Your preferences are ready!
        </p>
      </div>
      {userProfile && <AnonymousProfileCard {...userProfile} />}

      <div className="flex space-x-4 mt-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Edit My Preferences</Button> {/* Renamed */}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Preferences</DialogTitle> {/* Renamed */}
            </DialogHeader>
            {userProfile && <AnonymousProfileForm initialData={userProfile} onSubmitSuccess={handleProfileUpdate} />}
          </DialogContent>
        </Dialog>
        <Button asChild>
          <Link to="/matches">View My Matches</Link>
        </Button>
      </div>

      <div className="text-center mt-12 mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Discovery Profiles</h2> {/* Renamed */}
        <p className="text-lg text-gray-600 dark:text-gray-400">Swipe through profiles based on your interests</p>
      </div>
      <div className="w-full max-w-md">
        <MatchSwipeCarousel
          matches={potentialMatches}
          onLike={(id) => handleInteraction(id, 'like')}
          onPass={(id) => handleInteraction(id, 'pass')}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;