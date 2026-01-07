"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationSectionProps {
  form: any;
  latitude: number | null;
  longitude: number | null;
  onLocationRequest: () => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({ form, latitude, longitude, onLocationRequest }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="locationRadius"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Radius</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 5 km, 10 miles" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Location (Optional for matching)</FormLabel>
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            onClick={onLocationRequest} 
            variant="outline" 
            className="flex items-center"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Get My Location
          </Button>
          {latitude && longitude && (
            <span className="text-sm text-muted-foreground">
              Lat: {latitude.toFixed(4)}, Long: {longitude.toFixed(4)}
            </span>
          )}
        </div>
        <FormMessage />
      </div>
    </div>
  );
};

export default LocationSection;