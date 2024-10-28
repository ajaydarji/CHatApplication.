import Message from "../model/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";

export const getMessages = async (req, res, next) => {
  try {
    const { userId: user1, id: user2 } = req.body;

    // Check if both user IDs are provided
    if (!user1 || !user2) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    // Fetch messages between user1 and user2
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timeStamp: 1 });

    // If no messages found, return a meaningful message
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    // Return the list of messages
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Uplode Files API

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    const filedir = `uploads/files/${date}`;
    mkdirSync(filedir, { recursive: true }); // Create the directory first

    const fileName = `${filedir}/${req.file.originalname}`;
    renameSync(req.file.path, fileName); // Then rename the file

    return res.status(200).json({ filePath: fileName });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.body; // Now pulling from req.userID set by verifyToken
  
  console.log("User ID from token:", userId, "Message ID:", messageId);

  try {
    const message = await Message.findById(messageId);
    console.log("Message sender:", message.sender.toString());

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Ensure the user trying to delete the message is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Message.findByIdAndDelete(messageId);

    return res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

