"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, MessageSquare, HeartHandshake, User, Sparkles, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoveryProfileCardProps {
  id: string;
  name?: string;
  age?: number;
  bio?: string;
  bodyCount?: number;
  height?: number; // Added height field
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  desiredPartnerPhysical: string;
  sexualInterests: string[];
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: number;
  locationRadiusUnit?: string;
  address?: string;
  isVerified: boolean;
  isApprovedForVisibility: boolean;
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
  isOnline?: boolean;
}

const DiscoveryProfileCard: React.FC<DiscoveryProfileCardProps> = ({
  id,
  name,
  age,
  bio,
  bodyCount,
  height, // Added height field
  bodyType,
  faceType,
  gender,
  sexualOrientation,
  desiredPartnerPhysical,
  sexualInterests,
  comfortLevel,
  locationRadius,
  locationRadiusUnit = "km",
  address,
  isVerified,
  isApprovedForVisibility,
  onLike,
  onPass,
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

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-card to-secondary/30">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <CardTitle className="text-xl font-bold">Discovery Profile</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline && (
            <Badge variant="secondary" className="bg-green-500 text-white flex items-center">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              Online
            </Badge>
          )}
          {isVerified && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isApprovedForVisibility ? (
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20">
              <User className="text-muted-foreground" size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{name}{age ? `, ${age}` : ''}</h3>
              {bio && <p className="text-sm text-primary-foreground/80 mt-1">{bio}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 mb-4 bg-secondary rounded-lg">
            <p className="text-muted-foreground italic">Full profile hidden until match</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isApprovedForVisibility && bodyCount !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Body Count</p>
              <p className="font-medium">{bodyCount}</p>
            </div>
          )}
          {isApprovedForVisibility && height !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="font-medium">{height} cm</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Body Type</p>
            <p className="font-medium">{bodyType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Face Type</p>
            <p className="font-medium">{faceType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">{gender}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Orientation</p>
            <p className="font-medium">{sexualOrientation}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Desired Partner (Physical)</p>
          <p className="font-medium">{desiredPartnerPhysical}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sexual Interests & Boundaries</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {sexualInterests.map((interest, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground mr-2">Comfort Level:</p>
            <Badge className="flex items-center">
              {getComfortLevelIcon(comfortLevel)}
              {comfortLevel}
            </Badge>
          </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <div className="flex flex-col text-sm">
                <span>{locationRadius} {locationRadiusUnit}</span>
                {address && <span className="text-xs text-muted-foreground">{address}</span>}
              </div>
          </div>
        </div>
        <div className="flex justify-around mt-6">
          <Button
            variant="outline"
            onClick={() => onPass?.(id)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Pass
          </Button>
          <Button
            onClick={() => onLike?.(id)}
            className="bg-primary hover:bg-primary/90"
          >
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoveryProfileCard;