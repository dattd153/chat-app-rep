import express from 'express';
export const app = express();
app.get('/health', (req, res) => res.json({ status: 'chat-service is running' }));
