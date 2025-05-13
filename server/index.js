import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import chatRoutes from "./routes/chats.js";
import messageRoutes from "./routes/messages.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";

// Load environment variables
dotenv.config();
console.log("Connecting to MongoDB URI:", process.env.MONGODB_URI);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up CORS
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user to their personal room
  socket.join(socket.userId);

  // Update user status to online
  User.findByIdAndUpdate(socket.userId, {
    status: "online",
    lastSeen: new Date(),
  }).catch((err) => console.error("Error updating user status:", err));

  // Join chat rooms
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat: ${chatId}`);
  });

  // Handle new messages
  socket.on("send_message", async (messageData) => {
    try {
      const { chatId, content, type = "text" } = messageData;

      // Create new message
      const newMessage = new Message({
        chatId,
        senderId: socket.userId,
        content,
        type,
        status: "sent",
      });

      const savedMessage = await newMessage.save();

      // Update chat's last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          content: savedMessage.content,
          senderId: savedMessage.senderId,
          timestamp: savedMessage.createdAt,
        },
        updatedAt: new Date(),
      });

      // Get chat members
      const chat = await Chat.findById(chatId);

      // Broadcast to all chat members
      chat.members.forEach((memberId) => {
        // Skip sender
        if (memberId.toString() === socket.userId) return;

        // Send to member's personal room
        io.to(memberId.toString()).emit("new_message", savedMessage);

        // Update message status to delivered
        Message.findByIdAndUpdate(savedMessage._id, { status: "delivered" })
          .then(() => {
            // Notify sender about delivery
            io.to(socket.userId).emit("message_status_update", {
              messageId: savedMessage._id,
              status: "delivered",
            });
          })
          .catch(console.error);
      });

      // Confirm to sender
      socket.emit("message_sent", savedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle message read
  socket.on("mark_read", async ({ messageId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "read" },
        { new: true }
      );

      if (!message) return;

      // Notify sender about read status
      io.to(message.senderId.toString()).emit("message_status_update", {
        messageId: message._id,
        status: "read",
      });
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(chatId).emit("user_typing", {
      chatId,
      userId: socket.userId,
      isTyping,
    });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);

    // Update user status to offline
    User.findByIdAndUpdate(socket.userId, {
      status: "offline",
      lastSeen: new Date(),
    }).catch((err) => console.error("Error updating user status:", err));
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", verifyToken, chatRoutes);
app.use("/api/messages", verifyToken, messageRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
