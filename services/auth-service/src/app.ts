import express from 'express';
export const app = express();
app.get('/health', (req, res) => res.json({ status: 'auth-service is running' }));
