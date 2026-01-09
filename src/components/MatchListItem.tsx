"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Heart, HeartHandshake, User, Circle } from "lucide-react";
import { toast } from "sonner";

interface MatchListItemProps {
  id: string;
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: number;
  locationRadiusUnit?: string;
  isVerified: boolean;
  chatId: string;
  name?: string;
  age?: number;
  height?: number; // Added height field
  onChatClick?: (chatId: string) => void;
  isOnline?: boolean;
}

const MatchListItem: React.FC<MatchListItemProps> = ({
  id,
  bodyType,
  faceType,
  gender,
  sexualOrientation,
  comfortLevel,
  locationRadius,
  locationRadiusUnit = "km",
  isVerified,
  chatId,
  name,
  age,
  height, // Added height field
  onChatClick,
  isOnline = false,
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
    toast.info(`Initiating chat with ${name || `match ${id.substring(0, 8)}`}...`);
    onChatClick?.(chatId);
  };

  return (
    <Card className="w-full p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 border-b last:border-b-0 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mr-4 border-2 border-primary/20">
          <User className="text-muted-foreground" size={24} />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">
              {name ? `${name}${age ? `, ${age}` : ''}` : `Match ${id.substring(0, 8)}`}
            </h3>
            {isOnline && (
              <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs flex items-center">
                <Circle className="h-1.5 w-1.5 mr-1 fill-current" />
                Online
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {gender}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sexualOrientation}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex-grow text-center sm:text-left">
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <p><span className="text-muted-foreground">Body:</span> {bodyType}</p>
          <p><span className="text-muted-foreground">Face:</span> {faceType}</p>
          {height !== undefined && (
            <p><span className="text-muted-foreground">Height:</span> {height} cm</p>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start mt-2 text-sm">
          <p className="text-muted-foreground mr-2">Comfort:</p>
          <Badge className="flex items-center">
            {getComfortLevelIcon(comfortLevel)}
            {comfortLevel}
          </Badge>
          <MapPin className="h-4 w-4 ml-4 mr-1 text-muted-foreground" />
          <div className="flex flex-col text-sm text-muted-foreground">
            <span>{locationRadius} {locationRadiusUnit}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end space-y-2">
        <div className="flex items-center space-x-2">
          {isVerified && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Verified
            </Badge>
          )}
        </div>
        <Button onClick={handleChat} className="w-full sm:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </div>
    </Card>
  );
};

export default MatchListItem;