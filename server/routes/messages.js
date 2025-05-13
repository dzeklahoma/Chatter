import express from 'express';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { verifyToken } from '../middleware/auth.js';
import { upload, getFileType } from '../middleware/upload.js';

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', verifyToken, async (req, res) => {
  try {
    // Check if user is a member of the chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Get messages, sorted by creation time
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Send a text message
router.post('/:chatId', verifyToken, async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Check if user is a member of the chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Create new message
    const newMessage = new Message({
      chatId: req.params.chatId,
      senderId: req.userId,
      content,
      type,
      status: 'sent',
    });
    
    const savedMessage = await newMessage.save();
    
    // Update chat with last message
    chat.lastMessage = {
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      timestamp: savedMessage.createdAt,
    };
    chat.updatedAt = new Date();
    await chat.save();
    
    res.status(201).json({ message: savedMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Send a media message (image or file)
router.post('/:chatId/media', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if user is a member of the chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    // Determine file type based on mimetype
    const type = getFileType(req.file.mimetype);
    
    // Create new message
    const newMessage = new Message({
      chatId: req.params.chatId,
      senderId: req.userId,
      content: content || (type === 'image' ? 'Image' : 'File'),
      type,
      status: 'sent',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
    });
    
    const savedMessage = await newMessage.save();
    
    // Update chat with last message
    chat.lastMessage = {
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      timestamp: savedMessage.createdAt,
    };
    chat.updatedAt = new Date();
    await chat.save();
    
    res.status(201).json({ message: savedMessage });
  } catch (err) {
    console.error('Send media message error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Mark message as read
router.put('/:messageId/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is a member of the chat
    const chat = await Chat.findOne({
      _id: message.chatId,
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(403).json({ error: 'Unauthorized access to this message' });
    }
    
    // Only update if user is not the sender
    if (message.senderId.toString() !== req.userId) {
      message.status = 'read';
      await message.save();
    }
    
    res.json({ message });
  } catch (err) {
    console.error('Mark message as read error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Delete message
router.delete('/:messageId', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Only allow the sender to delete their own message
    if (message.senderId.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }
    
    await message.remove();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;