import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// CORS - FIRST AND ONLY CORS CONFIG
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(200);
});

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  // console.log(`🔗 ${req.method} ${req.originalUrl}`);
  // console.log("  Origin:", req.headers.origin);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Socket.IO
// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Multiple origins add karein
    methods: ["GET", "POST"],
    credentials: true
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  // console.log("✅ Socket Connected:", socket.id);
  // console.log("  Query:", socket.handshake.query);
  // console.log("  Headers Origin:", socket.handshake.headers.origin);
  
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") { // Extra check
    userSocketMap[userId] = socket.id;
    // console.log("👤 User mapped:", userId, "->", socket.id);
  }
  
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // console.log("📡 Online users:", Object.keys(userSocketMap));
  
  socket.on("disconnect", () => {
    // console.log("❌ User disconnected:", socket.id);
    
    // Proper cleanup - find userId by socket.id
    for (const [uid, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[uid];
        // console.log("🗑️ Removed user:", uid);
        break;
      }
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };

// Start server
server.listen(PORT, () => {
  // console.log(`Server running on PORT: ${PORT}`);
  connectDB();
});