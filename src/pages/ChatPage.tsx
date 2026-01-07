"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { toast } from "sonner";

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface OtherUserProfile {
  id: string;
  name?: string;
  age?: number;
  bio?: string;
  photo_url?: string;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<OtherUserProfile | null>(null);
  const [isVisibilityApproved, setIsVisibilityApproved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserAndChatDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (!chatId || !user) {
        setLoading(false);
        return;
      }

      // Fetch chat details to check visibility_approved status and other user's ID
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*, user1:user1_id(id), user2:user2_id(id)")
        .eq("id", chatId)
        .single();

      if (chatError) {
        console.error("[ChatPage] Error fetching chat details:", chatError);
        setError("Failed to load chat details.");
        setLoading(false);
        return;
      }

      setIsVisibilityApproved(chatData.visibility_approved);
      const otherUserId = chatData.user1.id === user.id ? chatData.user2.id : chatData.user1.id;

      if (chatData.visibility_approved) {
        // Fetch full profile if visibility is approved
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, age, bio, photo_url")
          .eq("id", otherUserId)
          .single();

        if (profileError) {
          console.error("[ChatPage] Error fetching other user profile:", profileError);
          // Continue without full profile if error
        } else {
          setOtherUserProfile(profileData);
        }
      }
    };
    fetchUserAndChatDetails();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[ChatPage] Error fetching messages:", error);
        setError("Failed to load messages.");
        toast.error("Failed to load messages.");
      } else {
        setMessages(data || []);
        setError(null);
      }
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log("[ChatPage] New message received:", payload.new);
          setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!chatId || !currentUserId) {
      toast.error("You must be logged in to send messages.");
      return;
    }

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      content,
    });

    if (error) {
      console.error("[ChatPage] Error sending message:", error);
      toast.error("Failed to send message.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate("/matches")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Matches
        </Button>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-500 mb-4">Chat ID not found.</p>
        <Button onClick={() => navigate("/matches")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Matches
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950">
      <Card className="flex flex-col flex-grow rounded-none border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-background">
          <Button variant="ghost" onClick={() => navigate("/matches")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <CardTitle className="text-xl font-bold flex items-center">
            {isVisibilityApproved && otherUserProfile?.photo_url ? (
              <img src={otherUserProfile.photo_url} alt="Profile" className="w-8 h-8 rounded-full object-cover mr-2" />
            ) : (
              <User className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 p-1 mr-2" />
            )}
            {isVisibilityApproved && otherUserProfile?.name
              ? otherUserProfile.name
              : `Chat with Match ${chatId.substring(0, 8)}...`}
          </CardTitle>
          <div className="w-16"></div>
        </CardHeader>
        <CardContent className="flex-grow p-4 overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  content={msg.content}
                  isCurrentUser={msg.sender_id === currentUserId}
                  timestamp={msg.created_at}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <ChatInput onSendMessage={handleSendMessage} disabled={!currentUserId} />
      </Card>
    </div>
  );
};

export default ChatPage;