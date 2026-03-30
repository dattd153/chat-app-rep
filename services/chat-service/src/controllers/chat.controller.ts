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
      // Standardize memberIds: Filter out creator and ensure only 1 other user
      const otherUserIds = memberIds.filter((id: string) => id !== creatorId);
      
      if (otherUserIds.length !== 1) {
        return res.status(400).json(errorResponse('INVALID_MEMBERS', 'Direct chat must have exactly 1 extra member'));
      }
      const otherUserId = otherUserIds[0];

      // Find existing direct chat between these two users
      const existingMember = await ChatMember.aggregate([
        { $match: { userId: { $in: [creatorId, otherUserId] } } },
        { $group: { _id: '$chatId', count: { $sum: 1 } } },
        { $match: { count: 2 } }
      ]);

      if (existingMember.length > 0) {
        for (const m of existingMember) {
          const chat = await Chat.findOne({ _id: m._id, type: ChatType.DIRECT });
          if (chat) {
            return res.json(successResponse(chat));
          }
        }
      }
      
      // Update memberIds to only contain the other user (we add creator later)
      req.body.memberIds = [otherUserId];
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

    const chatsWithParticipants = await Chat.aggregate([
      { $match: { _id: { $in: chatIds } } },
      {
        $lookup: {
          from: 'chatmembers',
          localField: '_id',
          foreignField: 'chatId',
          as: 'members'
        }
      },
      {
        $project: {
          id: '$_id',
          _id: 1,
          name: 1,
          type: 1,
          lastMessage: 1,
          createdAt: 1,
          updatedAt: 1,
          participants: '$members.userId'
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    res.json(successResponse(chatsWithParticipants));
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
