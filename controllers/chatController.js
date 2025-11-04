const Chat = require('../models/Chat');

createOrUpdateChat = async (req, res) => {
  try {
    const { itemId, senderId, receiverId, text } = req.body;
    if (!itemId || !senderId || !receiverId || !text)
      return res.status(400).json({ message: 'Missing fields' });

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

    chat.messages.push({ sender: senderId, text });
    await chat.save();

    return res.status(200).json(chat);
  } catch (err) {
    console.error('Chat POST error:', err);
    return res.status(500).json({ error: err.message });
  }
};

getUserChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('itemId', 'title imageUrl expiryDate')
      .populate('senderId', 'fullName photoURL')
      .populate('receiverId', 'fullName photoURL')
      .lean();

    const result = chats.map(chat => ({
      ...chat,
      isSender: chat.senderId._id.toString() === userId,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET chats error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports={createOrUpdateChat,getUserChats};