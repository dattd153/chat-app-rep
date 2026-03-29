import express from 'express';
export const app = express();
app.get('/health', (req, res) => res.json({ status: 'user-service is running' }));
