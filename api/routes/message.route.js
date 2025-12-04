import express from "express";
import {
  getChatRooms,
  getMessages,
  markMessagesAsSeen,
  postMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:roomId", getMessages);
router.post("/", postMessage);
router.get("/chat-rooms/:userId", getChatRooms);
router.put("/mark-seen", markMessagesAsSeen);

export default router;
