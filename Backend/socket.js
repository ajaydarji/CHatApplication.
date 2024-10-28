import { Server as SocketIoServer } from "socket.io";
import Message from "./model/MessagesModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sentMessage = async (message) => {
    try {
      // Log the received message object
      console.log("Received message:", message);

      // Check if the message and required fields exist
      if (!message || !message.sender || !message.recipient) {
        console.error("Invalid message object:", message);
        return;
      }

      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createdMessage = await Message.create(message);
      console.log("Message created:", createdMessage);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error in sending message:", error);
    }
  };
  console.log(sentMessage());

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(userId);

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User Connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    // Now, only call sentMessage when the 'sendMessage' event is emitted
    socket.on("sendMessage", sentMessage); // This will receive the message from the frontend
    socket.on("disconnect", () => disconnect(socket));
    socket.on("error", (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  console.log("Socket.io server is set up and listening for connections.");
};

export default setupSocket;
