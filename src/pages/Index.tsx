"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import AnonymousProfileCard from "@/components/AnonymousProfileCard";

const Index = () => {
  // Placeholder data for demonstration
  const userProfile = {
    bodyType: "Athletic",
    faceType: "Oval",
    gender: "Female",
    sexualOrientation: "Heterosexual",
    desiredPartnerPhysical: "Tall, muscular",
    sexualInterests: ["Vanilla", "Roleplay", "Sensory Play"],
    comfortLevel: "sex" as "chat only" | "make-out" | "sex",
    locationRadius: "5 km",
    isVerified: true,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your anonymous profile is ready!
        </p>
      </div>
      <AnonymousProfileCard {...userProfile} />
      <MadeWithDyad />
    </div>
  );
};

export default Index;