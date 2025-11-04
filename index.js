require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db-connection');

const userRoute = require('./routes/userRoute');
const itemRoute = require('./routes/itemRoute');
const reservationRoute = require('./routes/reservationRoutes');
const chatRoute = require('./routes/chatRoutes');

const chatSocket = require('./socket/chatSocket');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API is working '));

app.use('/auth', userRoute);
app.use('/items', itemRoute);
app.use('/reservations', reservationRoute);
app.use('/chats', chatRoute);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

chatSocket(io);

(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
})();
