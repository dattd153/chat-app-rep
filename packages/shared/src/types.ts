import { UserStatus, ChatType, ChatRole, MessageType, MessageStatus, FriendStatus } from './constants';

/** Shared Interfaces for the Chat Application */

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

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: ChatRole;
  joinedAt: Date;
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
