import express from "express";
import { allOrder, deleteOrder, getOrderDetail, myOrder, newOrder, processOrder } from "../controllers/order.js";
import { adminAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", newOrder);
router.get("/my", myOrder);
router.get("/all", allOrder);
router.get("/:id", getOrderDetail);
router.put("/:id",adminAccess,processOrder);
router.delete("/:id",adminAccess, deleteOrder);

export default router;
