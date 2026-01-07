"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Heart, HeartHandshake } from "lucide-react";
import { toast } from "sonner";

interface MatchListItemProps {
  id: string;
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
  chatId: string; // Added chatId prop
  onChatClick?: (chatId: string) => void; // Changed to accept chatId
}

const MatchListItem: React.FC<MatchListItemProps> = ({
  id,
  bodyType,
  faceType,
  gender,
  sexualOrientation,
  comfortLevel,
  locationRadius,
  isVerified,
  chatId, // Destructure chatId
  onChatClick,
}) => {
  const getComfortLevelIcon = (level: string) => {
    switch (level) {
      case "chat only":
        return <MessageSquare className="h-4 w-4 mr-1" />;
      case "make-out":
        return <HeartHandshake className="h-4 w-4 mr-1" />;
      case "sex":
        return <Heart className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleChat = () => {
    toast.info(`Initiating chat with match ${id}...`);
    onChatClick?.(chatId); // Pass chatId to onChatClick
  };

  return (
    <Card className="w-full p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 border-b last:border-b-0">
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-lg font-semibold">Match ID: {id}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <p><span className="text-muted-foreground">Body:</span> {bodyType}</p>
          <p><span className="text-muted-foreground">Face:</span> {faceType}</p>
          <p><span className="text-muted-foreground">Gender:</span> {gender}</p>
          <p><span className="text-muted-foreground">Orientation:</span> {sexualOrientation}</p>
        </div>
        <div className="flex items-center justify-center sm:justify-start mt-2 text-sm">
          <p className="text-muted-foreground mr-2">Comfort:</p>
          <Badge className="flex items-center">
            {getComfortLevelIcon(comfortLevel)}
            {comfortLevel}
          </Badge>
          <MapPin className="h-4 w-4 ml-4 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">{locationRadius}</span>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end space-y-2">
        {isVerified && (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Verified
          </Badge>
        )}
        <Button onClick={handleChat} className="w-full sm:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" /> Chat
        </Button>
      </div>
    </Card>
  );
};

export default MatchListItem;