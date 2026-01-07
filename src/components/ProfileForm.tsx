"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Heart, Sparkles } from "lucide-react";

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
  photo: z.any().optional(), // For file upload
});

interface ProfileFormProps {
  initialData?: z.infer<typeof formSchema> & {
    id: string;
    isVerified?: boolean;
    photo_url?: string;
    latitude?: number;
    longitude?: number;
  };
  onSubmitSuccess?: (data: z.infer<typeof formSchema> & {
    id: string;
    isVerified?: boolean;
    photo_url?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmitSuccess }) => {
  const { user } = useSession();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(initialData?.photo_url || "");
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
      photo: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        bodyCount: initialData.body_count, // Map body_count from initialData
        photo: undefined, // Ensure file input is reset
      });
      setCurrentPhotoUrl(initialData.photo_url || "");
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

    let photoUrl = currentPhotoUrl;

    if (data.photo && data.photo.length > 0) {
      const file = data.photo[0];
      const fileExtension = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // Assuming a bucket named 'avatars' exists
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("[ProfileForm] Error uploading photo:", uploadError);
        toast.error("Failed to upload photo.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      photoUrl = publicUrlData.publicUrl;
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
      photo_url: photoUrl,
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
        photo_url: photoUrl,
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
                    {currentPhotoUrl ? (
                      <img 
                        src={currentPhotoUrl} 
                        alt="Current Profile" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20">
                        <User className="text-muted-foreground" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => form.setValue("photo", e.target.files)} 
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

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
                    onClick={handleLocationRequest} 
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

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;