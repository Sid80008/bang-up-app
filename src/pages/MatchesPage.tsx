"use client";

import React, { useState, useEffect } from "react";
import MatchListItem from "@/components/MatchListItem";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";

interface Match {
  id: string; // This will be the other user's profile ID
  name?: string;
  age?: number;
  bio?: string;
  bodyCount?: number;
  photo_url?: string;
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
  chatId: string;
  isApprovedForVisibility: boolean; // New field
}

const MatchesPage = () => {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [confirmedMatches, setConfirmedMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) {
        setLoadingMatches(false);
        return;
      }

      setLoadingMatches(true);
      setError(null);

      // Fetch chats where the current user is involved
      const { data: chats, error: chatsError } = await supabase
        .from("chats")
        .select("*, user1:user1_id(id, name, age, bio, body_count, photo_url, body_type, face_type, gender, sexual_orientation, comfort_level, location_radius, is_verified), user2:user2_id(id, name, age, bio, body_count, photo_url, body_type, face_type, gender, sexual_orientation, comfort_level, location_radius, is_verified)")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (chatsError) {
        console.error("[MatchesPage] Error fetching chats:", chatsError);
        setError("Failed to load your matches.");
        toast.error("Failed to load your matches.");
        setLoadingMatches(false);
        return;
      }

      const processedMatches: Match[] = [];
      for (const chat of chats || []) {
        const otherUser = chat.user1.id === user.id ? chat.user2 : chat.user1;

        if (otherUser) {
          processedMatches.push({
            id: otherUser.id,
            name: otherUser.name || "Anonymous",
            age: otherUser.age || 0,
            bio: otherUser.bio || "",
            bodyCount: otherUser.body_count || 0,
            photo_url: otherUser.photo_url || "",
            bodyType: otherUser.body_type || "N/A",
            faceType: otherUser.face_type || "N/A",
            gender: otherUser.gender || "N/A",
            sexualOrientation: otherUser.sexual_orientation || "N/A",
            comfortLevel: (otherUser.comfort_level as "chat only" | "make-out" | "sex") || "chat only",
            locationRadius: otherUser.location_radius || "N/A",
            isVerified: otherUser.is_verified || false,
            chatId: chat.id,
            isApprovedForVisibility: chat.visibility_approved, // Get from chat table
          });
        }
      }
      setConfirmedMatches(processedMatches);
      setLoadingMatches(false);
    };

    fetchMatches();
  }, [user]);

  const handleChatClick = (chatId: string) => {
    toast.success(`Opening chat!`);
    navigate(`/chat/${chatId}`);
  };

  if (sessionLoading || loadingMatches) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading matches...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Matches</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Please log in to view your matches.</p>
        <Button asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
        <MadeWithDyad />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl flex justify-start mb-6">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Your Matches</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Connect with people who share your interests and boundaries.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
        {confirmedMatches.length > 0 ? (
          confirmedMatches.map((match) => (
            <MatchListItem key={match.chatId} {...match} onChatClick={() => handleChatClick(match.chatId)} />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No matches yet. Keep swiping!</p>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default MatchesPage;