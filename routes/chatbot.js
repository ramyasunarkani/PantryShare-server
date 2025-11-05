const express = require("express");
const router = express.Router();
const { getChatbotReply } = require("../controllers/chatbotController");

// POST /chatbot/message
router.post("/message", getChatbotReply);

module.exports = router;
