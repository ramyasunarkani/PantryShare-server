const mongoose =require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    expiryDate: { type: Date, required: true },
    postedAt: { type: Date, default: Date.now },
    tags: [{ type: String }],

    status: {
      type: String,
      enum: ["available", "reserved"],
      default: "available",
    },

    sharerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
module.exports=Item;
