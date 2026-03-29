import express from 'express';
import cors from 'cors';
import * as chatController from './controllers/chat.controller';

export const app = express();

app.use(cors());
app.use(express.json());

// Chat Routes
app.post('/api/chats', chatController.createChat);
app.get('/api/chats', chatController.getChats);
app.post('/api/chats/:chatId/members', chatController.addMember);
app.get('/api/chats/:chatId/members', chatController.getChatMembers);

app.get('/health', (req, res) => res.json({ status: 'chat-service is running' }));
