export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away'
}

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

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ChatRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: ChatRole;
  joinedAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  SEEN = 'seen'
}

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

export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}

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
