"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface SessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profileCompleted: boolean;
  aiVerified: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [aiVerified, setAiVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);

        if (event === "SIGNED_IN") {
          // Check if user has completed profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name, age, body_type, face_type, gender, sexual_orientation, desired_partner_physical, sexual_interests, comfort_level, location_radius")
            .eq("id", currentSession?.user.id)
            .single();

          if (profileError) {
            console.error("[SessionContext] Error fetching profile:", profileError);
          }

          const isProfileCompleted = profileData && 
            profileData.name && 
            profileData.age && 
            profileData.body_type && 
            profileData.face_type && 
            profileData.gender && 
            profileData.sexual_orientation && 
            profileData.desired_partner_physical && 
            profileData.sexual_interests && 
            profileData.sexual_interests.length > 0 && 
            profileData.comfort_level && 
            profileData.location_radius;

          setProfileCompleted(!!isProfileCompleted);

          // Check if user has completed AI verification
          const { data: verificationData, error: verificationError } = await supabase
            .from("profiles")
            .select("face_photo_path, body_photo_path")
            .eq("id", currentSession?.user.id)
            .single();

          if (verificationError) {
            console.error("[SessionContext] Error fetching verification data:", verificationError);
          }

          const isAiVerified = verificationData && 
            verificationData.face_photo_path && 
            verificationData.body_photo_path;

          setAiVerified(!!isAiVerified);

          // Redirect based on profile status
          if (location.pathname === "/login") {
            toast.success("Logged in successfully!");
            if (!isProfileCompleted) {
              navigate("/profile-setup");
            } else if (!isAiVerified) {
              navigate("/ai-verification");
            } else {
              navigate("/");
            }
          }
        } else if (event === "SIGNED_OUT" && location.pathname !== "/login") {
          toast.info("You have been logged out.");
          navigate("/login");
        } else if (event === "INITIAL_SESSION" && !currentSession && location.pathname !== "/login") {
          navigate("/login");
        }
      }
    );

    // Fetch initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);

      if (!initialSession && location.pathname !== "/login") {
        navigate("/login");
      } else if (initialSession) {
        // Check profile completion for existing sessions
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, age, body_type, face_type, gender, sexual_orientation, desired_partner_physical, sexual_interests, comfort_level, location_radius")
          .eq("id", initialSession.user.id)
          .single();

        if (profileError) {
          console.error("[SessionContext] Error fetching profile:", profileError);
        }

        const isProfileCompleted = profileData && 
          profileData.name && 
          profileData.age && 
          profileData.body_type && 
          profileData.face_type && 
          profileData.gender && 
          profileData.sexual_orientation && 
          profileData.desired_partner_physical && 
          profileData.sexual_interests && 
          profileData.sexual_interests.length > 0 && 
          profileData.comfort_level && 
          profileData.location_radius;

        setProfileCompleted(!!isProfileCompleted);

        // Check AI verification
        const { data: verificationData, error: verificationError } = await supabase
          .from("profiles")
          .select("face_photo_path, body_photo_path")
          .eq("id", initialSession.user.id)
          .single();

        if (verificationError) {
          console.error("[SessionContext] Error fetching verification data:", verificationError);
        }

        const isAiVerified = verificationData && 
          verificationData.face_photo_path && 
          verificationData.body_photo_path;

        setAiVerified(!!isAiVerified);

        // Redirect if needed
        if (!isProfileCompleted && location.pathname !== "/profile-setup" && location.pathname !== "/login") {
          navigate("/profile-setup");
        } else if (!isAiVerified && location.pathname !== "/ai-verification" && location.pathname !== "/profile-setup" && location.pathname !== "/login") {
          navigate("/ai-verification");
        }
      }
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading application...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, loading, profileCompleted, aiVerified }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};