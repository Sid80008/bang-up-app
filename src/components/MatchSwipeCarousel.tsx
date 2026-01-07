"use client";

import React, { useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MatchProfileCard from "./MatchProfileCard";
import { toast } from "sonner";

interface Match {
  id: string; // Ensure ID is present for interaction
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  desiredPartnerPhysical: string;
  sexualInterests: string[];
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
}

interface MatchSwipeCarouselProps {
  matches: Match[];
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}

const MatchSwipeCarousel: React.FC<MatchSwipeCarouselProps> = ({
  matches: initialMatches,
  onLike,
  onPass,
}) => {
  const [currentMatches, setCurrentMatches] = useState<Match[]>(initialMatches);
  const [api, setApi] = React.useState<any>(); // Embla Carousel API

  // Update currentMatches when initialMatches prop changes (e.g., after profile update)
  React.useEffect(() => {
    setCurrentMatches(initialMatches);
  }, [initialMatches]);

  const handleAction = useCallback((id: string, actionType: 'like' | 'pass') => {
    if (actionType === 'like') {
      onLike(id);
    } else {
      onPass(id);
    }
    // Remove the swiped match from the current list
    setCurrentMatches((prevMatches) => prevMatches.filter((match) => match.id !== id));

    // If there are more matches, advance the carousel
    if (api && currentMatches.length > 1) {
      // Embla carousel automatically adjusts when items are removed,
      // so we don't need to manually call scrollNext() here.
      // The next item will simply become the current one.
    } else if (currentMatches.length === 1) {
      toast.info("No more discovery profiles for now! Check back later."); // Renamed
    }
  }, [onLike, onPass, api, currentMatches.length]);

  if (currentMatches.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 text-lg p-8">
        No more discovery profiles for now! Check back later. {/* Renamed */}
      </div>
    );
  }

  return (
    <Carousel setApi={setApi} className="w-full max-w-md">
      <CarouselContent>
        {currentMatches.map((match) => (
          <CarouselItem key={match.id} className="flex justify-center">
            <MatchProfileCard
              {...match}
              onLike={() => handleAction(match.id, 'like')}
              onPass={() => handleAction(match.id, 'pass')}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default MatchSwipeCarousel;