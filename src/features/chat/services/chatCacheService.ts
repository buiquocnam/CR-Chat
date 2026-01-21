import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { Message, MessageResponse } from "@/types/message";
import { Conversation, ConversationResponse } from "@/types/conversation";
import { User } from "@/types/user";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { 
  prependInfiniteCacheItem, 
  updateInfiniteCacheItem, 
  moveInfiniteCacheItemToTop 
} from "@/lib/query-utils";


export class ChatCacheService {
  constructor(private queryClient: QueryClient, private currentUserId?: string) {}
  
   handleNewMessage(data: { message: Message, unreadCounts: Record<string, number> }, activeConversationId?: string) {
     const { message } = data;
     // 1. Update Conversation List
     this.updateConversationListOnMessage(data);

     // 2. Update Message List if it matches the active conversation
     if (activeConversationId === message.conversationId) {
         this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
       [QUERY_KEYS.MESSAGES, message.conversationId],
       (oldData) => prependInfiniteCacheItem<Message, MessageResponse>(oldData, { ...message })
     );
     }
   }

  /**
   * Updates or pushes a conversation to the top of the list when a new message arrives.
   */
  private updateConversationListOnMessage(data: { message: Message, unreadCounts: Record<string, number> }) {
    const { message, unreadCounts } = data;
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => {
        if (!oldData) {
          this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
          return oldData;
        }

        let targetConversation: Conversation | undefined;
        for (const page of oldData.pages) {
          targetConversation = page.data.find(c => c._id === message.conversationId);
          if (targetConversation) break;
        }

        if (targetConversation) {
          // Handle senderId being string or object
          const senderIdStr = typeof message.senderId === 'string' 
            ? message.senderId 
            : (message.senderId as User)?._id;
            
          const isMe = senderIdStr === this.currentUserId;
          
          // Use unreadCounts from backend event directly
          const newUnreadCounts = unreadCounts;
          
          if (this.currentUserId) {
            // Optimistic update for my own count (should be 0 because I read it if I am in it)
            // But relying on backend is safer usually.
            // If I am sender, backend sets it to 0. 
            // If I am receiver, backend increments it.
          }

          // Ensure senderId is User before assigning to lastMessage
          const sender = typeof message.senderId === 'string'
              ? { _id: message.senderId } as User 
              : message.senderId as User;

          const lastMessageWithUser = { ...message, senderId: sender };

          const updatedConversation: Conversation = {
            ...targetConversation,
            lastMessage: lastMessageWithUser,
            unreadCounts: newUnreadCounts,
            // messageHelper sets seenBy: []
            seenBy: [], 
            updatedAt: new Date().toISOString()
          };
          return moveInfiniteCacheItemToTop(oldData, message.conversationId, updatedConversation);
        } else {
          // If conversation isn't in cache, invalidate to refetch the updated list
          this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
          return oldData;
        }
      }
    );

    // 2. Update Single Conversation Cache (if active/cached)
    this.queryClient.setQueryData<Conversation>(
      [QUERY_KEYS.CONVERSATIONS, message.conversationId],
      (oldConv) => {
        if (!oldConv) {
           // If we don't have the conversation details cached, we might want to invalidate it or let it fetch naturally
           this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS, message.conversationId] });
           return oldConv;
        }

        // Logic to update unread counts (using backend provided counts)
        const unreadCounts = data.unreadCounts;
        
        // Ensure senderId is User object
         const sender = typeof message.senderId === 'string'
              ? { _id: message.senderId } as User 
              : message.senderId as User;

        const lastMessageWithUser = { ...message, senderId: sender };

        return {
           ...oldConv,
           lastMessage: lastMessageWithUser,
           unreadCounts: unreadCounts,
           seenBy: [],
           updatedAt: new Date().toISOString()
        };
      }
    );
  }


  /**
   * Updates unread count and message statuses when a conversation is marked as seen.
   */
  handleMessageSeen(data: { conversationId: string; userId: string; messageId: string }) {
    // 1. Update unread counts and seenBy list
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => updateInfiniteCacheItem<Conversation, ConversationResponse>(oldData, data.conversationId, (c) => {
         const newConversation = { ...c };
         
         if (data.userId === this.currentUserId) {
            const newUnreadCounts = { ...c.unreadCounts };
            newUnreadCounts[this.currentUserId] = 0;
            newConversation.unreadCounts = newUnreadCounts;
         }

         const currentSeenBy = c.seenBy || [];
         const alreadySeen = currentSeenBy.some(u => {
             const id = typeof u === 'string' ? u : u._id;
             return String(id) === String(data.userId);
         });
         
         if (!alreadySeen) {
             // Find user in participants
             const participant = c.participants?.find(p => String(p._id) === String(data.userId));
             
             if (participant) {
                 const userToAdd = {
                     _id: participant._id,
                     displayName: participant.displayName,
                     avatarUrl: participant.avatarUrl || undefined,
                     username: "", 
                     email: "",
                     createdAt: "",
                     updatedAt: ""
                 } as unknown as User;

                 newConversation.seenBy = [...currentSeenBy, userToAdd];
             } else {
                 const userFallback = { _id: data.userId } as unknown as User;
                 newConversation.seenBy = [...currentSeenBy, userFallback];
             }
         }
         
         return newConversation;
       })
     );

     // 2. Update Single Conversation Cache (if active)
     this.queryClient.setQueryData<Conversation>(
         [QUERY_KEYS.CONVERSATIONS, data.conversationId],
         (oldConv) => {
             if (!oldConv) return oldConv;
             
             const newConv = { ...oldConv };

             if (data.userId === this.currentUserId) {
                 const newUnreadCounts = { ...newConv.unreadCounts };
                 newUnreadCounts[this.currentUserId] = 0;
                 newConv.unreadCounts = newUnreadCounts; 
             }

             const currentSeenBy = newConv.seenBy || [];
             const alreadySeen = currentSeenBy.some(u => {
                 const id = typeof u === 'string' ? u : u._id;
                 return String(id) === String(data.userId);
             });

             if (!alreadySeen) {
                  // Try to find user in participants
                  const participant = newConv.participants.find(p => String(p._id) === String(data.userId));
                  
                  if (participant) {
                      const userToAdd = {
                          _id: participant._id,
                          displayName: participant.displayName,
                          avatarUrl: participant.avatarUrl || undefined,
                          username: "",
                          email: "",
                          createdAt: "",
                          updatedAt: ""
                      } as unknown as User;
                      newConv.seenBy = [...currentSeenBy, userToAdd];
                  } else {
                       // Fallback
                       newConv.seenBy = [...currentSeenBy, { _id: data.userId } as unknown as User];
                  }
             }

             return newConv;
         }
     );
  }


  handleMessageDeleted(data: { conversationId: string; messageId: string }) {
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => updateInfiniteCacheItem<Conversation, ConversationResponse>(oldData, data.conversationId, (c) => {
        if (c.lastMessage?._id === data.messageId) {
          return { ...c, lastMessage: { ...c.lastMessage, isDeleted: true } }; // Ensure isDeleted is on lastMessage type if needed, or just re-fetch
        }
        return c;
      })
    );

    // Update message list
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, data.conversationId],
      (oldData) => updateInfiniteCacheItem<Message, MessageResponse>(oldData, data.messageId, (msg) => ({
        ...msg,
        isDeleted: true
      }))
    );
  }

  /**
   * Optimistically adds a message to the cache.
   */
  optimisticMessageAdd(conversationId: string, message: Message) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => prependInfiniteCacheItem<Message, MessageResponse>(old, message)
    );
  }

  
  optimisticMessageError(conversationId: string, tempId: string) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => {
          if (!old) return old;
          return {
              ...old,
              pages: old.pages.map(page => ({
                  ...page,
                  data: page.data.filter(m => m._id !== tempId)
              }))
          };
      }
    );
  }

  optimisticMessageSuccess(conversationId: string, tempId: string, realMessage: Message) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => updateInfiniteCacheItem<Message, MessageResponse>(old, tempId, (msg) => ({
        ...realMessage
      }))
    );
  }


  handleNewConversation(conversation: Conversation) {
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => prependInfiniteCacheItem(oldData, conversation)
    );
  }
}
