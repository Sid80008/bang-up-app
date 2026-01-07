"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import AnonymousProfileCard from "@/components/AnonymousProfileCard";
import MatchProfileCard from "@/components/MatchProfileCard";
import AnonymousProfileForm from "@/components/AnonymousProfileForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import React, { useState } from "react";

const Index = () => {
  const [userProfile, setUserProfile] = useState({
    bodyType: "Athletic",
    faceType: "Oval",
    gender: "Female",
    sexualOrientation: "Heterosexual",
    desiredPartnerPhysical: "Tall, muscular",
    sexualInterests: ["Vanilla", "Roleplay", "Sensory Play"],
    comfortLevel: "sex" as "chat only" | "make-out" | "sex",
    locationRadius: "5 km",
    isVerified: true,
  });

  const potentialMatches = [
    {
      id: "match1",
      bodyType: "Slim",
      faceType: "Heart",
      gender: "Male",
      sexualOrientation: "Heterosexual",
      desiredPartnerPhysical: "Curvy, short",
      sexualInterests: ["Cuddling", "Kissing", "Sensory Play"],
      comfortLevel: "make-out" as "chat only" | "make-out" | "sex",
      locationRadius: "2 km",
      isVerified: true,
    },
    {
      id: "match2",
      bodyType: "Average",
      faceType: "Square",
      gender: "Female",
      sexualOrientation: "Bisexual",
      desiredPartnerPhysical: "Any, good humor",
      sexualInterests: ["BDSM (light)", "Fantasies", "Roleplay"],
      comfortLevel: "sex" as "chat only" | "make-out" | "sex",
      locationRadius: "10 km",
      isVerified: false,
    },
    {
      id: "match3",
      bodyType: "Muscular",
      faceType: "Round",
      gender: "Male",
      sexualOrientation: "Homosexual",
      desiredPartnerPhysical: "Athletic, tall",
      sexualInterests: ["Vanilla", "Deep conversations"],
      comfortLevel: "chat only" as "chat only" | "make-out" | "sex",
      locationRadius: "7 km",
      isVerified: true,
    },
  ];

  const handleLike = (id: string) => {
    toast.success(`Liked match ${id}!`);
    console.log(`User liked match with ID: ${id}`);
    // In a real app, this would send a request to the backend
  };

  const handlePass = (id: string) => {
    toast.info(`Passed on match ${id}.`);
    console.log(`User passed on match with ID: ${id}`);
    // In a real app, this would send a request to the backend
  };

  const handleProfileUpdate = (data: typeof userProfile) => {
    setUserProfile(prev => ({ ...prev, ...data }));
    // Close the dialog after successful submission if needed
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your anonymous profile is ready!
        </p>
      </div>
      <AnonymousProfileCard {...userProfile} />

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">Edit Your Anonymous Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <AnonymousProfileForm initialData={userProfile} onSubmitSuccess={handleProfileUpdate} />
        </DialogContent>
      </Dialog>

      <div className="text-center mt-12 mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Potential Matches</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Swipe through anonymous profiles</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {potentialMatches.map((match) => (
          <MatchProfileCard
            key={match.id}
            {...match}
            onLike={handleLike}
            onPass={handlePass}
          />
        ))}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;