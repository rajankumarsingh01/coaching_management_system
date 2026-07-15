const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/token');
const logger = require('../utils/logger');

let io = null;

// userId (string) -> Set of socketIds — same user multiple devices/tabs se
// connect ho sakta hai (web admin + mobile phone dono ek saath)
const onlineUsers = new Map();

// Admin "online users" widget ke liye — instituteId (string) -> Map<userId, role>.
// Isse har request pe DB query karke online status nikalne ki zarurat nahi padti.
const onlineByInstitute = new Map();

// Same allowed-origins logic jo app.js me REST CORS ke liye use hui hai —
// mobile app (Expo/React Native) Origin header bhejta hi nahi, isliye
// !origin wale request allow honge, jaise REST me hote hain.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by Socket.IO CORS'));
        }
      },
      credentials: true,
    },
  });

  // Handshake-level auth — same JWT access token used for REST APIs.
  // Client sends it as: io(URL, { auth: { token: accessToken } })
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded; // { id, role, instituteId, batchIds }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, instituteId, role, batchIds } = socket.user;

    // Transition check — agar ye user pehle se kisi tab/device se online nahi
    // tha, to yeh ek genuine "user aaya" event hai, sirf ek naya tab nahi
    const wasOffline = !onlineUsers.has(String(userId));

    addOnlineUser(userId, socket.id);

    // Personal room — direct kisi ek user ko notification bhejni ho
    socket.join(`user:${userId}`);

    // Institute-wide rooms — poore institute ya ek role ko broadcast karne ke liye
    if (instituteId) {
      socket.join(`institute:${instituteId}`);
      socket.join(`institute:${instituteId}:role:${role}`);

      if (wasOffline) {
        addToInstitutePresence(instituteId, userId, role);
        emitToInstituteRole(instituteId, 'admin', 'presence:update', getPresenceSummary(instituteId));
      }
    }

    // Batch rooms — batch-scoped events ke liye (naya test, homework, attendance)
    if (Array.isArray(batchIds)) {
      batchIds.forEach((batchId) => socket.join(`batch:${batchId}`));
    }

    logger.info(`🔌 Socket connected: user=${userId} role=${role} socket=${socket.id}`);

    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);

      // Transition check — agar iska koi aur tab/device abhi bhi connected
      // hai to ye sirf ek tab band hua hai, user "offline" nahi hua
      const isNowOffline = !onlineUsers.has(String(userId));

      if (isNowOffline && instituteId) {
        removeFromInstitutePresence(instituteId, userId);
        emitToInstituteRole(instituteId, 'admin', 'presence:update', getPresenceSummary(instituteId));
      }

      logger.info(`❌ Socket disconnected: user=${userId} socket=${socket.id}`);
    });
  });

  return io;
};

const addOnlineUser = (userId, socketId) => {
  const key = String(userId);
  if (!onlineUsers.has(key)) onlineUsers.set(key, new Set());
  onlineUsers.get(key).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  const key = String(userId);
  const sockets = onlineUsers.get(key);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) onlineUsers.delete(key);
};

const isUserOnline = (userId) => onlineUsers.has(String(userId));

// ---- Institute-wise presence tracking (admin widget) ----

const addToInstitutePresence = (instituteId, userId, role) => {
  const key = String(instituteId);
  if (!onlineByInstitute.has(key)) onlineByInstitute.set(key, new Map());
  onlineByInstitute.get(key).set(String(userId), role);
};

const removeFromInstitutePresence = (instituteId, userId) => {
  const key = String(instituteId);
  const users = onlineByInstitute.get(key);
  if (!users) return;
  users.delete(String(userId));
  if (users.size === 0) onlineByInstitute.delete(key);
};

// Returns { total, byRole: { admin: 1, teacher: 3, student: 40 }, userIds: [...] }
const getPresenceSummary = (instituteId) => {
  const users = onlineByInstitute.get(String(instituteId));
  if (!users) return { total: 0, byRole: {}, userIds: [] };

  const byRole = {};
  users.forEach((role) => {
    byRole[role] = (byRole[role] || 0) + 1;
  });

  return { total: users.size, byRole, userIds: Array.from(users.keys()) };
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initSocket(httpServer) in server.js first');
  }
  return io;
};

// ---- Emit helpers — inhi ko service layer se import karke use karna hai ----

const emitToUser = (userId, event, payload) => {
  getIO().to(`user:${userId}`).emit(event, payload);
};

const emitToUsers = (userIds, event, payload) => {
  const rooms = userIds.map((id) => `user:${id}`);
  getIO().to(rooms).emit(event, payload);
};

const emitToInstitute = (instituteId, event, payload) => {
  getIO().to(`institute:${instituteId}`).emit(event, payload);
};

const emitToInstituteRole = (instituteId, role, event, payload) => {
  getIO().to(`institute:${instituteId}:role:${role}`).emit(event, payload);
};

const emitToBatch = (batchId, event, payload) => {
  getIO().to(`batch:${batchId}`).emit(event, payload);
};

module.exports = {
  initSocket,
  getIO,
  isUserOnline,
  getPresenceSummary,
  emitToUser,
  emitToUsers,
  emitToInstitute,
  emitToInstituteRole,
  emitToBatch,
};