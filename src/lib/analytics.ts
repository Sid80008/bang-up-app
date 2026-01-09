/**
 * Analytics Service
 * Tracks user events and behaviors for analytics and insights
 */

export type EventType =
  | "page_view"
  | "profile_view"
  | "profile_created"
  | "profile_updated"
  | "user_liked"
  | "user_passed"
  | "match_confirmed"
  | "message_sent"
  | "chat_opened"
  | "user_blocked"
  | "user_reported"
  | "ai_verification_submitted"
  | "ai_verification_completed"
  | "premium_tier_upgraded"
  | "settings_changed";

export interface AnalyticsEvent {
  eventType: EventType;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly MAX_BATCH_SIZE = 50;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
  }

  /**
   * Track an analytics event
   */
  public track(
    eventType: EventType,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      eventType,
      userId,
      timestamp: new Date().toISOString(),
      metadata,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Auto-flush if batch reaches max size
    if (this.events.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${eventType}:`, { userId, metadata });
    }
  }

  /**
   * Track page view
   */
  public trackPageView(userId: string, pathname: string): void {
    this.track("page_view", userId, { pathname });
  }

  /**
   * Track profile interaction
   */
  public trackProfileView(userId: string, viewedUserId: string): void {
    this.track("profile_view", userId, { viewedUserId });
  }

  /**
   * Track like action
   */
  public trackLike(userId: string, likedUserId: string): void {
    this.track("user_liked", userId, { likedUserId });
  }

  /**
   * Track pass action
   */
  public trackPass(userId: string, passedUserId: string): void {
    this.track("user_passed", userId, { passedUserId });
  }

  /**
   * Track match confirmation
   */
  public trackMatchConfirmed(userId: string, matchedUserId: string): void {
    this.track("match_confirmed", userId, { matchedUserId });
  }

  /**
   * Track message sent
   */
  public trackMessageSent(userId: string, chatId: string, messageLength: number): void {
    this.track("message_sent", userId, {
      chatId,
      messageLength,
    });
  }

  /**
   * Track chat opened
   */
  public trackChatOpened(userId: string, chatId: string): void {
    this.track("chat_opened", userId, { chatId });
  }

  /**
   * Track user block
   */
  public trackBlockUser(userId: string, blockedUserId: string, reason: string): void {
    this.track("user_blocked", userId, {
      blockedUserId,
      reason,
    });
  }

  /**
   * Track user report
   */
  public trackReportUser(userId: string, reportedUserId: string, reason: string): void {
    this.track("user_reported", userId, {
      reportedUserId,
      reason,
    });
  }

  /**
   * Track AI verification submission
   */
  public trackAIVerificationSubmitted(userId: string): void {
    this.track("ai_verification_submitted", userId);
  }

  /**
   * Track AI verification completion
   */
  public trackAIVerificationCompleted(
    userId: string,
    verified: boolean,
    confidence?: number
  ): void {
    this.track("ai_verification_completed", userId, {
      verified,
      confidence,
    });
  }

  /**
   * Track premium upgrade
   */
  public trackPremiumUpgrade(userId: string, tier: string): void {
    this.track("premium_tier_upgraded", userId, { tier });
  }

  /**
   * Track settings change
   */
  public trackSettingsChanged(userId: string, settingName: string): void {
    this.track("settings_changed", userId, { settingName });
  }

  /**
   * Flush events to backend
   */
  public async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Send to your analytics backend
      // Example: POST to /api/analytics
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: eventsToSend,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // If fetch fails (e.g., offline), re-queue events
        this.events = [...eventsToSend, ...this.events];
      });

      if (response && !response.ok) {
        // Re-queue on failure
        this.events = [...eventsToSend, ...this.events];
      }
    } catch (error) {
      console.error("[Analytics] Error flushing events:", error);
      // Re-queue events on error
      this.events = [...eventsToSend, ...this.events];
    }
  }

  /**
   * Manual force flush before page unload
   */
  public forceFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }

  /**
   * Start automatic flush interval
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.forceFlush());
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get pending events (for testing)
   */
  public getPendingEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in React components
export default analyticsService;
