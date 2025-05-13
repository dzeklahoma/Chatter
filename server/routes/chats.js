import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    // Find all chats where the current user is a member
    let chats = await Chat.find({ members: req.userId })
      .sort({ updatedAt: -1 })
      .populate('members', 'name email avatar status lastSeen');
    
    // For each chat, count unread messages for current user
    chats = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        senderId: { $ne: req.userId },
        status: { $ne: 'read' },
      });
      
      // Convert to plain object to add unreadCount
      const chatObj = chat.toObject();
      chatObj.unreadCount = unreadCount;
      
      // For private chats, filter out the current user from members
      if (chatObj.type === 'private') {
        chatObj.members = chatObj.members.filter(
          (member) => member._id.toString() !== req.userId
        );
      }
      
      return chatObj;
    }));
    
    res.json({ chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get a specific chat by ID
router.get('/:chatId', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      members: req.userId,
    }).populate('members', 'name email avatar status lastSeen');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Convert to plain object to add unreadCount
    const chatObj = chat.toObject();
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      chatId: chat._id,
      senderId: { $ne: req.userId },
      status: { $ne: 'read' },
    });
    
    chatObj.unreadCount = unreadCount;
    
    // For private chats, filter out the current user from members
    if (chatObj.type === 'private') {
      chatObj.members = chatObj.members.filter(
        (member) => member._id.toString() !== req.userId
      );
    }
    
    res.json({ chat: chatObj });
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Create a private chat
router.post('/private', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      type: 'private',
      members: { $all: [req.userId, userId] },
    }).populate('members', 'name email avatar status lastSeen');
    
    if (existingChat) {
      // Filter out the current user from members for private chats
      const chatObj = existingChat.toObject();
      chatObj.members = chatObj.members.filter(
        (member) => member._id.toString() !== req.userId
      );
      
      return res.json({ chat: chatObj });
    }
    
    // Create new chat
    const newChat = new Chat({
      type: 'private',
      members: [req.userId, userId],
    });
    
    const savedChat = await newChat.save();
    
    // Populate members
    await savedChat.populate('members', 'name email avatar status lastSeen');
    
    // Filter out the current user from members for the response
    const chatObj = savedChat.toObject();
    chatObj.members = chatObj.members.filter(
      (member) => member._id.toString() !== req.userId
    );
    chatObj.unreadCount = 0;
    
    res.status(201).json({ chat: chatObj });
  } catch (err) {
    console.error('Create private chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Create a group chat
router.post('/group', verifyToken, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'At least one member is required' });
    }
    
    // Add current user to members if not already included
    const allMemberIds = [...new Set([req.userId, ...memberIds])];
    
    // Create new group chat
    const newChat = new Chat({
      name,
      type: 'group',
      members: allMemberIds,
    });
    
    const savedChat = await newChat.save();
    
    // Populate members
    await savedChat.populate('members', 'name email avatar status lastSeen');
    
    const chatObj = savedChat.toObject();
    chatObj.unreadCount = 0;
    
    res.status(201).json({ chat: chatObj });
  } catch (err) {
    console.error('Create group chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Update group chat name
router.put('/group/:chatId', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      type: 'group',
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }
    
    chat.name = name;
    await chat.save();
    
    await chat.populate('members', 'name email avatar status lastSeen');
    
    res.json({ chat });
  } catch (err) {
    console.error('Update group chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Add members to group chat
router.post('/group/:chatId/members', verifyToken, async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'Member IDs are required' });
    }
    
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      type: 'group',
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }
    
    // Add new members
    chat.members = [...new Set([...chat.members.map(id => id.toString()), ...memberIds])];
    await chat.save();
    
    await chat.populate('members', 'name email avatar status lastSeen');
    
    res.json({ chat });
  } catch (err) {
    console.error('Add group members error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Remove member from group chat
router.delete('/group/:chatId/members/:memberId', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      type: 'group',
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }
    
    // Remove member
    chat.members = chat.members.filter(
      (id) => id.toString() !== req.params.memberId
    );
    
    await chat.save();
    
    await chat.populate('members', 'name email avatar status lastSeen');
    
    res.json({ chat });
  } catch (err) {
    console.error('Remove group member error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Delete chat
router.delete('/:chatId', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      members: req.userId,
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Delete all messages in the chat
    await Message.deleteMany({ chatId: chat._id });
    
    // Delete the chat
    await chat.remove();
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Delete chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;