import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getMessages,
  uploadFile,
  deleteMessage,
} from "../controller/MessageController.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files" });

// Get all messages
messagesRoutes.post("/get-messages", verifyToken, getMessages);

// Upload files (single file)
messagesRoutes.post(
  "/upload-files",
  verifyToken,
  upload.single("file"),
  uploadFile
);

// Delete a specific message by ID
messagesRoutes.delete("/messages/:messageId", verifyToken, deleteMessage);

export default messagesRoutes;
