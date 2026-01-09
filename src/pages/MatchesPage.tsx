"use client";

import React, { useState, useEffect } from "react";
import MatchListItem from "@/components/MatchListItem";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Match {
  id: string;
  name?: string;
  age?: number;
  bio?: string;
  bodyCount?: number;
  // Removed photo_url
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: number;
  locationRadiusUnit?: string;
  isVerified: boolean;
  chatId: string;
  isApprovedForVisibility: boolean;
  isOnline?: boolean; // New field for online status
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
        .select(`*, user1:user1_id(id, name, age, bio, body_count, body_type, face_type, gender, sexual_orientation, comfort_level, location_radius, is_verified), user2:user2_id(id, name, age, bio, body_count, body_type, face_type, gender, sexual_orientation, comfort_level, location_radius, is_verified) `)
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
          // For now, we'll set all matches as online
          // In a real app, you would check actual online status
          processedMatches.push({
            id: otherUser.id,
            name: otherUser.name || "Anonymous",
            age: otherUser.age || 0,
            bio: otherUser.bio || "",
            bodyCount: otherUser.body_count || 0,
            // Removed photo_url
            bodyType: otherUser.body_type || "N/A",
            faceType: otherUser.face_type || "N/A",
            gender: otherUser.gender || "N/A",
            sexualOrientation: otherUser.sexual_orientation || "N/A",
            comfortLevel: (otherUser.comfort_level as "chat only" | "make-out" | "sex") || "chat only",
            locationRadius: otherUser.location_radius ? Number(otherUser.location_radius) : 0,
            locationRadiusUnit: otherUser.location_radius_unit || "km",
            isVerified: otherUser.is_verified || false,
            chatId: chat.id,
            isApprovedForVisibility: chat.visibility_approved,
            isOnline: true, // For demo purposes, all matches are shown as online
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
        <p className="text-lg text-foreground">Loading your matches...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4 space-y-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Your Matches</h1>
          <p className="text-xl mb-8 text-foreground/80">
            Please log in to view your matches.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-4xl flex justify-start mb-6">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="text-center mb-8 w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Your Matches</h1>
        <p className="text-lg text-foreground/80">
          Connect with people who share your interests and boundaries
        </p>
      </div>
      
      <Card className="w-full max-w-4xl bg-card/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Confirmed Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            {confirmedMatches.length > 0 ? (
              confirmedMatches.map((match) => (
                <MatchListItem 
                  key={match.chatId} 
                  {...match} 
                  onChatClick={() => handleChatClick(match.chatId)} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No matches yet</h3>
                <p className="text-foreground/70 mb-4">
                  Keep swiping to find your perfect match!
                </p>
                <Button asChild>
                  <Link to="/">Discover More</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default MatchesPage;