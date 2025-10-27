const express = require("express");
const router = express.Router();
const {
  reserveItem,
  updateReservationStatus,
  getUserReservations,
  getOwnerReservations,
} = require("../controllers/reservationController");
const auth = require("../middlewares/auth");

router.post("/", auth, reserveItem);

router.put("/:reservationId", auth, updateReservationStatus);

router.get("/my-reservations", auth, getUserReservations);

router.get("/owner-reservations", auth, getOwnerReservations);

module.exports = router;
