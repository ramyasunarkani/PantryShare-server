const mongoose = require("mongoose");

const reservedItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },

    reservedAt: {
      type: Date,
      default: Date.now,
    },
   
   
  },
  { timestamps: true }
);

const ReservedItem = mongoose.model("ReservedItem", reservedItemSchema);

module.exports = ReservedItem;
