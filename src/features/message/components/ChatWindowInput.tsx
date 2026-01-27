"use client";

import { useRouter } from "next/navigation";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { useSendMessage } from "@/features/message/hooks/useSendMessage";
import { SendMessage } from "@/types/message";
import { useChatStore } from "@/stores/useChatStore";
import { uploadService } from "@/features/upload/services/uploadService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CustomEmojiPicker from "./EmojiPicker";
import { cn } from "@/lib/utils";

interface ChatWindowInputProps {
  conversationId?: string;
  receiverId?: string;
  onMessageSent?: (conversationId: string) => void;
}

export default function ChatWindowInput({ conversationId, receiverId, onMessageSent }: ChatWindowInputProps) {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId);
  const { replyingTo, clearReplyingTo } = useChatStore();

  const handleSend = () => {
    if (!content.trim() || isPending || isUploading) return;

    const messageData: SendMessage = {
      conversationId,
      recipientId: receiverId, // Pass receiverId if present (and no conversationId)
      content: content.trim(),
    };

    sendMessage(messageData, {
      onSuccess: (data: any) => {
        if (data.conversationId && onMessageSent) {
          onMessageSent(data.conversationId);
        }
        // If we were in "new chat" mode (no conversationId), redirect to the new conversation
        if (!conversationId && data.message?.conversationId) {
          router.push(`/${data.message.conversationId}`);
        }
      }
    });

    setContent("");
    inputRef.current?.focus();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadService.uploadFile(file);

      sendMessage({
        conversationId,
        recipientId: receiverId,
        content: result.url,
        imgUrl: result.resourceType === "image" ? result.url : undefined
      }, {
        onSuccess: (data: any) => {
          if (data.conversationId && onMessageSent) {
            onMessageSent(data.conversationId);
          }
        }
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Tải tệp thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setContent(prev => prev + emoji);
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = content;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = before + emoji + after;
    setContent(newContent);

    // Set cursor position after emoji
    setTimeout(() => {
      input.focus();
      const newPos = start + emoji.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-transparent pb-6 sticky bottom-0 z-30 w-full max-w-5xl mx-auto">
      {replyingTo && (
        <div className="mb-2 mx-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-3 flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-primary truncate">
                Đang trả lời {(replyingTo.senderId as any).displayName || (replyingTo.senderId as any).username || "Không xác định"}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {replyingTo.imgUrl ? "Hình ảnh" : replyingTo.content}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 text-muted-foreground hover:bg-black/5"
            onClick={clearReplyingTo}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-2 pr-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex items-center gap-3 ring-1 ring-white/40 transition-all focus-within:ring-primary/20 focus-within:bg-white/80 focus-within:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.1)]">
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/*,text/*"
        />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 text-muted-foreground hover:bg-white/50 hover:text-primary transition-all duration-300 relative"
          onClick={handleFileClick}
          disabled={isUploading || isPending}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>

        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isUploading ? "Đang tải lên tệp..." : "Nhập tin nhắn..."}
          disabled={isUploading}
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-base py-7 text-foreground font-medium"
        />

        <div className="flex items-center gap-1">
          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full w-10 h-10 text-muted-foreground hover:bg-white/50 hover:text-primary transition-all duration-300",
                  isEmojiOpen && "text-primary bg-white/50"
                )}
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              className="p-0 border-none bg-transparent shadow-none w-[350px] mb-4"
              sideOffset={15}
            >
              <CustomEmojiPicker onEmojiSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleSend}
            size="icon"
            disabled={!content.trim() || isPending || isUploading}
            className="rounded-full w-12 h-12 shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 border-t border-white/20 transition-all hover:scale-110 active:scale-95 ml-1 disabled:opacity-50 disabled:scale-100"
          >
            <Send className="h-5 w-5 text-primary-foreground ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

