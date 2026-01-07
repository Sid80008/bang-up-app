"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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

const formSchema = z.object({
  bodyType: z.string().min(1, "Body type is required"),
  faceType: z.string().min(1, "Face type is required"),
  gender: z.string().min(1, "Gender is required"),
  sexualOrientation: z.string().min(1, "Sexual orientation is required"),
  desiredPartnerPhysical: z.string().min(1, "Desired partner physical traits are required"),
  sexualInterests: z.array(z.string()).min(1, "At least one sexual interest is required"),
  comfortLevel: z.enum(["chat only", "make-out", "sex"], {
    required_error: "Comfort level is required",
  }),
  locationRadius: z.string().min(1, "Location radius is required"),
});

interface AnonymousProfileFormProps {
  initialData?: z.infer<typeof formSchema>;
  onSubmitSuccess?: (data: z.infer<typeof formSchema>) => void;
}

const AnonymousProfileForm: React.FC<AnonymousProfileFormProps> = ({
  initialData,
  onSubmitSuccess,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      bodyType: "",
      faceType: "",
      gender: "",
      sexualOrientation: "",
      desiredPartnerPhysical: "",
      sexualInterests: [],
      comfortLevel: "chat only",
      locationRadius: "5 km",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", data);
    toast.success("Anonymous profile updated successfully!");
    onSubmitSuccess?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="bodyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Athletic, Slim, Curvy" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="e.g., Oval, Square, Round" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <div className="grid grid-cols-2 gap-2">
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
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="chat only" />
                    </FormControl>
                    <FormLabel className="font-normal">Chat Only</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="make-out" />
                    </FormControl>
                    <FormLabel className="font-normal">Make-out</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sex" />
                    </FormControl>
                    <FormLabel className="font-normal">Sex</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit" className="w-full">Update Profile</Button>
      </form>
    </Form>
  );
};

export default AnonymousProfileForm;