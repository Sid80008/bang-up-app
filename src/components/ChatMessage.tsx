"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isCurrentUser,
  timestamp,
}) => {
  return (
    <div
      className={cn(
        "flex w-full mb-2",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-lg shadow-md",
          isCurrentUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
        )}
      >
        <p className="text-sm break-words">{content}</p>
        <span
          className={cn(
            "block text-xs mt-1",
            isCurrentUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          )}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;