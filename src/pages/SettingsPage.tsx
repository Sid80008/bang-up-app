"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Edit, LogOut, Trash2 } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";

interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio?: string;
  bodyCount?: number;
  height?: number;
  bodyType: string;
  faceType: string;
  gender: string;
  sexualOrientation: string;
  desiredPartnerPhysical: string;
  sexualInterests: string[];
  comfortLevel: "chat only" | "make-out" | "sex";
  locationRadius: string;
  isVerified: boolean;
  latitude?: number;
  longitude?: number;
}

const SettingsPage = () => {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("[SettingsPage] Error fetching profile:", error);
        toast.error("Failed to load your profile.");
      } else if (data) {
        setUserProfile({
          id: data.id,
          name: data.name || "",
          age: data.age || 0,
          bio: data.bio || "",
          bodyCount: data.body_count || 0,
          height: data.height || 0,
          bodyType: data.body_type || "",
          faceType: data.face_type || "",
          gender: data.gender || "",
          sexualOrientation: data.sexual_orientation || "",
          desiredPartnerPhysical: data.desired_partner_physical || "",
          sexualInterests: data.sexual_interests || [],
          comfortLevel: data.comfort_level || "chat only",
          locationRadius: data.location_radius || "",
          isVerified: data.is_verified || false,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error("[SettingsPage] Unexpected error:", error);
      toast.error("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[SettingsPage] Logout error:", error);
        toast.error("Failed to logout.");
      } else {
        toast.success("Logged out successfully.");
        navigate("/login");
      }
    } catch (error) {
      console.error("[SettingsPage] Unexpected logout error:", error);
      toast.error("An unexpected error occurred during logout.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!window.confirm("Really? All your data will be permanently deleted. This cannot be recovered.")) {
      return;
    }

    try {
      // Delete profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);

      if (profileError) {
        console.error("[SettingsPage] Error deleting profile:", profileError);
        toast.error("Failed to delete account.");
        return;
      }

      // Delete auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user?.id || "");

      if (deleteError) {
        console.error("[SettingsPage] Error deleting auth user:", deleteError);
        toast.error("Failed to delete account.");
        return;
      }

      toast.success("Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      console.error("[SettingsPage] Unexpected error deleting account:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleProfileUpdate = (data: any) => {
    setUserProfile(data);
    setIsEditDialogOpen(false);
    toast.success("Profile updated successfully!");
    // Refetch to ensure consistency
    fetchUserProfile();
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">Your profile could not be loaded.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            My Profile & Settings
          </h1>
          <p className="text-foreground/60 mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-foreground/60 mt-2">Your current profile details</p>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Update Your Profile</DialogTitle>
                </DialogHeader>
                {userProfile && (
                  <ProfileForm
                    initialData={{
                      id: userProfile.id,
                      name: userProfile.name,
                      age: userProfile.age,
                      bio: userProfile.bio,
                      bodyCount: userProfile.bodyCount,
                      height: userProfile.height,
                      bodyType: userProfile.bodyType,
                      faceType: userProfile.faceType,
                      gender: userProfile.gender,
                      sexualOrientation: userProfile.sexualOrientation,
                      desiredPartnerPhysical: userProfile.desiredPartnerPhysical,
                      sexualInterests: userProfile.sexualInterests,
                      comfortLevel: userProfile.comfortLevel,
                      locationRadius: userProfile.locationRadius,
                      isVerified: userProfile.isVerified,
                      latitude: userProfile.latitude,
                      longitude: userProfile.longitude,
                    }}
                    onSubmitSuccess={handleProfileUpdate}
                    showOnlyBasicInfo={false}
                  />
                )}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Name</p>
                <p className="text-lg font-semibold">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Age</p>
                <p className="text-lg font-semibold">{userProfile.age}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Body Type</p>
                <p className="text-lg font-semibold">{userProfile.bodyType}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Verification Status</p>
                <p className="text-lg font-semibold">
                  {userProfile.isVerified ? (
                    <span className="text-green-600 dark:text-green-400">Verified ✓</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                  )}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-foreground/60">Bio</p>
                <p className="text-base">{userProfile.bio || "No bio added"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-foreground/60">Sexual Interests</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userProfile.sexualInterests.length > 0 ? (
                    userProfile.sexualInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-foreground/60">None specified</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-foreground/60">{user?.email}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="w-full justify-center border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
