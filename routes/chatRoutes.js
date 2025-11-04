const express = require('express');
const { createOrUpdateChat, getUserChats } = require('../controllers/chatController');
const router = express.Router();

router.post('/', createOrUpdateChat);
router.get('/:userId', getUserChats);

module.exports = router;
