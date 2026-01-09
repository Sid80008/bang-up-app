# Bang-up App - Feature Improvements Documentation

## Overview
This document covers all new features added to enhance the Choice Matters app with real-world functionality.

---

## 1. User Blocking & Report System

### Location
`src/components/BlockReportDialog.tsx`

### Features
- ✅ Block users (prevents mutual visibility)
- ✅ Report inappropriate behavior
- ✅ Categorized report reasons
- ✅ Optional detailed report information

### Usage in Components

```tsx
import { BlockReportDialog } from "@/components/BlockReportDialog";

export const MyComponent = () => {
  const [blockReportOpen, setBlockReportOpen] = useState(false);

  return (
    <>
      <button onClick={() => setBlockReportOpen(true)}>
        Block/Report
      </button>
      
      <BlockReportDialog
        isOpen={blockReportOpen}
        onClose={() => setBlockReportOpen(false)}
        targetUserId="user-id"
        targetUserName="User Name"
      />
    </>
  );
};
```

### Database Tables Needed
```sql
-- Blocked users table
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User reports table
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID NOT NULL REFERENCES auth.users(id),
  reason VARCHAR(100),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Advanced Matching Algorithm

### Location
`src/lib/matchingAlgorithm.ts`

### Features
- ✅ Multi-factor compatibility scoring (0-100)
- ✅ Sexual interests matching
- ✅ Orientation compatibility
- ✅ Comfort level alignment
- ✅ Verification bonus
- ✅ Distance-based matching

### Scoring Breakdown
- Sexual Interests: 30 points max
- Orientation Match: 25 points max
- Comfort Level: 20 points max
- Verification Bonus: 15 points max
- Distance Factor: 10 points max

### Usage

```tsx
import { 
  calculateCompatibility, 
  rankPotentialMatches 
} from "@/lib/matchingAlgorithm";

// Calculate single compatibility
const score = calculateCompatibility(currentUser, potentialMatch);
console.log(score.totalScore); // 0-100
console.log(score.breakdown); // Detailed breakdown

// Rank multiple matches
const rankedMatches = rankPotentialMatches(
  currentUser, 
  potentialMatches, 
  30 // minimum compatibility threshold
);
```

---

## 3. Advanced Search & Filtering

### Location
`src/components/AdvancedDiscoveryFilter.tsx`

### Features
- ✅ Age range slider
- ✅ Location radius selection
- ✅ Comfort level filters
- ✅ Body type filters
- ✅ Face type filters
- ✅ Sexual interests filters
- ✅ Verified users only toggle
- ✅ Active filter count badge

### Usage

```tsx
import { AdvancedDiscoveryFilter, AdvancedFilters } from "@/components/AdvancedDiscoveryFilter";

export const Discovery = () => {
  const [filters, setFilters] = useState<AdvancedFilters>({
    ageRange: [18, 65],
    sexualInterests: [],
    comfortLevel: [],
    verifiedOnly: false,
    locationRadius: "50km",
    bodyTypes: [],
    faceTypes: [],
  });

  const handleFilterChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
    // Apply filters to matches
  };

  return (
    <AdvancedDiscoveryFilter onFilterChange={handleFilterChange} />
  );
};
```

---

## 4. Analytics Event Tracking

### Location
`src/lib/analytics.ts`

### Features
- ✅ Automatic event batching
- ✅ Session tracking
- ✅ Pre-made event types
- ✅ Custom metadata support
- ✅ Auto-flush mechanism
- ✅ Offline-safe queuing

### Event Types
- `page_view` - Page navigation
- `profile_view` - Profile visited
- `user_liked` - Swiped right
- `user_passed` - Swiped left
- `match_confirmed` - Mutual match
- `message_sent` - Chat message sent
- `user_blocked` - User blocked
- `ai_verification_completed` - AI verification result

### Usage

```tsx
import { analyticsService } from "@/lib/analytics";

// Track page view
analyticsService.trackPageView(userId, "/matches");

// Track like
analyticsService.trackLike(userId, targetUserId);

// Track custom event
analyticsService.track(
  "premium_tier_upgraded",
  userId,
  { tier: "plus", price: 9.99 }
);

// Manual flush (automatically happens every 30s)
await analyticsService.flush();
```

### Backend Integration
```javascript
// Example: POST /api/analytics
// Receives batch of events and logs them
app.post('/api/analytics', (req, res) => {
  const { events, timestamp } = req.body;
  // Store events in database or analytics service
  // (Mixpanel, Amplitude, custom database, etc.)
  res.json({ success: true });
});
```

---

## 5. Premium Tier System

### Location
`src/components/PremiumTiers.tsx`

### Features
- ✅ 3-tier pricing (Free, Plus, Premium)
- ✅ Monthly & annual billing
- ✅ Feature comparison table
- ✅ Stripe checkout integration
- ✅ Feature-locked functionality

### Tier Features

| Feature | Free | Plus | Premium |
|---------|------|------|---------|
| Daily Likes | 10 | 50 | Unlimited |
| Advanced Filters | ❌ | ✅ | ✅ |
| Priority Search | ❌ | ✅ | ✅ |
| Rewind Action | ❌ | ✅ | ✅ |
| Unlimited Messages | ❌ | ✅ | ✅ |
| See Who Likes | ❌ | ❌ | ✅ |
| Custom Profile | ❌ | ❌ | ✅ |

### Usage

```tsx
import { PremiumPricing, getPremiumFeatures } from "@/components/PremiumTiers";

// Show pricing page
<PremiumPricing 
  currentTier="free"
  onUpgrade={(tier) => console.log('Upgrading to:', tier)}
/>

// Check feature availability
const features = getPremiumFeatures("plus");
if (features.advancedFilters) {
  // Show advanced filters
}
```

### Database Tables Needed
```sql
-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  billing_period VARCHAR(20),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Stripe Integration
```bash
# Environment variables needed
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 6. Real-time Features (WebSocket)

### Location
`src/lib/realtime.ts`

### Features
- ✅ Online status tracking
- ✅ Typing indicators
- ✅ Real-time messaging
- ✅ Presence channel support
- ✅ Automatic reconnection

### Usage

```tsx
import { realtimeService } from "@/lib/realtime";
import { useEffect } from "react";

export const ChatComponent = ({ userId, chatId }) => {
  useEffect(() => {
    // Initialize real-time connection
    realtimeService.initialize(userId);

    // Subscribe to chat messages
    realtimeService.subscribeToChat(chatId, (message) => {
      console.log("New message:", message);
      setMessages(prev => [...prev, message]);
    });

    // Subscribe to typing indicators
    realtimeService.subscribeToTyping(chatId, (indicator) => {
      setIsTyping(indicator.isOnline && indicator.userId !== userId);
    });

    // Broadcast typing
    const handleInput = () => {
      realtimeService.broadcastTyping(userId, chatId, true);
    };

    // Clean up
    return () => {
      realtimeService.unsubscribeFromChat(chatId);
      realtimeService.unsubscribeFromTyping(chatId);
    };
  }, [userId, chatId]);

  return (
    // Chat UI
  );
};
```

### Supabase Configuration
```typescript
// Enable real-time for tables in Supabase dashboard
// Tables: messages, user_presence

// OR via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
```

---

## 7. AI Face Verification

### Location
`src/lib/aiVerification.ts`

### Features
- ✅ Face detection & quality check
- ✅ Face pair matching (verify same person)
- ✅ Content safety detection
- ✅ Fake image detection
- ✅ Multiple provider support

### Supported Providers
1. **AWS Rekognition** - Enterprise-grade
2. **Google Cloud Vision** - Excellent accuracy
3. **Custom API** - Your own backend

### Usage

```tsx
import { aiVerificationService } from "@/lib/aiVerification";

// Verify single photo
const faceResult = await aiVerificationService.verifyPhoto(imageFile);
console.log(faceResult.isValid); // true/false
console.log(faceResult.confidence); // 0-1
console.log(faceResult.reason); // Error message if failed

// Verify face pair (ensure same person)
const pairResult = await aiVerificationService.verifyFacePair(
  facePhotoFile,
  bodyPhotoFile
);

// Check for inappropriate content
const safetyResult = await aiVerificationService.checkContentSafety(imageFile);

// Detect fake/manipulated images
const fakeResult = await aiVerificationService.detectFakeImage(imageFile);

// Change provider
aiVerificationService.setProvider({
  name: "aws-rekognition",
  apiEndpoint: "https://api.example.com/verify",
  apiKey: process.env.VITE_AWS_KEY
});
```

### API Endpoint Format

```javascript
// POST /api/verify-face
// Request:
{
  image: "base64_encoded_image",
  imageType: "photo"
}

// Response:
{
  confidence: 0.95,
  detailedResults: {
    faceDetected: true,
    faceQuality: 0.92,
    obscured: false,
    expressions: ["neutral"],
    landmarks: ["left_eye", "right_eye", ...]
  }
}
```

---

## Integration Checklist

### Database Setup
- [ ] Create `blocked_users` table
- [ ] Create `user_reports` table
- [ ] Create `user_subscriptions` table
- [ ] Enable Realtime on `messages` table
- [ ] Create indexes for performance

### Third-party Services
- [ ] Set up Stripe account and keys
- [ ] Configure AI verification API (AWS/Google/Custom)
- [ ] Set up analytics backend (Mixpanel/Amplitude/Custom)

### Environment Variables
```bash
# Stripe
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# AI Verification
VITE_AI_VERIFICATION_ENDPOINT=
VITE_AI_VERIFICATION_API_KEY=

# Analytics
VITE_ANALYTICS_ENDPOINT=
```

### Frontend Updates
- [ ] Import and use `BlockReportDialog` in match cards
- [ ] Import and use `AdvancedDiscoveryFilter` in discovery page
- [ ] Add analytics tracking to key events
- [ ] Integrate `PremiumPricing` component
- [ ] Add real-time listeners to chat components
- [ ] Update AIVerification page with new service

---

## Testing

### Unit Tests
```bash
npm run test
```

### Analytics Test
```tsx
import { analyticsService } from "@/lib/analytics";

// Check pending events
const pending = analyticsService.getPendingEvents();
console.log("Pending events:", pending);
```

### Real-time Test
```tsx
// Test online status
realtimeService.updateOnlineStatus(userId, true);
realtimeService.updateOnlineStatus(userId, false);

// Check online users
console.log(realtimeService.getOnlineUsers());
```

---

## Performance Considerations

1. **Analytics**: Events auto-batch every 30s or at 50 events
2. **Real-time**: Channels unsubscribe automatically on component unmount
3. **Matching**: Cache calculated scores for performance
4. **Filtering**: Apply server-side filters when possible
5. **AI Verification**: Resize images before sending (~2MB max)

---

## Security Best Practices

✅ All API keys stored in environment variables  
✅ Report system prevents abuse  
✅ Blocking prevents harassment  
✅ Content safety checks block inappropriate content  
✅ Fake image detection prevents catfishing  
✅ Verification confirms user identity  

---

## Support & Troubleshooting

### Real-time Not Working
1. Check Supabase connection
2. Verify real-time tables are published
3. Check browser console for errors

### Analytics Not Sending
1. Check `/api/analytics` endpoint exists
2. Verify network connectivity
3. Check browser console for CORS errors

### AI Verification Failing
1. Ensure image is valid JPEG/PNG
2. Check API endpoint is accessible
3. Verify image contains a visible face
4. Resize very large images before sending

---

## Future Enhancements

- [ ] Video verification for extra security
- [ ] Background check integration
- [ ] Advanced matching ML model
- [ ] Voice/video chat features
- [ ] Community moderation dashboard
- [ ] Automated abuse detection
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

