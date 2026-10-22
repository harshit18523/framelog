import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../controllers/chat.controller.js';

const router = Router();

// Protect all chat endpoints with JWT authentication
router.use(authenticate);

// List conversations
router.get('/', getConversations);

// Create or get existing 1-on-1 conversation
router.post('/', getOrCreateConversation);

// Get messages in a conversation
router.get('/:id', getConversationMessages);

// Send message to conversation
router.post('/:id/messages', sendMessage);

// Mark conversation messages as read
router.put('/:id/read', markConversationAsRead);

export default router;
