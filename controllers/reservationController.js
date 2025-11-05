const ReservedItem = require("../models/ReservedItem");
const Item = require("../models/Item");



const reserveItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.sharerId.toString() === userId) {
      return res.status(400).json({ message: "You cannot reserve your own item." });
    }

    const existingReservation = await ReservedItem.findOne({ userId, itemId });
    if (existingReservation) {
      return res.status(400).json({ message: "You already reserved this item." });
    }

    if (item.status === "reserved") {
      return res.status(400).json({ message: "This item is already reserved by another user." });
    }

    const newReservation = await ReservedItem.create({
      userId,
      itemId,
      status: "PENDING",
    });

    item.status = "reserved";
    item.reservedBy = userId;
    await item.save();

    res.status(201).json({
      message: "Item reserved successfully!",
      reservation: newReservation,
    });
  } catch (err) {
    console.error("Error in reserveItem:", err);
    res.status(500).json({
      message: "Failed to reserve item",
      error: err.message,
    });
  }
};


const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const reservation = await ReservedItem.findById(reservationId).populate("itemId");
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (reservation.itemId.sharerId.toString() !== userId) {
      return res.status(403).json({ message: "You can only update reservations for your items" });
    }

    reservation.status = status;
    await reservation.save();

    res.status(200).json({
      message: `Reservation ${status.toLowerCase()} successfully.`,
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update reservation status", error: err.message });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reservations = await ReservedItem.find({ userId })
      .populate({
        path: "itemId",
        select: "title description imageUrl expiryDate sharerId",
        populate: {
          path: "sharerId",
          select: "fullName email photoURL", 
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch reservations",
      error: err.message,
    });
  }
};


const getOwnerReservations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await Item.find({ sharerId: userId });
    const itemIds = items.map((item) => item._id);

    const reservations = await ReservedItem.find({ itemId: { $in: itemIds } })
  .populate("userId", "fullName email photoURL") 
  .populate({
    path: "itemId",
    select: "title description imageUrl expiryDate sharerId reservedBy",
    populate: [
      { path: "sharerId", select: "fullName email photoURL" },
      { path: "reservedBy", select: "fullName email photoURL" },
    ],
  })
  .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch owner reservations", error: err.message });
  }
};

module.exports={reserveItem,updateReservationStatus,getUserReservations,getOwnerReservations,}