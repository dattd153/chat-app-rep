import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Friend } from '../models/Friend';
import { Outbox } from '../models/Outbox';
import { logger } from '@chat-app/logger';
import { successResponse, errorResponse, FriendStatus } from '@chat-app/shared';
import mongoose from 'mongoose';

// PROFILE CONTROLLERS
export const getMyProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).send(errorResponse('UNAUTHORIZED', 'Missing user ID'));

  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).send(errorResponse('NOT_FOUND', 'Profile not found'));
    }
    res.send(successResponse(profile));
  } catch (err) {
    logger.error('Failed to get my profile', { userId, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Internal Server Error'));
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { name, bio, avatar } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { name, bio, avatar } },
      { new: true }
    );
    if (!profile) {
      return res.status(404).send(errorResponse('NOT_FOUND', 'Profile not found'));
    }
    res.send(successResponse({ success: true }));
  } catch (err) {
    logger.error('Failed to update profile', { userId, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Internal Server Error'));
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const profile = await Profile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).send(errorResponse('NOT_FOUND', 'User not found'));
    }
    res.send(successResponse({
      id: profile.userId,
      name: profile.name,
      avatar: profile.avatar
    }));
  } catch (err) {
    logger.error('Failed to get user by ID', { id, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Internal Server Error'));
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const { q } = req.query;

  try {
    const profiles = await Profile.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    const result = profiles.map(p => ({
      id: p.userId,
      name: p.name,
      avatar: p.avatar
    }));

    res.send(successResponse(result));
  } catch (err) {
    logger.error('Search failed', { query: q, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Search failed'));
  }
};

// FRIEND SYSTEM CONTROLLERS
export const sendFriendRequest = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const targetUserId = req.body.friendId || req.body.userId;

  if (!userId) {
    return res.status(401).send(errorResponse('UNAUTHORIZED', 'User identification missing'));
  }

  if (userId === targetUserId) {
    return res.status(400).send(errorResponse('INVALID_TARGET', 'Cannot add yourself as friend'));
  }

  try {
    // Check if relationship already exists
    const existing = await Friend.findOne({ userId, friendId: targetUserId });
    if (existing) {
      return res.status(400).send(errorResponse('ALREADY_SENT', 'Request already exists or already friends'));
    }

    // Check if there is a pending request FROM the target user TO us
    const reverseRequest = await Friend.findOne({ userId: targetUserId, friendId: userId, status: FriendStatus.PENDING });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (reverseRequest) {
        // Automatically accept both if they both sent requests
        reverseRequest.status = FriendStatus.ACCEPTED;
        await reverseRequest.save({ session });

        const reciprocal = new Friend({ userId, friendId: targetUserId, status: FriendStatus.ACCEPTED });
        await reciprocal.save({ session });

        const outbox = new Outbox({
          eventType: 'FRIEND_REQUEST_ACCEPTED',
          payload: { requesterId: targetUserId, recipientId: userId, status: FriendStatus.ACCEPTED }
        });
        await outbox.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.send(successResponse({ success: true, message: 'Friend request accepted (mutual)' }));
      }

      const request = new Friend({ userId, friendId: targetUserId, status: FriendStatus.PENDING });
      await request.save({ session });

      const outbox = new Outbox({
        eventType: 'FRIEND_REQUEST_CREATED',
        payload: { requesterId: userId, recipientId: targetUserId, status: FriendStatus.PENDING }
      });
      await outbox.save({ session });

      await session.commitTransaction();
      session.endSession();
      res.send(successResponse({ success: true }));
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err: any) {
    logger.error('Friend request failed', { userId, targetUserId, error: err.message });
    res.status(500).send(errorResponse('INTERNAL_ERROR', `Failed to send request: ${err.message}`));
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const requesterId = req.body.friendId || req.body.userId;

  if (!userId) {
    return res.status(401).send(errorResponse('UNAUTHORIZED', 'User identification missing'));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const request = await Friend.findOneAndUpdate(
        { userId: requesterId, friendId: userId, status: FriendStatus.PENDING },
        { $set: { status: FriendStatus.ACCEPTED } },
        { new: true, session }
      );

      if (!request) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).send(errorResponse('NOT_FOUND', 'Request not found'));
      }

      // Also create a reciprocal relationship if not exists
      const existingReciprocal = await Friend.findOne({ userId, friendId: requesterId });
      if (!existingReciprocal) {
        await Friend.create([{ userId, friendId: requesterId, status: FriendStatus.ACCEPTED }], { session });
      } else {
        existingReciprocal.status = FriendStatus.ACCEPTED;
        await existingReciprocal.save({ session });
      }

      const outbox = new Outbox({
        eventType: 'FRIEND_REQUEST_ACCEPTED',
        payload: {
          requesterId,
          recipientId: userId,
          status: FriendStatus.ACCEPTED
        }
      });
      await outbox.save({ session });

      await session.commitTransaction();
      session.endSession();
      res.send(successResponse({ success: true }));
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    logger.error('Accept friend failed', { userId, requesterId, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Failed to accept friend'));
  }
};

export const getFriendList = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).send(errorResponse('UNAUTHORIZED', 'User identification missing'));
  }

  try {
    const friends = await Friend.find({ userId, status: FriendStatus.ACCEPTED });
    const friendIds = friends.map((f: any) => f.friendId);

    const profiles = await Profile.find({ userId: { $in: friendIds } });

    const result = profiles.map((p: any) => ({
      id: p.userId,
      name: p.name,
      avatar: p.avatar,
      online: p.status === 'online'
    }));

    res.send(successResponse(result));
  } catch (err) {
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Failed to get friend list'));
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).send(errorResponse('UNAUTHORIZED', 'User identification missing'));
  }

  try {
    // Find requests where current user is the recipient (friendId)
    const pendingRelations = await Friend.find({ friendId: userId, status: FriendStatus.PENDING });
    const requesterIds = pendingRelations.map((f: any) => f.userId);

    const profiles = await Profile.find({ userId: { $in: requesterIds } });

    const result = profiles.map((p: any) => ({
      id: p.userId,
      name: p.name,
      avatar: p.avatar,
      online: p.status === 'online'
    }));

    res.send(successResponse(result));
  } catch (err) {
    logger.error('Failed to get pending requests', { userId, error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Failed to get pending requests'));
  }
};
