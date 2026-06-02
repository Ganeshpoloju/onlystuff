const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL],
      credentials: true,
    },
  });

  // Auth middleware — verify JWT from handshake cookie or auth header
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
        ?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Join personal notification room
    socket.join(`user:${socket.userId}`);

    // Join a listing chat room
    socket.on('join:listing', (listingId) => {
      socket.join(`listing:${listingId}`);
    });

    // Join a group buy room
    socket.on('join:groupbuy', (groupBuyId) => {
      socket.join(`groupbuy:${groupBuyId}`);
    });

    // Chat: new message
    socket.on('chat:send', (data) => {
      // Validated and persisted in REST endpoint; socket only broadcasts
      io.to(`listing:${data.listingId}`).emit('chat:message', data);
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      socket.to(`listing:${data.listingId}`).emit('chat:typing', {
        userId: socket.userId,
        listingId: data.listingId,
      });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
