export const SOCKET_EVENTS = {
  // Chat events
  NEW_MESSAGE: "new_message",
  MESSAGE_SEEN: "message_seen",
  MESSAGE_DELETED: "message_deleted",
  NEW_CONVERSATION: "new_conversation",
  SEND_MESSAGE: "send_message",
  MARK_SEEN: "mark_seen",
  DELETE_MESSAGE: "delete_message",

  // Friend events
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIEND_REQUEST_RECEIVED: "friend_request_received",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  FRIEND_REQUEST_REJECTED: "friend_request_rejected",
  FRIEND_REQUEST_CANCELED: "friend_request_canceled",
  FRIEND_REMOVED: "friend_removed",
  UNFRIENDED: "unfriended",
  USER_STATUS_CHANGED: "user_status_changed",

  // General events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  ERROR: "error",
} as const;
