const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');
const { initSocket } = require('./socket/socket');

const startServer = async () => {
  await connectDB();

  // Express app ko raw http server me wrap kiya — socket.io ko isi
  // server pe attach karna hota hai, express instance pe nahi.
  const httpServer = http.createServer(app);

  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
    logger.info(`🔌 Socket.IO ready`);
  });
};

startServer();