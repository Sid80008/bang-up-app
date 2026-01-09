# Architecture & Integration Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BANG-UP APP                              │
│                    (Choice Matters)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Index.tsx         → Home/Discovery                    │  │
│  │  • MatchesPage.tsx   → Confirmed matches                │  │
│  │  • ChatPage.tsx      → Messaging                         │  │
│  │  • ProfileSetup.tsx  → Profile creation                 │  │
│  │  • AIVerification.tx → AI verification                  │  │
│  │  • Login.tsx         → Authentication                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                     │
│                           │ Uses                                │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components (NEW)                                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • BlockReportDialog        (Blocking & Reporting)      │  │
│  │  • AdvancedDiscoveryFilter  (Search & Filtering)        │  │
│  │  • PremiumTiers             (Pricing & Tiers)           │  │
│  │  • DiscoverySwipeCarousel   (Swiping UI)                │  │
│  │  • ChatMessage/ChatInput    (Chat UI)                   │  │
│  │  • Header                   (Navigation)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                     │
│                           │ Uses                                │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UI Library (shadcn/ui + Radix UI)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Buttons, Cards, Dialogs, Sliders, Checkboxes, etc.  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           ▲
                           │ Calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICES LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Core Services                                          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  • SessionContextProvider  (Auth & State)             │   │
│  │  • Supabase Client         (Database & Storage)       │   │
│  │  • React Query             (Data Fetching)            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  NEW Services (src/lib/)                                │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  1. matchingAlgorithm.ts                               │   │
│  │     ├─ calculateCompatibility()                        │   │
│  │     ├─ rankPotentialMatches()                          │   │
│  │     └─ [Uses: Interests, Orientation, Distance, etc] │   │
│  │                                                         │   │
│  │  2. analytics.ts                                       │   │
│  │     ├─ track()                                         │   │
│  │     ├─ trackLike/Pass/Message()                        │   │
│  │     ├─ flush() - Auto every 30s                        │   │
│  │     └─ [Sends to: /api/analytics]                     │   │
│  │                                                         │   │
│  │  3. realtime.ts                                        │   │
│  │     ├─ initialize()                                    │   │
│  │     ├─ subscribeToChat()                               │   │
│  │     ├─ broadcastTyping()                               │   │
│  │     ├─ updateOnlineStatus()                            │   │
│  │     └─ [Uses: Supabase Realtime Channels]             │   │
│  │                                                         │   │
│  │  4. aiVerification.ts                                  │   │
│  │     ├─ verifyPhoto()                                   │   │
│  │     ├─ verifyFacePair()                                │   │
│  │     ├─ checkContentSafety()                            │   │
│  │     ├─ detectFakeImage()                               │   │
│  │     └─ [Calls: AWS/Google/Custom API]                │   │
│  │                                                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           ▲
                           │ Calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL + Real-time)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Tables:                                                 │  │
│  │  ├─ auth.users                  (Auth)                 │  │
│  │  ├─ profiles                    (User data)            │  │
│  │  ├─ chats                        (Chat threads)         │  │
│  │  ├─ messages        [Realtime]   (Chat messages)       │  │
│  │  ├─ user_interactions           (Likes/Passes)         │  │
│  │  ├─ blocked_users     [NEW]      (Blocking)            │  │
│  │  ├─ user_reports      [NEW]      (Reports)             │  │
│  │  ├─ user_subscriptions [NEW]     (Premium tier)        │  │
│  │  ├─ user_presence     [NEW]      (Online status)       │  │
│  │  └─ verification-photos (Storage)                       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Third-party APIs                                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Stripe (Payment Processing)                        │ │  │
│  │  │  ├─ Create Checkout Session                        │ │  │
│  │  │  ├─ Handle Webhooks                                │ │  │
│  │  │  └─ Manage Subscriptions                           │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  AI Verification (Choose One)                       │ │  │
│  │  │  ├─ AWS Rekognition                               │ │  │
│  │  │  ├─ Google Cloud Vision                           │ │  │
│  │  │  └─ Custom API                                    │ │  │
│  │  │  Functions:                                        │ │  │
│  │  │  ├─ /verify-face                                  │ │  │
│  │  │  ├─ /verify-pair                                  │ │  │
│  │  │  ├─ /safety                                       │ │  │
│  │  │  └─ /detect-fake                                  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Analytics Backend                                  │ │  │
│  │  │  └─ /api/analytics (POST)                          │ │  │
│  │  │     Receives event batches and logs them           │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Profile Discovery with Matching

```
User Opens Discovery Page (Index.tsx)
         │
         ▼
    Load Filters (AdvancedDiscoveryFilter)
         │
         ├─ Age Range
         ├─ Location Radius
         ├─ Body/Face Type
         ├─ Sexual Interests
         ├─ Comfort Level
         └─ Verified Only
         │
         ▼
    Fetch Potential Matches (Supabase)
         │
         ├─ Query profiles table
         ├─ Filter by preferences
         └─ Check blocked_users table
         │
         ▼
    Calculate Compatibility Scores
    (matchingAlgorithm.ts)
         │
         ├─ Interest Match (30 pts)
         ├─ Orientation Match (25 pts)
         ├─ Comfort Level (20 pts)
         ├─ Verification Bonus (15 pts)
         └─ Distance Factor (10 pts)
         │
         ▼
    Apply User Filters
    (AdvancedDiscoveryFilter)
         │
         ├─ Age check
         ├─ Location check
         ├─ Body type check
         ├─ Interest check
         ├─ Comfort level check
         └─ Verification check
         │
         ▼
    Rank by Compatibility Score
         │
         ▼
    Display in Carousel (DiscoverySwipeCarousel)
         │
         ├─ Card 1 (Score: 92)
         ├─ Card 2 (Score: 87)
         └─ Card 3 (Score: 81)
         │
         ▼
    User Swipes
         │
         ├─ LIKE
         │   ├─ Track: analyticsService.trackLike()
         │   ├─ Insert: user_interactions
         │   └─ Check for mutual match
         │
         └─ PASS
             ├─ Track: analyticsService.trackPass()
             ├─ Insert: user_interactions
             └─ Move to next
```

---

## Data Flow: Real-time Chat

```
User Opens Chat (ChatPage.tsx)
         │
         ▼
    Initialize Real-time (realtimeService.initialize())
         │
         ├─ Connect to presence channel
         ├─ Track user online status
         └─ Get list of online users
         │
         ▼
    Subscribe to Chat Messages
    (realtimeService.subscribeToChat())
         │
         ├─ Listen on: messages table
         ├─ Filter by: chat_id
         └─ Trigger on: INSERT events
         │
         ▼
    Subscribe to Typing Indicators
    (realtimeService.subscribeToTyping())
         │
         ├─ Listen on: typing:chatId channel
         └─ Show "User is typing..."
         │
         ▼
    User Types Message
         │
         ├─ Broadcast: realtimeService.broadcastTyping(true)
         ├─ Display: "You are typing..."
         └─ Send to other user in real-time
         │
         ▼
    User Sends Message
         │
         ├─ Save to: messages table
         ├─ Broadcast: realtimeService.broadcastTyping(false)
         ├─ Track: analyticsService.trackMessageSent()
         └─ Real-time update to subscriber
         │
         ▼
    User Receives Message (Real-time)
         │
         ├─ UPDATE messages.is_read = true
         ├─ Display in chat
         ├─ Play notification
         └─ Update lastActivityAt
         │
         ▼
    User Leaves Chat
         │
         └─ Unsubscribe from channels
```

---

## Data Flow: AI Verification

```
User Uploads Photos (AIVerification.tsx)
         │
         ├─ Face Photo
         └─ Body Photo
         │
         ▼
    Verify Individual Photos
    (aiVerificationService.verifyPhoto())
         │
         ├─ FACE CHECK:
         │  ├─ Face detected? ✓
         │  ├─ Face quality? ✓ (>90%)
         │  └─ Confidence score? ✓ (>75%)
         │
         └─ BODY CHECK:
            ├─ Face visible? ✓
            ├─ Body quality? ✓ (>80%)
            └─ Confidence score? ✓ (>75%)
         │
         ▼
    Check Content Safety
    (aiVerificationService.checkContentSafety())
         │
         ├─ Explicit content? ✗
         ├─ Nude? ✗
         └─ Safe to display? ✓
         │
         ▼
    Detect Fake Images
    (aiVerificationService.detectFakeImage())
         │
         ├─ AI-generated? ✗
         ├─ Face-swapped? ✗
         └─ Manipulated? ✗
         │
         ▼
    Verify Face Pair
    (aiVerificationService.verifyFacePair())
         │
         ├─ Extract face features
         ├─ Compare face features
         └─ Confidence: 95%
         │
         ▼
    Result: ✓ VERIFIED
         │
         ├─ Upload photos to Storage
         ├─ Update profiles.is_verified = true
         ├─ Track: analyticsService.trackAIVerificationCompleted()
         └─ Redirect to Home
```

---

## Feature Integration Map

```
FEATURE LEVEL              FILES                    DEPENDENCIES
─────────────────────────────────────────────────────────────────

User Interface
  │
  ├─ BlockReportDialog        ← BlockReportDialog.tsx
  │  └─ Uses: UI components, Supabase
  │
  ├─ AdvancedDiscoveryFilter  ← AdvancedDiscoveryFilter.tsx
  │  └─ Uses: UI components, matchingAlgorithm
  │
  ├─ PremiumTiers             ← PremiumTiers.tsx
  │  └─ Uses: UI components, Stripe API
  │
  └─ Other Components         ← Existing components
     └─ Uses: Realtime, Analytics

Business Logic Layer
  │
  ├─ matchingAlgorithm        ← src/lib/matchingAlgorithm.ts
  │  └─ Used by: Index page, Discovery filter
  │
  ├─ analytics                ← src/lib/analytics.ts
  │  └─ Used by: All pages, All components
  │
  ├─ realtime                 ← src/lib/realtime.ts
  │  └─ Used by: ChatPage, Header, etc
  │
  └─ aiVerification           ← src/lib/aiVerification.ts
     └─ Used by: AIVerificationPage

Backend Services
  │
  ├─ Supabase
  │  ├─ Auth (existing)
  │  ├─ Database (new tables)
  │  ├─ Storage (existing)
  │  └─ Realtime (new tables)
  │
  ├─ Stripe (optional)
  │  └─ Payment processing
  │
  ├─ AI Service (optional)
  │  └─ Face verification
  │
  └─ Custom Backend (optional)
     └─ Analytics endpoint
```

---

## Integration Checklist by Component

### BlockReportDialog
```
✓ Component Created: src/components/BlockReportDialog.tsx
✓ UI: shadcn/ui components
✓ Dependencies: Supabase
□ Database: blocked_users, user_reports tables
□ Integration: Add to DiscoveryProfileCard, MatchListItem
□ Testing: Test block, test report with all reasons
```

### AdvancedDiscoveryFilter
```
✓ Component Created: src/components/AdvancedDiscoveryFilter.tsx
✓ UI: shadcn/ui components
✓ Dependencies: matchingAlgorithm
□ Integration: Add to Index.tsx page
□ Logic: Apply filters to match list
□ Testing: Test each filter individually
```

### PremiumTiers
```
✓ Component Created: src/components/PremiumTiers.tsx
✓ UI: shadcn/ui components
✓ Dependencies: Stripe API
□ Database: user_subscriptions table
□ Stripe: Create products and prices
□ Backend: Create checkout session endpoint
□ Webhooks: Setup subscription update webhooks
□ Integration: Add feature gates throughout app
□ Testing: Test free → plus → premium flow
```

### matchingAlgorithm
```
✓ Service Created: src/lib/matchingAlgorithm.ts
✓ Logic: All scoring functions
✓ Dependencies: None (pure functions)
□ Integration: Use in Index.tsx and Discovery filter
□ Testing: Unit test scoring logic
□ Performance: Profile scoring time
```

### analytics
```
✓ Service Created: src/lib/analytics.ts
✓ Logic: Event batching and flushing
✓ Dependencies: Supabase auth
□ Integration: Add tracking to all pages/key events
□ Backend: Create /api/analytics endpoint
□ Testing: Check console for events, verify flush
□ Data Storage: Setup analytics storage (Mixpanel/Custom)
```

### realtime
```
✓ Service Created: src/lib/realtime.ts
✓ Logic: Supabase Realtime integration
✓ Dependencies: Supabase
□ Database: Enable realtime on messages table
□ Integration: Add to ChatPage
□ Testing: Test typing indicator, online status
□ Scaling: Monitor realtime connections
```

### aiVerification
```
✓ Service Created: src/lib/aiVerification.ts
✓ Logic: All verification functions
✓ Dependencies: External AI API
□ API Setup: Choose provider (AWS/Google/Custom)
□ Integration: Update AIVerification page
□ Testing: Test with various images
□ Configuration: Set API keys and endpoints
```

---

## Deployment Flow

```
Local Development
    │
    ├─ npm run dev
    ├─ Test all features
    └─ Check console for errors
    │
    ▼
GitHub / Version Control
    │
    ├─ Commit all new files
    ├─ Push to feature branch
    └─ Create Pull Request
    │
    ▼
Staging Deployment
    │
    ├─ Deploy to staging
    ├─ Run full QA
    ├─ Test all features
    ├─ Test API integrations
    └─ Performance test
    │
    ▼
Production Deployment
    │
    ├─ npm run build
    ├─ Deploy to Vercel/Netlify
    └─ Monitor errors & analytics
    │
    ▼
Post-Launch Monitoring
    │
    ├─ Check error rate
    ├─ Monitor analytics
    ├─ Gather user feedback
    └─ Plan improvements
```

---

**Last Updated:** January 2026  
**Status:** Complete and Ready for Integration
