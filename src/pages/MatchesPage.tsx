"use client";

import React from "react";
import MatchListItem from "@/components/MatchListItem";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const MatchesPage = () => {
  // Placeholder data for confirmed matches
  const confirmedMatches = [
    {
      id: "matchA",
      bodyType: "Athletic",
      faceType: "Oval",
      gender: "Male",
      sexualOrientation: "Heterosexual",
      comfortLevel: "sex" as "chat only" | "make-out" | "sex",
      locationRadius: "3 km",
      isVerified: true,
    },
    {
      id: "matchB",
      bodyType: "Curvy",
      faceType: "Round",
      gender: "Female",
      sexualOrientation: "Bisexual",
      comfortLevel: "make-out" as "chat only" | "make-out" | "sex",
      locationRadius: "8 km",
      isVerified: false,
    },
    {
      id: "matchC",
      bodyType: "Slim",
      faceType: "Square",
      gender: "Non-binary",
      sexualOrientation: "Pansexual",
      comfortLevel: "chat only" as "chat only" | "make-out" | "sex",
      locationRadius: "1 km",
      isVerified: true,
    },
  ];

  const handleChatClick = (matchId: string) => {
    toast.success(`Opening chat with ${matchId}!`);
    // In a real app, this would navigate to a chat screen
  };

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
            <MatchListItem key={match.id} {...match} onChatClick={handleChatClick} />
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