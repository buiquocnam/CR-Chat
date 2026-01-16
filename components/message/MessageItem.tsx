import { Message } from "@/types/message";
import { User } from "@/types/user";
import Image from "next/image";
import { smartFormat } from "@/lib";
import { Loader2, Check, CheckCheck, X, Reply, FileText, Download, Trash2 } from "lucide-react";
import { memo, useMemo } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDeleteMessage } from "@/hooks/message/useDeleteMessage";

interface MessageItemProps {
  isShowName?: boolean;
  message: Message;
  showAvatar: boolean;
  showTime: boolean;
  isSender: boolean;
  seenBy?: User[];
}

const StatusIcon = memo(({ status }: { status?: Message["status"] }) => {
  if (!status) return null;

  switch (status) {
    case "sending":
      return <Loader2 className="w-3 h-3 animate-spin text-white" />;
    case "sent":
      return <Check className="w-3 h-3 text-white" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3 text-white" />;
    case "read":
      return <CheckCheck className="w-3 h-3 text-white" />;
    case "failed":
      return <X className="w-3 h-3 text-destructive" />;
    default:
      return null;
  }
});
StatusIcon.displayName = "StatusIcon";

const SeenByAvatars = memo(({ seenBy }: { seenBy?: User[] }) => {
  if (!seenBy || seenBy.length === 0) return null;

  const displayUsers = seenBy.slice(0, 3);
  const remaining = seenBy.length - 3;

  return (
    <div className="flex items-center -space-x-2 mt-1 justify-end">
      {displayUsers.map((user) => (
        <div key={user._id} className="w-4 h-4 rounded-full border border-background relative overflow-hidden" title={user.username}>
          {user.avatar ? (
            <Image src={user.avatar} alt={user.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-[8px] font-bold">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-4 h-4 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] font-medium z-10">
          +{remaining}
        </div>
      )}
    </div>
  );
});
SeenByAvatars.displayName = "SeenByAvatars";

SeenByAvatars.displayName = "SeenByAvatars";

const ReplyPreview = memo(({ replyTo, isSender }: { replyTo: Message["replyTo"]; isSender: boolean }) => {
  if (!replyTo) return null;

  return (
    <div className={cn(
      "mb-1 flex max-w-full overflow-hidden rounded-lg border-l-4 bg-black/5 p-2 transition-colors hover:bg-black/10",
      isSender ? "border-white/50 bg-white/10" : "border-primary/50"
    )}>
      <div className="flex flex-col overflow-hidden text-left">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isSender ? "text-white/90" : "text-primary"
        )}>
          {replyTo.senderId.username}
        </span>
        <span className={cn(
          "truncate text-xs",
          isSender ? "text-white/70" : "text-muted-foreground"
        )}>
          {replyTo.isDeleted ? "Tin nhắn đã bị xóa" : (replyTo.type === "text" ? replyTo.content : `[${replyTo.type}]`)}
        </span>
      </div>
    </div>
  );
});
ReplyPreview.displayName = "ReplyPreview";

const MessageItem = memo(({ isShowName, message, showAvatar, showTime, isSender, seenBy }: MessageItemProps) => {
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const { mutate: deleteMessage } = useDeleteMessage(message.conversationId);

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

    if (message.type === "image") {
      return (
        <div className="relative aspect-auto max-w-full overflow-hidden rounded-xl border border-white/20 shadow-sm">
          <Image
            src={message.content}
            alt="Sent image"
            width={400}
            height={300}
            className="h-auto w-full object-contain cursor-pointer transition-transform hover:scale-[1.02]"
            unoptimized // Cloudinary images
          />
        </div>
      );
    }

    if (message.type === "file") {
      return (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border",
          isSender ? "bg-white/10 border-white/20" : "bg-black/5 border-black/5"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isSender ? "bg-white/20" : "bg-primary/10"
          )}>
            <FileText className={cn("w-5 h-5", isSender ? "text-white" : "text-primary")} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className={cn("text-xs font-medium truncate max-w-[150px]", isSender ? "text-white" : "text-foreground")}>
              {message.content.split('/').pop() || 'file'}
            </span>
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-[10px] flex items-center gap-1 hover:underline", isSender ? "text-white/70" : "text-primary")}
            >
              <Download className="w-3 h-3" /> Download
            </a>
          </div>
        </div>
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setReplyingTo(message)}
        className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 shadow-sm"
        disabled={message.isDeleted}
      >
        <Reply className="h-4 w-4 text-muted-foreground" />
      </Button>
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

  return isSender ? (
    <div className="flex items-center self-end max-w-[85%] sm:max-w-[75%] group mb-1">
      {actions}
      <div className="flex flex-col items-end">
        <div className={cn(
          "px-4 py-2.5 rounded-[20px] rounded-tr-[4px] flex flex-col items-end shadow-lg transition-all hover:shadow-primary/30",
          message.isDeleted ? "bg-white/5 border border-white/10" : "bg-primary shadow-primary/20"
        )}>
          <ReplyPreview replyTo={message.replyTo} isSender={true} />
          <div className="w-full">
            {renderContent()}
          </div>
          {!message.isDeleted && (
            <div className="flex items-center gap-1 mt-1 opacity-80 transition-opacity">
              <p className="text-[10px] font-medium text-white/90">{smartFormat(message.createdAt)}</p>
              <StatusIcon status={message.status} />
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
            {message.senderId.avatar ? (
              <Image src={message.senderId.avatar} alt={message.senderId.username} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-[10px]">
                {message.senderId.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col max-w-full">
        {isShowName && (
          <span className="text-[11px] font-medium text-muted-foreground/80 ml-1 mb-1">{message.senderId.username}</span>
        )}
        <div className="flex items-center">
          <div className={cn(
            "px-4 py-2.5 rounded-[20px] rounded-tl-[4px] bg-white/90 backdrop-blur-md text-foreground shadow-sm ring-1 ring-black/5",
            message.isDeleted && "opacity-80"
          )}>
            <ReplyPreview replyTo={message.replyTo} isSender={false} />
            <div className="w-full">
              {renderContent()}
            </div>
            {showTime && !message.isDeleted && (
              <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{smartFormat(message.createdAt)}</p>
            )}
          </div>
          {actions}
        </div>
        {seenBy && seenBy.length > 0 && <SeenByAvatars seenBy={seenBy} />}
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
export default MessageItem;
