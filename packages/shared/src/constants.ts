/** Shared Enums for the Chat Application */

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export enum ChatRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  SEEN = 'seen',
}

export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum SocketEvents {
  // Chat Room
  JOIN_CHAT = 'join-chat',
  LEAVE_CHAT = 'leave-chat',

  // Messaging (Real-time)
  NEW_MESSAGE = 'new-message',
  TYPING_START = 'typing-start',
  TYPING_STOP = 'typing-stop',
  
  // Message Status
  MESSAGE_DELIVERED = 'message-delivered',
  MESSAGE_SEEN = 'message-seen',
  
  // Presence
  USER_ONLINE = 'user-online',
  USER_OFFLINE = 'user-offline',
  PRESENCE_UPDATE = 'presence-update',
}
