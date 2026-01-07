"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PersonalInfoSectionProps {
  form: any;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Your age" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea placeholder="Tell us about yourself..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="bodyCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Count</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Your body count" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Profile Photo</FormLabel>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20">
                <div className="text-muted-foreground text-xs text-center">No Photo</div>
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Photo upload temporarily disabled
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalInfoSection;