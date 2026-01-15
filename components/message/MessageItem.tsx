import { Message } from "@/types/message";
import { User } from "@/types/user";
import Image from "next/image";
import { smartFormat } from "@/lib";
import { Loader2, Check, CheckCheck, X } from "lucide-react";
import { memo } from "react";

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

const MessageItem = memo(({ isShowName, message, showAvatar, showTime, isSender, seenBy }: MessageItemProps) => {
  return isSender ? (
    <div className="flex flex-col items-end self-end " >
      <div className="p-2 rounded-lg flex flex-col items-end bg-gradient-to-br from-primary to-primary/90 text-primary-foreground max-w-[70%] shadow-sm">
        <p className="text-right break-words whitespace-pre-wrap w-full ">
          {message.content}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-[10px] text-primary-foreground/70">{smartFormat(message.createdAt)}</p>
          <div className="opacity-70">
            <StatusIcon status={message.status} />
          </div>
        </div>
      </div>
      <SeenByAvatars seenBy={seenBy} />
    </div>
  ) : (
    <div className="flex flex-col items-start self-start max-w-[70%]">
      <div className="flex items-end gap-2 w-full">
        {showAvatar ? (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted relative mb-1 shrink-0">
            {message.senderId.avatar ? (
              <Image
                src={message.senderId.avatar}
                alt={message.senderId.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted ">
                <span className="text-xs font-bold">
                  {message.senderId.username?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 shrink-0" /> // Spacer
        )}

        <div className="flex flex-col max-w-[70%]">
          {isShowName && (
            <span className="text-xs font-semibold text-primary truncate">{message.senderId.username}</span>
          )}
          <div className="p-2 rounded-lg bg-secondary text-secondary-foreground shadow-sm">
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
            {showTime && (
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{smartFormat(message.createdAt)}</p>
            )}
          </div>
        </div>
      </div>

      {seenBy && seenBy.length > 0 && (
        <div className="ml-10">
          <SeenByAvatars seenBy={seenBy} />
        </div>
      )}
    </div>
  );
});

MessageItem.displayName = "MessageItem";
export default MessageItem;
