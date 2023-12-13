const Chat = require('../models/chatModel');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    socket.on('joinChat', async ({ userId, chatId }) => {
      try {
        // Find the chat associated with the client and account manager
        console.log('User Joined Chat: ', userId);
        const chat = await Chat.findById(chatId);

        // console.log(`Client: ${chat.client} and usedId: ${userId}`);

        if (chat.seller.id === userId) {
          chat.sellerisSeen = true;
          // console.log('seen by client');
        }

        if (chat.customer.id === userId) {
          chat.customerisSeen = true;
          // console.log('seen by manager');
        }

        chat.save();

        // Join the socket to the chat room
        socket.join(chat.id);
        // console.log(socket.rooms);

        // Send the chat history to the client
        socket.emit('chatHistory', chat.messages);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('sendMessage', async ({ userId, chatId, message }) => {
      try {
        let name;
        // Find the chat associated with the client and account manager
        const chat = await Chat.findById(chatId);

        if (chat.seller.id === userId) {
          chat.customerisSeen = false;
          name = chat.seller.name;
          // console.log('seen by client');
        }

        if (chat.customer.id === userId) {
          chat.sellerisSeen = false;
          name = chat.customer.name;
          // console.log('seen by manager');
        }

        // Add the message to the chat's messages array
        chat.messages.push({
          name: name,
          message: message,
          senderId: userId,
          createdAt: new Date(),
        });

        // Save the updated chat
        await chat.save();

        // console.log(socket.rooms);
        const messagelatest = {
          name: name,
          message: message,
          senderId: userId,
          createdAt: new Date(),
        };
        // Send the message to all clients in the chat room
        io.to(chat.id).emit('newMessage', messagelatest);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected: ', socket.id);
    });
  });
};
