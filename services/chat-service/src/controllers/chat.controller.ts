import { Request, Response } from 'express';
import { Chat } from '../models/Chat';
import { ChatMember } from '../models/ChatMember';
import { ChatType, ChatRole, successResponse, errorResponse } from '@chat-app/shared';
import { logger } from '@chat-app/logger';

export const createChat = async (req: Request, res: Response) => {
  const { type, name, avatar, memberIds } = req.body;
  const creatorId = req.headers['x-user-id'] as string;

  if (!creatorId) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Unauthorized'));

  try {
    // 1. For Direct Chat, check if already exists
    if (type === ChatType.DIRECT) {
      if (memberIds.length !== 1) {
        return res.status(400).json(errorResponse('INVALID_MEMBERS', 'Direct chat must have exactly 1 extra member'));
      }
      const otherUserId = memberIds[0];

      // Find common direct chat
      const existingMember = await ChatMember.aggregate([
        { $match: { userId: { $in: [creatorId, otherUserId] } } },
        { $group: { _id: '$chatId', count: { $sum: 1 } } },
        { $match: { count: 2 } }
      ]);

      if (existingMember.length > 0) {
        // Check if any of these is a direct chat
        for (const m of existingMember) {
          const chat = await Chat.findById(m._id);
          if (chat && chat.type === ChatType.DIRECT) {
            return res.json(successResponse(chat));
          }
        }
      }
    }

    // 2. Create Chat
    const chat = await Chat.create({
      type,
      name: type === ChatType.GROUP ? name : undefined,
      avatar,
    });

    // 3. Add Members
    const members = [
      { chatId: chat._id, userId: creatorId, role: ChatRole.ADMIN },
      ...memberIds.map((userId: string) => ({
        chatId: chat._id,
        userId,
        role: ChatRole.MEMBER
      }))
    ];

    await ChatMember.insertMany(members);

    res.status(201).json(successResponse(chat));
  } catch (err: any) {
    logger.error('Create chat failed', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};

export const getChats = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Unauthorized'));

  try {
    const userMemberships = await ChatMember.find({ userId });
    const chatIds = userMemberships.map(m => m.chatId);

    const chats = await Chat.find({ _id: { $in: chatIds } })
      .sort({ updatedAt: -1 });

    // In a real app, we might want to populate member details (names/avatars from user-service)
    // For now, return basic chat info
    res.json(successResponse(chats));
  } catch (err: any) {
    logger.error('Get chats failed', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};

export const addMember = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { userId } = req.body;
  const adminId = req.headers['x-user-id'] as string;

  try {
    const adminMember = await ChatMember.findOne({ chatId, userId: adminId, role: ChatRole.ADMIN });
    if (!adminMember) {
      return res.status(403).json(errorResponse('FORBIDDEN', 'Only admins can add members'));
    }

    await ChatMember.create({ chatId, userId, role: ChatRole.MEMBER });
    res.json(successResponse({ message: 'Member added' }));
  } catch (err: any) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};

export const getChatMembers = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const members = await ChatMember.find({ chatId });
    res.json(successResponse(members.map(m => m.userId)));
  } catch (err: any) {
    logger.error('Get chat members failed', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
};
