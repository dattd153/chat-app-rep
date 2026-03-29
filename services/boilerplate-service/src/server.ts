import { createApp } from './app';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const app = createApp();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Boilerplate Service running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
