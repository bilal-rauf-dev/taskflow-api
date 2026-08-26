const dotenv = require('dotenv');

const connectDB = require('./src/config/db');
const app = require('./src/app');

dotenv.config();

connectDB();

const http = require('http');
const { initSocket } = require('./src/config/socket');
const startDeadlineScan = require('./src/services/deadlineDaemon');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);
startDeadlineScan();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
