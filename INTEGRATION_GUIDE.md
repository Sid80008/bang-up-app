# Integration Implementation Guide

## Quick Start: Adding Features to Existing Pages

### 1. Update DiscoveryProfileCard with Block/Report

```tsx
// File: src/components/DiscoveryProfileCard.tsx
import { BlockReportDialog } from "@/components/BlockReportDialog";
import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DiscoveryProfileCard = (props) => {
  const [showBlockReport, setShowBlockReport] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Existing profile content */}
        
        {/* Add menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBlockReport(true)}
          className="absolute top-2 right-2"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <BlockReportDialog
        isOpen={showBlockReport}
        onClose={() => setShowBlockReport(false)}
        targetUserId={props.id}
        targetUserName={props.name}
      />
    </>
  );
};
```

---

### 2. Update Index Page with Advanced Filtering

```tsx
// File: src/pages/Index.tsx
import { AdvancedDiscoveryFilter, AdvancedFilters } from "@/components/AdvancedDiscoveryFilter";
import { rankPotentialMatches } from "@/lib/matchingAlgorithm";
import { analyticsService } from "@/lib/analytics";
import { useState, useEffect } from "react";

const Index = () => {
  const { user } = useSession();
  const [filters, setFilters] = useState<AdvancedFilters>({...});
  const [potentialMatches, setPotentialMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Track page view
    if (user) {
      analyticsService.trackPageView(user.id, "/");
    }
  }, [user]);

  const handleFilterChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
    
    if (userProfile) {
      // Apply advanced matching algorithm
      const rankedMatches = rankPotentialMatches(
        userProfile,
        potentialMatches,
        30 // minimum compatibility
      );
      
      // Apply filters
      const filteredMatches = rankedMatches
        .filter(m => {
          // Age
          if (m.age && (m.age < newFilters.ageRange[0] || m.age > newFilters.ageRange[1])) {
            return false;
          }
          // Body type
          if (newFilters.bodyTypes.length > 0 && !newFilters.bodyTypes.includes(m.bodyType)) {
            return false;
          }
          // Sexual interests
          if (newFilters.sexualInterests.length > 0) {
            const hasCommonInterest = m.sexualInterests.some(i => 
              newFilters.sexualInterests.includes(i)
            );
            if (!hasCommonInterest) return false;
          }
          // Comfort level
          if (newFilters.comfortLevel.length > 0 && !newFilters.comfortLevel.includes(m.comfortLevel)) {
            return false;
          }
          // Verified only
          if (newFilters.verifiedOnly && !m.isVerified) {
            return false;
          }
          return true;
        });

      setPotentialMatches(filteredMatches);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Discover</h2>
        <AdvancedDiscoveryFilter onFilterChange={handleFilterChange} />
      </div>
      
      {/* Existing carousel */}
      <DiscoverySwipeCarousel
        matches={potentialMatches}
        onLike={(id) => {
          analyticsService.trackLike(user.id, id);
          // existing logic
        }}
        onPass={(id) => {
          analyticsService.trackPass(user.id, id);
          // existing logic
        }}
      />
    </div>
  );
};
```

---

### 3. Update ChatPage with Real-time Features

```tsx
// File: src/pages/ChatPage.tsx
import { realtimeService } from "@/lib/realtime";
import { analyticsService } from "@/lib/analytics";
import { useEffect, useState } from "react";

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Initialize real-time
    realtimeService.initialize(user.id);
    
    // Track page view
    analyticsService.trackChatOpened(user.id, chatId);

    // Subscribe to messages
    realtimeService.subscribeToChat(chatId, (message) => {
      setMessages(prev => [...prev, message]);
      
      // Track message if sent by other user
      if (message.senderId !== user.id) {
        analyticsService.track("message_received", user.id, {
          chatId,
          fromUserId: message.senderId,
        });
      }
    });

    // Subscribe to typing indicators
    realtimeService.subscribeToTyping(chatId, (indicator) => {
      setIsTyping(indicator.isTyping && indicator.userId !== user.id);
    });

    // Track online status changes
    realtimeService.onOnlineStatusChange((userId, isOnline) => {
      setOnlineUsers(prev => 
        isOnline 
          ? [...prev, userId]
          : prev.filter(id => id !== userId)
      );
    });

    return () => {
      realtimeService.unsubscribeFromChat(chatId);
      realtimeService.unsubscribeFromTyping(chatId);
      realtimeService.disconnect();
    };
  }, [user, chatId]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    // Broadcast typing stop
    await realtimeService.broadcastTyping(user.id, chatId, false);

    // Track message
    analyticsService.trackMessageSent(user.id, chatId, content.length);

    // Send message (existing logic)
  };

  const handleInputChange = async (content: string) => {
    // Broadcast typing indicator
    if (content.length > 0) {
      await realtimeService.broadcastTyping(user.id, chatId, true);
    } else {
      await realtimeService.broadcastTyping(user.id, chatId, false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Chat</h2>
        {onlineUsers.includes(otherUserId) && (
          <Badge className="bg-green-500">Online</Badge>
        )}
      </div>

      {isTyping && (
        <div className="text-sm text-muted-foreground italic">
          Typing...
        </div>
      )}

      {/* Existing message list */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onInputChange={handleInputChange}
      />
    </div>
  );
};
```

---

### 4. Update AIVerification with New Service

```tsx
// File: src/components/AIVerification.tsx
import { aiVerificationService } from "@/lib/aiVerification";
import { analyticsService } from "@/lib/analytics";
import { useState } from "react";

const AIVerification = () => {
  const { user } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerification = async () => {
    if (!user || !facePhoto || !bodyPhoto) {
      toast.error("Please upload both photos");
      return;
    }

    setIsVerifying(true);
    analyticsService.trackAIVerificationSubmitted(user.id);

    try {
      // Check individual photos first
      const faceResult = await aiVerificationService.verifyPhoto(facePhoto);
      const bodyResult = await aiVerificationService.verifyPhoto(bodyPhoto);

      if (!faceResult.isValid || !bodyResult.isValid) {
        toast.error("Photo quality check failed");
        setVerificationResult(faceResult.isValid ? bodyResult : faceResult);
        return;
      }

      // Check for appropriate content
      const faceSafety = await aiVerificationService.checkContentSafety(facePhoto);
      const bodySafety = await aiVerificationService.checkContentSafety(bodyPhoto);

      if (!faceSafety.isSafe || !bodySafety.isSafe) {
        toast.error("Photos contain inappropriate content");
        return;
      }

      // Verify face pair
      const pairResult = await aiVerificationService.verifyFacePair(facePhoto, bodyPhoto);

      if (!pairResult.isValid) {
        toast.error("Photos do not appear to be of the same person");
        return;
      }

      // Upload to Supabase and mark verified
      const facePath = await uploadPhoto(facePhoto, 'face');
      const bodyPath = await uploadPhoto(bodyPhoto, 'body');

      const { error } = await supabase
        .from("profiles")
        .update({
          face_photo_path: facePath,
          body_photo_path: bodyPath,
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track success
      analyticsService.trackAIVerificationCompleted(
        user.id,
        true,
        pairResult.confidence
      );

      toast.success("Verification successful!");
      navigate("/");
    } catch (error) {
      console.error("Verification error:", error);
      analyticsService.trackAIVerificationCompleted(user.id, false);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    // Existing UI with updated handler
  );
};
```

---

### 5. Add Premium Tier Check

```tsx
// File: src/utils/premiumHelper.ts
import { getPremiumFeatures, PremiumTier } from "@/components/PremiumTiers";
import { supabase } from "@/integrations/supabase/client";

export async function getUserTier(userId: string): Promise<PremiumTier> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .single();

  if (error) return "free";
  return data?.tier || "free";
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof getPremiumFeatures("free")
): Promise<boolean> {
  const tier = await getUserTier(userId);
  const features = getPremiumFeatures(tier);
  return features[feature] || false;
}

// Usage in component
const canUseAdvancedFilters = await checkFeatureAccess(userId, 'advancedFilters');
if (!canUseAdvancedFilters) {
  // Show upgrade prompt
}
```

---

## Database Schema Setup

```sql
-- Copy paste into Supabase SQL editor

-- Blocked Users
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- User Reports
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  billing_period VARCHAR(20),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Presence (for online status)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- Create indexes for performance
CREATE INDEX idx_blocked_users_user ON blocked_users(user_id);
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
```

---

## Environment Configuration

```bash
# .env.local

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# AI Verification (choose one provider)
# AWS Rekognition
VITE_AI_VERIFICATION_ENDPOINT=https://your-api.example.com/verify-face
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key

# Google Cloud Vision
VITE_GOOGLE_CLOUD_API_KEY=your_google_key

# Custom API
VITE_AI_VERIFICATION_API_KEY=your_custom_api_key

# Analytics
VITE_ANALYTICS_ENDPOINT=/api/analytics
VITE_MIXPANEL_TOKEN=optional_token

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Next Steps

1. ✅ Copy all new component and lib files
2. ✅ Run SQL schema setup in Supabase
3. ✅ Add environment variables
4. ✅ Update existing pages with new features
5. ✅ Test each feature
6. ✅ Deploy to production

