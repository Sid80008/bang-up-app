"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export interface AdvancedFilters {
  ageRange: [number, number];
  sexualInterests: string[];
  comfortLevel: string[];
  verifiedOnly: boolean;
  locationRadius: string;
  bodyTypes: string[];
  faceTypes: string[];
}

interface AdvancedDiscoveryFilterProps {
  onFilterChange: (filters: AdvancedFilters) => void;
  activeFiltersCount?: number;
}

const sexualInterestsOptions = [
  "Vanilla",
  "BDSM (light)",
  "BDSM (heavy)",
  "Roleplay",
  "Sensory Play",
  "Cuddling",
  "Kissing",
  "Deep conversations",
  "Fantasies",
  "Voyeurism",
  "Exhibitionism",
];

const bodyTypeOptions = [
  "Slim",
  "Athletic",
  "Average",
  "Curvy",
  "Muscular",
  "Pear-shaped",
  "Apple-shaped",
  "Hourglass",
];

const faceTypeOptions = [
  "Oval",
  "Round",
  "Square",
  "Heart-shaped",
  "Diamond-shaped",
  "Long",
  "Rectangular",
];

export const AdvancedDiscoveryFilter: React.FC<AdvancedDiscoveryFilterProps> = ({
  onFilterChange,
  activeFiltersCount = 0,
}) => {
  const [filters, setFilters] = useState<AdvancedFilters>({
    ageRange: [18, 65],
    sexualInterests: [],
    comfortLevel: [],
    verifiedOnly: false,
    locationRadius: "50km",
    bodyTypes: [],
    faceTypes: [],
  });

  const handleAgeChange = (value: [number, number]) => {
    const newFilters = { ...filters, ageRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (
    category: keyof AdvancedFilters,
    value: string
  ) => {
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    const newFilters = { ...filters, [category]: updated };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleVerifiedChange = (checked: boolean) => {
    const newFilters = { ...filters, verifiedOnly: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationRadiusChange = (value: string) => {
    const newFilters = { ...filters, locationRadius: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: AdvancedFilters = {
      ageRange: [18, 65],
      sexualInterests: [],
      comfortLevel: [],
      verifiedOnly: false,
      locationRadius: "50km",
      bodyTypes: [],
      faceTypes: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 65) count++;
    if (filters.sexualInterests.length > 0) count++;
    if (filters.comfortLevel.length > 0) count++;
    if (filters.verifiedOnly) count++;
    if (filters.locationRadius !== "50km") count++;
    if (filters.bodyTypes.length > 0) count++;
    if (filters.faceTypes.length > 0) count++;
    return count;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">{getActiveFilterCount()}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Advanced Discovery Filters</SheetTitle>
              <SheetDescription>
                Refine your search to find compatible matches
              </SheetDescription>
            </div>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Age Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
            </Label>
            <Slider
              min={18}
              max={100}
              step={1}
              value={filters.ageRange}
              onValueChange={handleAgeChange}
              className="w-full"
            />
          </div>

          {/* Location Radius */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Location Radius</Label>
            <div className="grid grid-cols-2 gap-2">
              {["5km", "10km", "25km", "50km", "100km", "Anywhere"].map(
                (radius) => (
                  <Button
                    key={radius}
                    variant={
                      filters.locationRadius === radius
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleLocationRadiusChange(
                        radius === "Anywhere" ? "anywhere" : radius
                      )
                    }
                    size="sm"
                  >
                    {radius}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Comfort Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Comfort Level</Label>
            <div className="space-y-2">
              {["chat only", "make-out", "sex"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`comfort-${level}`}
                    checked={filters.comfortLevel.includes(level)}
                    onCheckedChange={() =>
                      handleCheckboxChange("comfortLevel", level)
                    }
                  />
                  <Label
                    htmlFor={`comfort-${level}`}
                    className="font-normal cursor-pointer capitalize"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Body Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Body Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {bodyTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`body-${type}`}
                    checked={filters.bodyTypes.includes(type)}
                    onCheckedChange={() =>
                      handleCheckboxChange("bodyTypes", type)
                    }
                  />
                  <Label
                    htmlFor={`body-${type}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Face Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Face Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {faceTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`face-${type}`}
                    checked={filters.faceTypes.includes(type)}
                    onCheckedChange={() =>
                      handleCheckboxChange("faceTypes", type)
                    }
                  />
                  <Label
                    htmlFor={`face-${type}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sexual Interests */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sexual Interests</Label>
            <div className="space-y-2">
              {sexualInterestsOptions.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={filters.sexualInterests.includes(interest)}
                    onCheckedChange={() =>
                      handleCheckboxChange("sexualInterests", interest)
                    }
                  />
                  <Label
                    htmlFor={`interest-${interest}`}
                    className="font-normal cursor-pointer"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="verified-only"
              checked={filters.verifiedOnly}
              onCheckedChange={handleVerifiedChange}
            />
            <Label
              htmlFor="verified-only"
              className="font-normal cursor-pointer text-base"
            >
              Show only verified users
            </Label>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
