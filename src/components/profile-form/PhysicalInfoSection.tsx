"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhysicalInfoSectionProps {
  form: any;
  bodyTypeOptions: string[];
  faceTypeOptions: string[];
}

const PhysicalInfoSection: React.FC<PhysicalInfoSectionProps> = ({ form, bodyTypeOptions, faceTypeOptions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="bodyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Body Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your body type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {bodyTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="faceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Face Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your face type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {faceTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PhysicalInfoSection;