import express, { Express } from 'express';
import cors from 'cors';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Healthcheck Route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'boilerplate-service' });
  });

  // Example implementation of feature modules would go here:
  // app.use('/api/v1/resource', resourceRouter);

  return app;
};
