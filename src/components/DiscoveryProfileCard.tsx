"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, MessageSquare, HeartHandshake, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoveryProfileCardProps {
  id: string;
  name?: string; // New field, optional
  age?: number; // New field, optional
  bio?: string; // New field, optional
  bodyCount?: number; // New field, optional
  photo_url?: string; // New field, optional
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  desiredPartnerPhysical: string;
  sexualInterests: string[];
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
  isApprovedForVisibility: boolean; // New prop to control visibility
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
}

const DiscoveryProfileCard: React.FC<DiscoveryProfileCardProps> = ({
  id,
  name,
  age,
  bio,
  bodyCount,
  photo_url,
  bodyType,
  faceType,
  gender,
  sexualOrientation,
  desiredPartnerPhysical,
  sexualInterests,
  comfortLevel,
  locationRadius,
  isVerified,
  isApprovedForVisibility,
  onLike,
  onPass,
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
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-700">
      <CardHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Discovery Profile</CardTitle>
        {isVerified && (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isApprovedForVisibility ? (
          <div className="flex items-center space-x-4 mb-4">
            {photo_url ? (
              <img src={photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="text-gray-500" size={48} />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-semibold">{name}, {age}</h3>
              {bio && <p className="text-sm text-gray-200 mt-1">{bio}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 italic">Full profile hidden until match</p>
          </div>
        )}

        {isApprovedForVisibility && bodyCount !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Body Count</p>
            <p className="font-medium">{bodyCount}</p>
          </div>
        )}

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
        <div className="flex justify-around mt-6">
          <Button variant="destructive" onClick={() => onPass?.(id)}>Pass</Button>
          <Button onClick={() => onLike?.(id)}>Like</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoveryProfileCard;