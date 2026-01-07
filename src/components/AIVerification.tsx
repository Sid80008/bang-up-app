"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { Camera, UserCheck, Sparkles, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

const AIVerification: React.FC = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [bodyPhoto, setBodyPhoto] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadedPaths, setUploadedPaths] = useState<{ facePath: string | null; bodyPath: string | null }>({ 
    facePath: null, 
    bodyPath: null 
  });

  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFacePhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFacePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBodyPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBodyPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBodyPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File, type: 'face' | 'body') => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    const fileExtension = file.name.split('.').pop();
    const filePath = `${user.id}/verification/${type}_${uuidv4()}.${fileExtension}`;
    const { data, error } = await supabase.storage
      .from('verification-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    return filePath;
  };

  const deleteUploadedPhotos = async () => {
    if (!uploadedPaths.facePath && !uploadedPaths.bodyPath) return;
    
    const filesToDelete = [
      uploadedPaths.facePath,
      uploadedPaths.bodyPath
    ].filter(Boolean) as string[];
    
    if (filesToDelete.length > 0) {
      const { error } = await supabase.storage
        .from('verification-photos')
        .remove(filesToDelete);
      
      if (error) {
        console.error("[AIVerification] Error deleting photos:", error);
      } else {
        console.log("[AIVerification] Photos deleted successfully after verification");
      }
    }
    
    // Clear uploaded paths
    setUploadedPaths({ facePath: null, bodyPath: null });
  };

  const handleVerification = async () => {
    if (!user) {
      toast.error("You must be logged in to verify your profile.");
      return;
    }
    
    if (!facePhoto || !bodyPhoto) {
      toast.error("Please upload both face and body photos.");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Upload face photo
      const facePath = await uploadPhoto(facePhoto, 'face');
      
      // Upload body photo
      const bodyPath = await uploadPhoto(bodyPhoto, 'body');
      
      // Store uploaded paths for cleanup
      setUploadedPaths({ facePath, bodyPath });
      
      // Update profile with photo paths
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          face_photo_path: facePath,
          body_photo_path: bodyPath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      toast.success("Photos uploaded successfully! AI verification will be processed shortly.");
      
      // Simulate AI verification process
      // In a real implementation, this would be replaced with actual AI service call
      setTimeout(async () => {
        // After successful AI verification, delete the photos
        await deleteUploadedPhotos();
        
        // Update profile to mark as verified
        const { error: verifyError } = await supabase
          .from("profiles")
          .update({
            is_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (verifyError) {
          console.error("[AIVerification] Error updating verification status:", verifyError);
          toast.error("Verification completed but failed to update status.");
        } else {
          toast.success("AI verification completed successfully! Photos have been deleted.");
        }
        
        // Reset form
        setFacePhoto(null);
        setBodyPhoto(null);
        setFacePreview(null);
        setBodyPreview(null);
        
        // Redirect to home after successful verification
        navigate("/");
      }, 3000); // Simulate 3 second verification process
      
    } catch (error) {
      console.error("[AIVerification] Error uploading photos:", error);
      toast.error("Failed to upload photos. Please try again.");
      
      // Clean up any uploaded photos on error
      await deleteUploadedPhotos();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeletePhotos = async () => {
    await deleteUploadedPhotos();
    setFacePhoto(null);
    setBodyPhoto(null);
    setFacePreview(null);
    setBodyPreview(null);
    toast.info("Photos deleted.");
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-card to-secondary/30">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <CardTitle className="text-xl font-bold">AI Verification</CardTitle>
        </div>
        <UserCheck className="h-5 w-5 text-primary-foreground" />
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Upload clear photos of your face and body for AI verification to confirm your profile accuracy.
            Photos will be automatically deleted after verification.
          </p>
        </div>
        
        {/* Face Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Face Photo</label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
            {facePreview ? (
              <>
                <img src={facePreview} alt="Face preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
                <Button 
                  type="button" 
                  onClick={handleDeletePhotos}
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </>
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleFacePhotoChange} className="hidden" id="face-photo" />
            <label htmlFor="face-photo">
              <Button asChild variant="outline">
                <span>Choose Face Photo</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Clear frontal face photo with good lighting
            </p>
          </div>
        </div>
        
        {/* Body Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Body Photo</label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
            {bodyPreview ? (
              <>
                <img src={bodyPreview} alt="Body preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
                <Button 
                  type="button" 
                  onClick={handleDeletePhotos}
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </>
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleBodyPhotoChange} className="hidden" id="body-photo" />
            <label htmlFor="body-photo">
              <Button asChild variant="outline">
                <span>Choose Body Photo</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Full body photo showing your actual physique
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleVerification} 
          disabled={isVerifying || !facePhoto || !bodyPhoto}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Submit for AI Verification
            </>
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Your photos will be used solely for AI verification and will be automatically deleted after processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIVerification;