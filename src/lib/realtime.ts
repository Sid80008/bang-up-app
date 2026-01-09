/**
 * Real-time Features Service
 * Handles WebSocket connections and real-time updates using Supabase Realtime
 */

import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface OnlineUser {
  userId: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface TypingIndicator {
  userId: string;
  chatId: string;
  isTyping: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

class RealtimeService {
  private presenceChannel: RealtimeChannel | null = null;
  private messageChannels: Map<string, RealtimeChannel> = new Map();
  private typingChannels: Map<string, RealtimeChannel> = new Map();
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private callbacks: {
    onOnlineStatusChange?: (userId: string, isOnline: boolean) => void;
    onTyping?: (indicator: TypingIndicator) => void;
    onMessageReceived?: (message: Message) => void;
    onUserTyping?: (userId: string, chatId: string) => void;
  } = {};

  /**
   * Initialize real-time connections
   */
  public async initialize(userId: string): Promise<void> {
    try {
      // Set up presence channel for online status
      this.presenceChannel = supabase.channel(
        `presence-${userId}`,
        {
          config: {
            presence: {
              key: userId,
            },
          },
        }
      );

      // Subscribe to presence updates
      this.presenceChannel
        .on("presence", { event: "sync" }, () => {
          this.handlePresenceSync();
        })
        .on("presence", { event: "join" }, (payload) => {
          this.handleUserJoined(payload);
        })
        .on("presence", { event: "leave" }, (payload) => {
          this.handleUserLeft(payload);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            this.presenceChannel?.track({
              userId,
              isOnline: true,
              lastSeen: new Date().toISOString(),
            });
          }
        });
    } catch (error) {
      console.error("[RealtimeService] Error initializing:", error);
    }
  }

  /**
   * Subscribe to chat messages in real-time
   */
  public subscribeToChat(
    chatId: string,
    onMessage: (message: Message) => void
  ): void {
    try {
      let channel = this.messageChannels.get(chatId);

      if (!channel) {
        channel = supabase.channel(`chat:${chatId}`);

        channel
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
              const message: Message = {
                id: payload.new.id,
                chatId: payload.new.chat_id,
                senderId: payload.new.sender_id,
                content: payload.new.content,
                createdAt: payload.new.created_at,
                isRead: payload.new.is_read,
              };
              onMessage(message);
              this.callbacks.onMessageReceived?.(message);
            }
          )
          .subscribe();

        this.messageChannels.set(chatId, channel);
      }
    } catch (error) {
      console.error("[RealtimeService] Error subscribing to chat:", error);
    }
  }

  /**
   * Subscribe to typing indicators
   */
  public subscribeToTyping(
    chatId: string,
    onTyping: (indicator: TypingIndicator) => void
  ): void {
    try {
      let channel = this.typingChannels.get(chatId);

      if (!channel) {
        channel = supabase.channel(`typing:${chatId}`);

        channel
          .on("broadcast", { event: "typing" }, (payload) => {
            const indicator: TypingIndicator = payload.payload;
            onTyping(indicator);
            this.callbacks.onUserTyping?.(indicator.userId, chatId);
          })
          .subscribe();

        this.typingChannels.set(chatId, channel);
      }
    } catch (error) {
      console.error("[RealtimeService] Error subscribing to typing:", error);
    }
  }

  /**
   * Broadcast typing indicator
   */
  public async broadcastTyping(
    userId: string,
    chatId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const channel = supabase.channel(`typing:${chatId}`);

      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId,
          chatId,
          isTyping,
        },
      });
    } catch (error) {
      console.error("[RealtimeService] Error broadcasting typing:", error);
    }
  }

  /**
   * Update user online status
   */
  public async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      if (this.presenceChannel) {
        await this.presenceChannel.track({
          userId,
          isOnline,
          lastSeen: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("[RealtimeService] Error updating online status:", error);
    }
  }

  /**
   * Get online users
   */
  public getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    const user = this.onlineUsers.get(userId);
    return user?.isOnline ?? false;
  }

  /**
   * Unsubscribe from chat
   */
  public unsubscribeFromChat(chatId: string): void {
    try {
      const channel = this.messageChannels.get(chatId);
      if (channel) {
        supabase.removeChannel(channel);
        this.messageChannels.delete(chatId);
      }
    } catch (error) {
      console.error("[RealtimeService] Error unsubscribing from chat:", error);
    }
  }

  /**
   * Unsubscribe from typing
   */
  public unsubscribeFromTyping(chatId: string): void {
    try {
      const channel = this.typingChannels.get(chatId);
      if (channel) {
        supabase.removeChannel(channel);
        this.typingChannels.delete(chatId);
      }
    } catch (error) {
      console.error("[RealtimeService] Error unsubscribing from typing:", error);
    }
  }

  /**
   * Clean up all connections
   */
  public disconnect(): void {
    try {
      if (this.presenceChannel) {
        supabase.removeChannel(this.presenceChannel);
        this.presenceChannel = null;
      }

      this.messageChannels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      this.messageChannels.clear();

      this.typingChannels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      this.typingChannels.clear();

      this.onlineUsers.clear();
    } catch (error) {
      console.error("[RealtimeService] Error disconnecting:", error);
    }
  }

  /**
   * Set callback for online status changes
   */
  public onOnlineStatusChange(
    callback: (userId: string, isOnline: boolean) => void
  ): void {
    this.callbacks.onOnlineStatusChange = callback;
  }

  /**
   * Set callback for typing indicators
   */
  public onTypingUpdate(
    callback: (userId: string, chatId: string) => void
  ): void {
    this.callbacks.onUserTyping = callback;
  }

  /**
   * Handle presence sync
   */
  private handlePresenceSync(): void {
    if (!this.presenceChannel) return;

    const state = this.presenceChannel.presenceState();
    for (const [, users] of Object.entries(state)) {
      for (const user of users as any[]) {
        if (user.userId) {
          this.onlineUsers.set(user.userId, {
            userId: user.userId,
            lastSeen: user.lastSeen,
            isOnline: user.isOnline,
          });
        }
      }
    }
  }

  /**
   * Handle user joined
   */
  private handleUserJoined(payload: any): void {
    const user = payload.newPresences?.[0];
    if (user?.userId) {
      this.onlineUsers.set(user.userId, {
        userId: user.userId,
        lastSeen: user.lastSeen,
        isOnline: true,
      });
      this.callbacks.onOnlineStatusChange?.(user.userId, true);
    }
  }

  /**
   * Handle user left
   */
  private handleUserLeft(payload: any): void {
    const user = payload.leftPresences?.[0];
    if (user?.userId) {
      this.onlineUsers.delete(user.userId);
      this.callbacks.onOnlineStatusChange?.(user.userId, false);
    }
  }
}

export const realtimeService = new RealtimeService();
