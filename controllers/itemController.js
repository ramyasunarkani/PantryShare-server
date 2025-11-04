const Item = require("../models/Item");
const imagekit = require("../config/imagekit");
const fs = require("fs");

const createItem = async (req, res) => {
  try {
    const { title, description, address, expiryDate } = req.body;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const location = req.body.location ? JSON.parse(req.body.location) : {};

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const newItemData = {
      title,
      description,
      address,
      expiryDate,
      tags,
      location,
      sharerId: req.user.userId,
    };

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path); 
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/items",
      });

      newItemData.imageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const newItem = new Item(newItemData);
    await newItem.save();

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding item:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id).populate("sharerId", "fullName email photoURL");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.sharerId.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized to edit this item" });

    let updatedData = { ...req.body };

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/items",
      });

      updatedData.image = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const updated = await Item.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Item updated successfully", item: updated });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getAllItems = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const items = await Item.find({ sharerId: { $ne: userId }}).populate("sharerId", "fullName email photoURL");
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserItems = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userItems = await Item.find({ sharerId: req.user.userId });
    res.status(200).json(userItems);
  } catch (error) {
    console.error("Error fetching user items:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.sharerId.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized to delete this item" });

    await Item.findByIdAndDelete(id);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 module.exports={createItem,updateItem,getAllItems,getUserItems,deleteItem,getItemById}