"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import PersonalInfoSection from "./profile-form/PersonalInfoSection";
import PhysicalInfoSection from "./profile-form/PhysicalInfoSection";
import PreferencesSection from "./profile-form/PreferencesSection";
import LocationSection from "./profile-form/LocationSection";
import SubmitSection from "./profile-form/SubmitSection";

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

// Predefined options for body types and face types
const bodyTypeOptions = [
  "Slim", "Athletic", "Average", "Curvy", "Muscular", "Pear-shaped", "Apple-shaped", "Hourglass"
];

const faceTypeOptions = [
  "Oval", "Round", "Square", "Heart-shaped", "Diamond-shaped", "Long", "Rectangular"
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must not exceed 50 characters"),
  age: z.coerce.number().min(18, "You must be at least 18 years old").max(120, "Age seems too high"),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  bodyCount: z.coerce.number().min(0, "Body count cannot be negative").optional(),
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

interface ProfileFormProps {
  initialData?: z.infer<typeof formSchema> & {
    id: string;
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
  };
  onSubmitSuccess?: (data: z.infer<typeof formSchema> & {
    id: string;
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmitSuccess }) => {
  const { user } = useSession();
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      age: initialData?.age || 18,
      bio: initialData?.bio || "",
      bodyCount: initialData?.body_count || 0,
      bodyType: initialData?.bodyType || "",
      faceType: initialData?.faceType || "",
      gender: initialData?.gender || "",
      sexualOrientation: initialData?.sexualOrientation || "",
      desiredPartnerPhysical: initialData?.desiredPartnerPhysical || "",
      sexualInterests: initialData?.sexualInterests || [],
      comfortLevel: initialData?.comfortLevel || "chat only",
      locationRadius: initialData?.locationRadius || "5 km",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        bodyCount: initialData.body_count,
      });
      setLatitude(initialData.latitude || null);
      setLongitude(initialData.longitude || null);
    }
  }, [initialData, form]);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("Location captured!");
        },
        (error) => {
          console.error("[ProfileForm] Error getting location:", error);
          toast.error("Failed to get location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const profileData = {
      id: user.id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      body_count: data.bodyCount,
      body_type: data.bodyType,
      face_type: data.faceType,
      gender: data.gender,
      sexual_orientation: data.sexualOrientation,
      desired_partner_physical: data.desiredPartnerPhysical,
      sexual_interests: data.sexualInterests,
      comfort_level: data.comfortLevel,
      location_radius: data.locationRadius,
      latitude: latitude,
      longitude: longitude,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: 'id'
      });

    if (error) {
      console.error("[ProfileForm] Error updating profile:", error);
      toast.error("Failed to update your preferences.");
    } else {
      toast.success("Your preferences updated successfully!");
      onSubmitSuccess?.({
        ...data,
        id: user.id,
        isVerified: initialData?.isVerified,
        latitude,
        longitude
      });
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Update Your Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your authentic self while maintaining your boundaries
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoSection form={form} />
            <PhysicalInfoSection form={form} bodyTypeOptions={bodyTypeOptions} faceTypeOptions={faceTypeOptions} />
            <PreferencesSection form={form} sexualInterestsOptions={sexualInterestsOptions} />
            <LocationSection form={form} latitude={latitude} longitude={longitude} onLocationRequest={handleLocationRequest} />
            <SubmitSection />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;