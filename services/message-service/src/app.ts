import express from 'express';
import cors from 'cors';
import * as messageController from './controllers/message.controller';

export const app = express();

app.use(cors());
app.use(express.json());

// Message Routes
app.post('/api/messages', messageController.sendMessage);
app.get('/api/messages/:chatId', messageController.getMessages);

app.get('/health', (req, res) => res.json({ status: 'message-service is running' }));
