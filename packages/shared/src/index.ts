export const UserStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatType = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const;

export type ChatType = typeof ChatType[keyof typeof ChatType];

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatRole = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type ChatRole = typeof ChatRole[keyof typeof ChatRole];

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: ChatRole;
  joinedAt: Date;
}

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  SEEN: 'seen',
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: Date;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

export const FriendStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;

export type FriendStatus = typeof FriendStatus[keyof typeof FriendStatus];

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  refId: string;
  isRead: boolean;
  createdAt: Date;
}

// Standardized API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// Standardized Socket Events
export const SocketEvents = {
  // Chat Room
  JOIN_CHAT: 'join-chat',
  LEAVE_CHAT: 'leave-chat',

  // Messaging (Real-time)
  NEW_MESSAGE: 'new-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  
  // Message Status
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_SEEN: 'message-seen',
  
  // Presence
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  PRESENCE_UPDATE: 'presence-update',
} as const;

export type SocketEvents = typeof SocketEvents[keyof typeof SocketEvents];

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (code: string, message: string): ApiResponse<null> => ({
  success: false,
  data: null,
  error: { code, message },
});
