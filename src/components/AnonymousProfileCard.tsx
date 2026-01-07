"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, MessageSquare, Kiss, Handshake } from "lucide-react";

interface AnonymousProfileCardProps {
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

const AnonymousProfileCard: React.FC<AnonymousProfileCardProps> = ({
  bodyType,
  faceType,
  gender,
  sexualOrientation,
  desiredPartnerPhysical,
  sexualInterests,
  comfortLevel,
  locationRadius,
  isVerified,
}) => {
  const getComfortLevelIcon = (level: string) => {
    switch (level) {
      case "chat only":
        return <MessageSquare className="h-4 w-4 mr-1" />;
      case "make-out":
        return <Kiss className="h-4 w-4 mr-1" />;
      case "sex":
        return <Heart className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Anonymous Profile</CardTitle>
        {isVerified && (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-4">
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
              <Badge key={index} variant="outline">
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
            <span className="text-sm">{locationRadius}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousProfileCard;