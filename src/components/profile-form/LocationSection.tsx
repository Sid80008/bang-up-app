"use client";

import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";

interface LocationSectionProps {
  form: any;
  latitude: number | null;
  longitude: number | null;
  onLocationRequest: () => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({ form, latitude, longitude, onLocationRequest }) => {
  const [locationType, setLocationType] = useState<"auto" | "manual">("auto");

  return (
    <div className="space-y-6">
      {/* Location Type Selection */}
      <Tabs value={locationType} onValueChange={(v) => setLocationType(v as "auto" | "manual")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">Use Current Location</TabsTrigger>
          <TabsTrigger value="manual">Enter Address Manually</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <div>
            <FormLabel>Current Location</FormLabel>
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
                  ✓ Location captured
                </span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter Your Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 123 Main St, New York, NY 10001" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Location Radius */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="locationRadius"
          render={({ field }) => (
            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Search Radius</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  min="1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationRadiusUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "km"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="km">Kilometers (km)</SelectItem>
                  <SelectItem value="mile">Miles (mi)</SelectItem>
                  <SelectItem value="meter">Meters (m)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default LocationSection;