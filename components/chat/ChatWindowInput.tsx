"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";
import { useSendMessage } from "@/hooks/chat/useSendMessage";
import { SendMessage } from "@/types/message";

interface ChatWindowInputProps {
  conversationId: string;
}

export default function ChatWindowInput({ conversationId }: ChatWindowInputProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId);

  const handleSend = () => {
    if (!content.trim() || isPending) return;

    const messageData: SendMessage = {
      conversationId,
      type: "text",
      content: content.trim(),
    };

    sendMessage(messageData);

    setContent("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
        />

        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Smile className="h-5 w-5" />
        </Button>

        <Button
          onClick={handleSend}
          size="icon"
          className="flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

