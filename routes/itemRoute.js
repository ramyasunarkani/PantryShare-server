const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post("/",auth,upload.single("image"),itemController.createItem);

router.get("/", itemController.getAllItems);

router.get("/my-items", auth, itemController.getUserItems);

router.put("/:id",auth,upload.single("image"),itemController.updateItem);

router.delete("/:id", auth, itemController.deleteItem);

module.exports = router;
