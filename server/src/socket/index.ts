import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import mongoose from 'mongoose';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

let io: SocketIOServer | null = null;

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocketServer first.');
  }
  return io;
};

/**
 * Extract JWT access token from socket handshake auth, headers, or cookies
 */
function extractToken(socket: Socket): string | null {
  // 1. Auth payload (preferred from socket.io-client)
  const authToken = socket.handshake.auth?.token;
  if (authToken && typeof authToken === 'string') {
    return authToken.replace(/^Bearer\s+/i, '').trim();
  }

  // 2. Authorization header
  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader && typeof authHeader === 'string') {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  // 3. Cookie header (accessToken)
  const cookieHeader = socket.handshake.headers?.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Check if origin is allowed for CORS
 */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

/**
 * Initialize Socket.IO server and attach to HTTP server
 */
export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow connection in production environments with varying subdomains
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      const user = await User.findById(decoded.id).select('_id name username avatar').lean();
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.data.user = user;
      socket.data.userId = user._id.toString();
      next();
    } catch (err: any) {
      console.warn('[Socket Auth] Connection rejected:', err.message);
      return next(new Error('Authentication error: ' + (err.message || 'Unauthorized')));
    }
  });

  // Socket Connection and Event Listeners
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const username = socket.data.user?.username || 'user';

    // Put user in their private user room to receive targeted list updates
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`⚡ [Socket] User connected: @${username} (${userId}) [socketId: ${socket.id}]`);

    // 1. Join conversation room
    socket.on('join_conversation', async (conversationId: string, ack?: (res: any) => void) => {
      try {
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
          if (ack) ack({ success: false, error: 'Invalid conversation ID' });
          return;
        }

        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        }).select('_id');

        if (!conv) {
          if (ack) ack({ success: false, error: 'Not a participant in this conversation' });
          return;
        }

        socket.join(conversationId);
        console.log(`[Socket] @${username} joined conversation ${conversationId}`);
        if (ack) ack({ success: true, conversationId });
      } catch (err: any) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // 2. Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.leave(conversationId);
        console.log(`[Socket] @${username} left conversation ${conversationId}`);
      }
    });

    // 3. Send message
    socket.on(
      'send_message',
      async (
        data: { conversationId: string; content: string },
        ack?: (res: { success: boolean; data?: any; error?: string }) => void
      ) => {
        try {
          const { conversationId, content } = data || {};
          if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            if (ack) ack({ success: false, error: 'Invalid conversation ID' });
            return;
          }

          const trimmed = (content || '').trim();
          if (!trimmed) {
            if (ack) ack({ success: false, error: 'Message cannot be empty' });
            return;
          }

          const conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            if (ack) ack({ success: false, error: 'Conversation not found' });
            return;
          }

          const isParticipant = conversation.participants.some((p) => p.toString() === userId);
          if (!isParticipant) {
            if (ack) ack({ success: false, error: 'Forbidden: Not a participant in this conversation' });
            return;
          }

          // Save message to database
          const messageDoc = await Message.create({
            conversationId: conversation._id,
            senderId: userId,
            content: trimmed,
            readBy: [userId],
          });

          // Update conversation lastMessage & updatedAt
          conversation.lastMessage = {
            content: trimmed,
            senderId: new mongoose.Types.ObjectId(userId),
            createdAt: new Date(),
          };
          conversation.updatedAt = new Date();
          await conversation.save();

          const createdAtIso = (messageDoc.createdAt || new Date()).toISOString();
          const updatedAtIso = (conversation.updatedAt || new Date()).toISOString();

          const formattedMessage = {
            id: messageDoc._id.toString(),
            _id: messageDoc._id.toString(),
            conversationId,
            sender: {
              id: userId,
              _id: userId,
              name: socket.data.user.name,
              username: socket.data.user.username,
              avatar: socket.data.user.avatar || '',
            },
            content: trimmed,
            read: false,
            createdAt: createdAtIso,
          };

          // Broadcast neutral message to conversation room (including sender)
          io?.to(conversationId).emit('new_message', formattedMessage);

          // Emit updated conversation to all participants' individual rooms
          const updatePayload = {
            conversationId,
            lastMessage: {
              content: trimmed,
              senderId: userId,
              createdAt: createdAtIso,
            },
            updatedAt: updatedAtIso,
          };

          conversation.participants.forEach((p) => {
            io?.to(`user:${p.toString()}`).emit('conversation_updated', updatePayload);
          });

          if (ack) {
            ack({ success: true, data: { ...formattedMessage, isMine: true } });
          }
        } catch (err: any) {
          console.error('[Socket] Error handling send_message:', err);
          if (ack) {
            ack({ success: false, error: err.message || 'Failed to send message' });
          }
        }
      }
    );

    // 4. Typing indicators
    socket.on('typing', ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      if (conversationId) {
        socket.to(conversationId).emit('user_typing', {
          conversationId,
          userId,
          username,
          isTyping: Boolean(isTyping),
        });
      }
    });

    // 5. Mark messages read
    socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) return;
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId },
            readBy: { $ne: userId },
          },
          {
            $addToSet: { readBy: userId },
          }
        );
        socket.to(conversationId).emit('messages_read', { conversationId, readBy: userId });
      } catch (err) {
        console.error('[Socket] Error in mark_read:', err);
      }
    });

    // 6. Clean disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket] User disconnected: @${username} (${reason})`);
    });
  });

  return io;
};

/**
 * Helper to emit a new message to conversation room and participants (for REST controller)
 */
export const emitNewMessage = (
  message: any,
  participantIds: Array<string | mongoose.Types.ObjectId>
) => {
  if (!io) return;

  // 1. Emit to active conversation room
  io.to(message.conversationId).emit('new_message', message);

  // 2. Emit conversation_updated to each participant
  const updatePayload = {
    conversationId: message.conversationId,
    lastMessage: {
      content: message.content,
      senderId: message.sender.id || message.sender._id,
      createdAt: message.createdAt,
    },
    updatedAt: message.createdAt,
  };

  participantIds.forEach((p) => {
    io?.to(`user:${p.toString()}`).emit('conversation_updated', updatePayload);
  });
};

/**
 * Helper to emit messages read event
 */
export const emitMessagesRead = (conversationId: string, readByUserId: string) => {
  if (!io) return;
  io.to(conversationId).emit('messages_read', { conversationId, readBy: readByUserId });
};
