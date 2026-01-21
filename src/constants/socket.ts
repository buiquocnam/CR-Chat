export const SOCKET_EVENTS = {
  // Chat Actions (Client -> Server)
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  MARK_SEEN: "seen_message",
  CREATE_CONVERSATION: "create_conversation",

  // Chat Events (Server -> Client)
  NEW_MESSAGE: "new_message",
  MESSAGE_SEEN: "conversation_seen",
  MESSAGE_DELETED: "message_deleted", 
  NEW_CONVERSATION: "new_conversation",

  // Friend Actions (Client -> Server)
  SEND_FRIEND_REQUEST: "send_friend_request",
  ACCEPT_FRIEND_REQUEST: "accept_friend_request",
  CANCEL_FRIEND_REQUEST: "cancel_friend_request",
  UNFRIEND: "unfriend",

  // Friend Events (Server -> Client)
  FRIEND_REQUEST_RECEIVED: "new_friend_request",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  FRIEND_REQUEST_REJECTED: "friend_request_rejected",
  FRIEND_REQUEST_CANCELED: "friend_request_canceled",
  UNFRIENDED: "unfriended",

  // General Events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  ERROR: "error",
} as const;
