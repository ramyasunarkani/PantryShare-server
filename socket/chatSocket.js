const Chat = require('../models/Chat');

function chatSocket(io) {
  io.on('connection', (socket) => {
    console.log('user connected:', socket.id);

    socket.on('join_room', (roomId) => {
      if (!roomId) return;
      socket.join(roomId.toString());
      console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { itemId, senderId, receiverId, text } = data;
        if (!itemId || !senderId || !receiverId || !text) return;


        let chat = await Chat.findOne({
          itemId,
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        });

        if (!chat) {
          chat = new Chat({
            itemId,
            senderId,
            receiverId,
            messages: [],
          });
        }

        const newMessage = { sender: senderId, text };
        chat.messages.push(newMessage);
        await chat.save();

        const savedMsg = chat.messages[chat.messages.length - 1].toObject();

        io.to(itemId.toString()).emit('receive_message', {
          chatId: chat._id.toString(),
          itemId: itemId.toString(),
          senderId,
          receiverId,
          text: savedMsg.text,
          createdAt: savedMsg.createdAt,
        });

        console.log(`Message saved & emitted for item ${itemId}`);
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = chatSocket;
