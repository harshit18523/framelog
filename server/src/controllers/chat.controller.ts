import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

// Helper to reliably extract string id from either ObjectId or populated user document
const getParticipantId = (p: any): string => {
  if (!p) return '';
  if (p._id) return p._id.toString();
  return p.toString();
};

/**
 * List all conversations for the authenticated user
 * GET /api/chats
 */
export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  if (!currentUserId) throw new ApiError(401, 'Unauthorized');

  const conversations = await Conversation.find({
    participants: currentUserId,
  })
    .populate('participants', '_id name username avatar bio location')
    .sort({ updatedAt: -1 })
    .lean();

  // For each conversation, find unread messages count
  const formattedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherParticipant = conv.participants.find(
        (p: any) => getParticipantId(p) !== currentUserId.toString()
      ) as any;

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: currentUserId },
        readBy: { $ne: currentUserId },
      });

      return {
        id: conv._id.toString(),
        _id: conv._id.toString(),
        participants: conv.participants.map((p: any) => ({
          id: getParticipantId(p),
          _id: getParticipantId(p),
          name: p.name || 'User',
          username: p.username || 'user',
          avatar: p.avatar || '',
          bio: p.bio || '',
        })),
        otherUser: otherParticipant
          ? {
              id: getParticipantId(otherParticipant),
              _id: getParticipantId(otherParticipant),
              name: otherParticipant.name || 'User',
              username: otherParticipant.username || 'user',
              avatar: otherParticipant.avatar || '',
              bio: otherParticipant.bio || '',
            }
          : null,
        lastMessage:
          conv.lastMessage && conv.lastMessage.content && conv.lastMessage.senderId
            ? {
                content: conv.lastMessage.content,
                senderId: conv.lastMessage.senderId.toString(),
                createdAt: conv.lastMessage.createdAt,
              }
            : null,
        unreadCount,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    })
  );

  return res.status(200).json(new ApiResponse(formattedConversations, 'Conversations fetched'));
});

/**
 * Start a new conversation or retrieve existing one with a user
 * POST /api/chats
 * Body: { recipientId: string } or { participantId: string }
 */
export const getOrCreateConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const recipientId = req.body.recipientId || req.body.participantId;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!recipientId || !mongoose.isValidObjectId(recipientId)) {
    throw new ApiError(400, 'A valid recipient ID is required');
  }

  if (currentUserId.toString() === recipientId.toString()) {
    throw new ApiError(400, 'You cannot start a conversation with yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, 'Recipient user not found');
  }

  // Find if conversation already exists between these 2 participants
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, recipientId], $size: 2 },
  }).populate('participants', '_id name username avatar bio location');

  let isNew = false;
  if (!conversation) {
    const created = await Conversation.create({
      participants: [currentUserId, recipientId],
      lastMessage: null,
    });
    conversation = await Conversation.findById(created._id).populate(
      'participants',
      '_id name username avatar bio location'
    );
    isNew = true;
  }

  if (!conversation) {
    throw new ApiError(500, 'Failed to create or retrieve conversation');
  }

  const otherParticipant = conversation.participants.find(
    (p: any) => getParticipantId(p) !== currentUserId.toString()
  ) as any;

  const formatted = {
    id: conversation._id.toString(),
    _id: conversation._id.toString(),
    participants: conversation.participants.map((p: any) => ({
      id: getParticipantId(p),
      _id: getParticipantId(p),
      name: p.name || 'User',
      username: p.username || 'user',
      avatar: p.avatar || '',
      bio: p.bio || '',
    })),
    otherUser: otherParticipant
      ? {
          id: getParticipantId(otherParticipant),
          _id: getParticipantId(otherParticipant),
          name: otherParticipant.name || 'User',
          username: otherParticipant.username || 'user',
          avatar: otherParticipant.avatar || '',
          bio: otherParticipant.bio || '',
        }
      : null,
    lastMessage:
      conversation.lastMessage &&
      conversation.lastMessage.content &&
      conversation.lastMessage.senderId
        ? {
            content: conversation.lastMessage.content,
            senderId: conversation.lastMessage.senderId.toString(),
            createdAt: conversation.lastMessage.createdAt,
          }
        : null,
    unreadCount: 0,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };

  return res
    .status(isNew ? 201 : 200)
    .json(new ApiResponse(formatted, isNew ? 'Conversation created' : 'Conversation retrieved'));
});

/**
 * Get messages of a conversation and mark them as read
 * GET /api/chats/:id
 */
export const getConversationMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const conversationId = req.params.id;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, 'Invalid conversation ID');
  }

  const conversation = await Conversation.findById(conversationId).populate(
    'participants',
    '_id name username avatar bio location'
  );

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Ensure current user is a participant
  const isParticipant = conversation.participants.some(
    (p: any) => getParticipantId(p) === currentUserId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'Forbidden: You are not a participant in this conversation');
  }

  // Mark all unread messages sent by others in this conversation as read
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: currentUserId },
      readBy: { $ne: currentUserId },
    },
    {
      $addToSet: { readBy: currentUserId },
    }
  );

  const messages = await Message.find({ conversationId })
    .populate('senderId', '_id name username avatar')
    .sort({ createdAt: 1 })
    .lean();

  const formattedMessages = messages.map((m) => {
    const sender = m.senderId as any;
    const isMine = sender && getParticipantId(sender) === currentUserId.toString();
    return {
      id: m._id.toString(),
      _id: m._id.toString(),
      conversationId: m.conversationId.toString(),
      sender: {
        id: sender ? getParticipantId(sender) : 'unknown',
        _id: sender ? getParticipantId(sender) : 'unknown',
        name: sender?.name || 'User',
        username: sender?.username || 'user',
        avatar: sender?.avatar || '',
      },
      content: m.content,
      read: m.readBy && m.readBy.length > 1,
      isMine,
      createdAt: m.createdAt,
    };
  });

  const otherParticipant = conversation.participants.find(
    (p: any) => getParticipantId(p) !== currentUserId.toString()
  ) as any;

  return res.status(200).json(
    new ApiResponse(
      {
        conversation: {
          id: conversation._id.toString(),
          _id: conversation._id.toString(),
          participants: conversation.participants.map((p: any) => ({
            id: getParticipantId(p),
            _id: getParticipantId(p),
            name: p.name || 'User',
            username: p.username || 'user',
            avatar: p.avatar || '',
            bio: p.bio || '',
          })),
          otherUser: otherParticipant
            ? {
                id: getParticipantId(otherParticipant),
                _id: getParticipantId(otherParticipant),
                name: otherParticipant.name || 'User',
                username: otherParticipant.username || 'user',
                avatar: otherParticipant.avatar || '',
                bio: otherParticipant.bio || '',
              }
            : null,
          updatedAt: conversation.updatedAt,
        },
        messages: formattedMessages,
      },
      'Conversation messages retrieved'
    )
  );
});

/**
 * Send a message in a conversation
 * POST /api/chats/:id/messages
 * Body: { content: string }
 */
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const conversationId = req.params.id;
  const { content } = req.body;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, 'Invalid conversation ID');
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new ApiError(400, 'Message content cannot be empty');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => getParticipantId(p) === currentUserId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'Forbidden: You are not a participant in this conversation');
  }

  const trimmed = content.trim();

  // Create message
  const messageDoc = await Message.create({
    conversationId: conversation._id,
    senderId: currentUserId,
    content: trimmed,
    readBy: [currentUserId],
  });

  // Update conversation lastMessage & updatedAt
  conversation.lastMessage = {
    content: trimmed,
    senderId: currentUserId,
    createdAt: new Date(),
  };
  conversation.updatedAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(messageDoc._id)
    .populate('senderId', '_id name username avatar')
    .lean();

  const sender = populatedMessage?.senderId as any;

  const formattedMessage = {
    id: messageDoc._id.toString(),
    _id: messageDoc._id.toString(),
    conversationId: messageDoc.conversationId.toString(),
    sender: {
      id: sender ? getParticipantId(sender) : currentUserId.toString(),
      _id: sender ? getParticipantId(sender) : currentUserId.toString(),
      name: sender?.name || req.user?.name || 'User',
      username: sender?.username || req.user?.username || 'user',
      avatar: sender?.avatar || req.user?.avatar || '',
    },
    content: messageDoc.content,
    read: false,
    isMine: true,
    createdAt: messageDoc.createdAt,
  };

  return res.status(201).json(new ApiResponse(formattedMessage, 'Message sent successfully'));
});

/**
 * Mark messages in a conversation as read
 * PUT /api/chats/:id/read
 */
export const markConversationAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const conversationId = req.params.id;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, 'Invalid conversation ID');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: currentUserId },
      readBy: { $ne: currentUserId },
    },
    {
      $addToSet: { readBy: currentUserId },
    }
  );

  return res.status(200).json(new ApiResponse({ success: true }, 'Messages marked as read'));
});
