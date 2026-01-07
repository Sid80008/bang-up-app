"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, HeartHandshake, Heart } from "lucide-react";

interface PreferencesSectionProps {
  form: any;
  sexualInterestsOptions: string[];
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ form, sexualInterestsOptions }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexualOrientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexual Orientation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sexual orientation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Heterosexual">Heterosexual</SelectItem>
                  <SelectItem value="Homosexual">Homosexual</SelectItem>
                  <SelectItem value="Bisexual">Bisexual</SelectItem>
                  <SelectItem value="Pansexual">Pansexual</SelectItem>
                  <SelectItem value="Asexual">Asexual</SelectItem>
                  <SelectItem value="Demisexual">Demisexual</SelectItem>
                  <SelectItem value="Queer">Queer</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="desiredPartnerPhysical"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desired Partner (Physical Traits)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Tall, muscular, short, curvy" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sexualInterests"
        render={() => (
          <FormItem>
            <FormLabel>Sexual Interests & Boundaries</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sexualInterestsOptions.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="sexualInterests"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item
                                  )
                                );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="comfortLevel"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Comfort Level</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="chat only" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Only
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="make-out" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center">
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    Make-out
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sex" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Sex
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PreferencesSection;