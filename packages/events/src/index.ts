export const EventSubjects = {
  // Auth Events
  AUTH_REGISTERED: "auth.registered",
  AUTH_LOGGED_IN: "auth.logged_in",
  AUTH_LOGGED_OUT: "auth.logged_out",

  // User Events
  USER_UPDATED: "user.updated",
  USER_ONLINE: "user.online",
  USER_OFFLINE: "user.offline",
  USER_PRESENCE_CHANGED: "user.presence_changed",

  // Chat Events
  CHAT_CREATED: "chat.created",
  CHAT_UPDATED: "chat.updated",
  CHAT_MEMBER_JOINED: "chat.member_joined",
  CHAT_MEMBER_LEFT: "chat.member_left",

  // Message Events
  MESSAGE_CREATED: "message.created",
  MESSAGE_DELIVERED: "message.delivered",
  MESSAGE_SEEN: "message.seen",
  MESSAGE_DELETED: "message.deleted",

  // Friend Events
  FRIEND_REQUEST_SENT: "friend.request_sent",
  FRIEND_REQUEST_ACCEPTED: "friend.request_accepted",
  FRIEND_REQUEST_REJECTED: "friend.request_rejected",
  FRIEND_BLOCKED: "friend.blocked",

  // Notification Events
  NOTIFICATION_CREATED: "notification.created",
} as const;

export type EventSubject = keyof typeof EventSubjects;
