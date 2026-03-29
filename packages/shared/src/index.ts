export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}
