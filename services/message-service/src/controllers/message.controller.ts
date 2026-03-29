import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { Outbox } from '../models/Outbox';
import { successResponse, errorResponse } from '@chat-app/shared';
import { logger } from '@chat-app/logger';

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, content, type, clientMessageId } = req.body;
  const senderId = req.headers['x-user-id'] as string;

  if (!senderId) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Unauthorized'));

  // Start Transaction (Requires Replica Set)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Message
    const message = new Message({
      chatId,
      senderId,
      content,
      type,
      clientMessageId
    });
    await message.save({ session });

    // 2. Create Outbox Event
    const outboxEvent = new Outbox({
      eventType: 'MESSAGE_CREATED',
      payload: {
        messageId: message._id,
        chatId,
        senderId,
        content,
        type,
        createdAt: message.createdAt
      }
    });
    await outboxEvent.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(successResponse(message));
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    // Handle duplicate clientMessageId
    if (err.code === 11000) {
      const existing = await Message.findOne({ clientMessageId });
      return res.json(successResponse(existing));
    }

    logger.error('Send message failed', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { cursor, limit = 20 } = req.query;

  try {
    const query: any = { chatId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor as string) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(successResponse(messages));
  } catch (err: any) {
    logger.error('Get messages failed', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};
