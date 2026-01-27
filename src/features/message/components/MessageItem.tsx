import { Message } from "@/types/message";
import { User } from "@/types/user";
import Image from "next/image";
import { smartFormat } from "@/lib";
import { Loader2, Check, CheckCheck, Trash2, FileText, X } from "lucide-react";
import { memo, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDeleteMessage } from "@/features/message/hooks/useDeleteMessage";
import { SeenByAvatars } from "./SeenByAvatars";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MessageItemProps {
  isShowName?: boolean;
  message: Message;
  showAvatar: boolean;
  showTime: boolean;
  isSender: boolean;
  seenBy?: User[];
}

const MessageItem = memo(({ isShowName, message, showAvatar, showTime, isSender, seenBy }: MessageItemProps) => {
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const { mutate: deleteMessage } = useDeleteMessage(message.conversationId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Check if content is a raw image URL (basic check)
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url) || url.startsWith('https://res.cloudinary.com/') && (url.includes('/image/upload/') || url.match(/\.(jpg|png|webp)$/i));
  };

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return text.startsWith('http');
    } catch {
      return false;
    }
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <p className={cn(
          "italic text-sm opacity-60 py-1",
          isSender ? "text-white/80" : "text-muted-foreground"
        )}>
          Tin nhắn đã bị xóa
        </p>
      );
    }

    const renderImage = (src: string) => (
      <div className="relative overflow-hidden rounded-xl border border-white/20 shadow-sm group/image">
        <Image
          src={src}
          alt="Sent image"
          width={400}
          height={300}
          className="w-auto h-auto max-w-[300px] max-h-[300px] object-contain cursor-pointer transition-transform hover:scale-[1.02]"
          unoptimized
          onClick={() => setIsPreviewOpen(true)}
        />
      </div>
    );

    if (message.imgUrl) return renderImage(message.imgUrl);
    if (isImageUrl(message.content)) return renderImage(message.content);

    if (isUrl(message.content)) {
      const fileName = message.content.split('/').pop() || "Tệp đính kèm";
      return (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/file text-left min-w-[200px]"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden min-w-0 flex-1">
            <span className={cn("text-sm font-medium truncate", isSender ? "text-white/90" : "text-foreground")}>
              {decodeURIComponent(fileName)}
            </span>
            <span className={cn("text-[10px] flex items-center gap-1", isSender ? "text-white/60" : "text-muted-foreground")}>
              Nhấn để mở tệp
            </span>
          </div>
        </a>
      );
    }

    return (
      <p className={cn(
        "break-all whitespace-pre-wrap text-[15px] leading-relaxed font-normal text-left w-full",
        isSender ? "text-white" : "text-foreground"
      )}>
        {message.content}
      </p>
    );
  };

  const actions = (
    <div className={cn(
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200",
      isSender ? "mr-2 order-first" : "ml-2"
    )}>
      {isSender && !message.isDeleted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
              deleteMessage(message._id);
            }
          }}
          className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-destructive/10 hover:text-destructive shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  // Helper type guard
  const sender = typeof message.senderId === 'object' ? message.senderId : {
    _id: message.senderId,
    displayName: 'Không xác định',
    avatarUrl: undefined,
    username: 'Không xác định',
    email: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as User;

  return (
    <>
      {isSender ? (
        <div className="flex items-center self-end max-w-[85%] sm:max-w-[75%] group mb-1">
          {actions}
          <div className="flex flex-col items-end">
            <div className={cn(
              "px-4 py-2.5 rounded-[20px] rounded-tr-[4px] flex flex-col items-end shadow-lg transition-all hover:shadow-primary/30",
              message.isDeleted ? "bg-white/5 border border-white/10" : "bg-primary shadow-primary/20",
              (message.imgUrl || isImageUrl(message.content)) && "p-1 bg-transparent shadow-none hover:shadow-none"
            )}>
              <div className="w-full">
                {renderContent()}
              </div>
              {!message.isDeleted && !message.imgUrl && !isImageUrl(message.content) && (
                <div className="flex items-center gap-1 mt-1 opacity-80 transition-opacity">
                  <p className="text-[10px] font-medium text-white/90">{smartFormat(message.createdAt)}</p>
                  {seenBy && seenBy.length > 0 ? (
                    <CheckCheck className="w-3 h-3 text-white/90" />
                  ) : (
                    <Check className="w-3 h-3 text-white/90" />
                  )}
                </div>
              )}
            </div>
            <SeenByAvatars seenBy={seenBy} />
          </div>
        </div>
      ) : (
        <div className="flex items-end self-start max-w-[85%] sm:max-w-[75%] group mb-1">
          <div className="w-8 h-8 shrink-0 relative mr-3">
            {showAvatar && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 ring-1 ring-black/5 shadow-sm">
                {sender.avatarUrl ? (
                  <Image src={sender.avatarUrl} alt={sender.displayName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-[10px]">
                    {(sender.displayName || sender.username)?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col max-w-full">
            {isShowName && (
              <span className="text-[11px] font-medium text-muted-foreground/80 ml-1 mb-1">{sender.displayName || sender.username}</span>
            )}
            <div className="flex items-center">
              <div className={cn(
                "px-4 py-2.5 rounded-[20px] rounded-tl-[4px] bg-card text-card-foreground shadow-sm ring-1 ring-border",
                message.isDeleted && "opacity-80",
                (message.imgUrl || isImageUrl(message.content)) && "p-1 bg-transparent shadow-none border-0 ring-0 hover:bg-transparent"
              )}>
                <div className="w-full">
                  {renderContent()}
                </div>
                {showTime && !message.isDeleted && !message.imgUrl && !isImageUrl(message.content) && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{smartFormat(message.createdAt)}</p>
                )}
              </div>
              {actions}
            </div>
            <SeenByAvatars seenBy={seenBy} />
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-fit h-auto max-h-[95vh] p-0 bg-transparent border-0 shadow-none flex items-center justify-center outline-none" showClose={false}>
          <DialogTitle className="sr-only">Xem ảnh đầy đủ</DialogTitle>
          <div className="relative flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 z-50 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <img
              src={message.imgUrl || message.content}
              alt="Full preview"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

MessageItem.displayName = "MessageItem";
export default MessageItem;
