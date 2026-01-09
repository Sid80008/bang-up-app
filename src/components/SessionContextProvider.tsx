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

        // Store session in localStorage for persistence
        if (currentSession) {
          try {
            localStorage.setItem("supabase_session", JSON.stringify(currentSession));
          } catch (e) {
            console.error("[SessionContext] Error storing session:", e);
          }
        }
        
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
            .select("is_verified")
            .eq("id", currentSession?.user.id)
            .single();
          
          if (verificationError) {
            console.error("[SessionContext] Error fetching verification data:", verificationError);
          }
          
          const isAiVerified = verificationData && verificationData.is_verified;
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
        } else if (event === "SIGNED_OUT") {
          // Clear session from localStorage
          try {
            localStorage.removeItem("supabase_session");
          } catch (e) {
            console.error("[SessionContext] Error removing session:", e);
          }
          
          if (location.pathname !== "/login") {
            toast.info("You have been logged out.");
            navigate("/login");
          }
        }
      }
    );

    // Fetch initial session - try localStorage first
    const getInitialSession = async () => {
      try {
        // Try to get session from localStorage first
        const storedSession = localStorage.getItem("supabase_session");
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            // Verify the stored session is still valid
            const { data: { session: validatedSession }, error } = await supabase.auth.getSession();
            if (validatedSession) {
              setSession(validatedSession);
              setUser(validatedSession.user);
              setLoading(false);
              
              // Fetch profile data
              await checkProfileCompletion(validatedSession.user.id, validatedSession);
              return;
            }
          } catch (e) {
            console.error("[SessionContext] Error parsing stored session:", e);
            localStorage.removeItem("supabase_session");
          }
        }

        // If no valid stored session, get fresh session from Supabase
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession) {
          await checkProfileCompletion(initialSession.user.id, initialSession);
          if (location.pathname === "/login") {
            navigate("/");
          }
        } else if (location.pathname !== "/login") {
          navigate("/login");
        }
      } catch (e) {
        console.error("[SessionContext] Error in getInitialSession:", e);
      } finally {
        setLoading(false);
      }
    };

    const checkProfileCompletion = async (userId: string, session: Session) => {
      try {
        // Check profile completion
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, age, face_type, gender, sexual_orientation, desired_partner_physical, sexual_interests, comfort_level, location_radius")
          .eq("id", userId)
          .single();
        
        const isProfileCompleted = profileData && 
          profileData.name && 
          profileData.age && 
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
        const { data: verificationData } = await supabase
          .from("profiles")
          .select("is_verified")
          .eq("id", userId)
          .single();
        
        const isAiVerified = verificationData && verificationData.is_verified;
        setAiVerified(!!isAiVerified);
      } catch (e) {
        console.error("[SessionContext] Error checking profile completion:", e);
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