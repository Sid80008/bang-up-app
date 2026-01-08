import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the request context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the payload from the request
    const { profileId } = await req.json();

    if (!profileId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Profile ID is required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log("[ai-verification-cleanup] Starting verification process for profile:", profileId);

    // Get the profile with photo paths
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("face_photo_path, body_photo_path")
      .eq("id", profileId)
      .single();

    if (profileError) {
      console.error("[ai-verification-cleanup] Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error fetching profile: ${profileError.message}` 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Check if profile has photos to verify
    if (!profile.face_photo_path && !profile.body_photo_path) {
      console.log("[ai-verification-cleanup] No photos found for verification for profile:", profileId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No photos found for verification" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Perform AI verification
    const verificationResult = await performAIVerification(profileId, profile, supabaseClient);

    if (verificationResult.success) {
      console.log("[ai-verification-cleanup] AI verification successful for profile:", profileId);
      
      // Delete the verification photos only after successful verification
      const filesToDelete = [
        profile.face_photo_path,
        profile.body_photo_path
      ].filter(Boolean) as string[];

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabaseClient
          .storage
          .from("verification-photos")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("[ai-verification-cleanup] Error deleting photos:", deleteError);
          // Even if photo deletion fails, we still mark as verified
          // but we log the error for manual cleanup
        } else {
          console.log("[ai-verification-cleanup] Successfully deleted verification photos for profile:", profileId);
        }
      }

      // Update profile to mark as verified and clear photo paths
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          is_verified: true,
          face_photo_path: null,
          body_photo_path: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId);

      if (updateError) {
        console.error("[ai-verification-cleanup] Error updating profile:", updateError);
        return new Response(
          JSON.stringify({ 
            success: true, // Verification was successful
            message: "Verification completed but profile update failed",
            error: updateError.message
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }

      console.log("[ai-verification-cleanup] Profile verified and photos deleted for profile:", profileId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Verification completed and photos deleted" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      // Verification failed - don't delete photos, but update profile
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId);

      if (updateError) {
        console.error("[ai-verification-cleanup] Error updating profile after failed verification:", updateError);
      }

      console.log("[ai-verification-cleanup] Verification failed for profile:", profileId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Verification failed - photos retained for review" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error("[ai-verification-cleanup] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

// Perform actual AI verification - replace with your AI service integration
async function performAIVerification(profileId: string, profile: any, supabaseClient: any) {
  console.log("[ai-verification-cleanup] Performing AI verification for profile:", profileId);
  
  // In a real implementation, you would:
  // 1. Download the photos from storage using the paths
  // 2. Send them to your AI verification service
  // 3. Wait for and process the response
  
  // For demonstration, we'll simulate a successful verification
  // In practice, this would depend on your AI service response
  
  // Simulate processing time (2-5 seconds)
  const processingTime = Math.floor(Math.random() * 3000) + 2000;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;
  
  console.log("[ai-verification-cleanup] AI verification result for profile", profileId, ":", isSuccess ? "SUCCESS" : "FAILED");
  
  return { success: isSuccess };
}