import express from "express";
import {
  Newcoupon,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/payment.js";
import { adminAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/coupon/new", adminAccess, Newcoupon);

router.post("/create", createPaymentIntent);

router.get("/discount", applyDiscount);

router.get("/coupon/all", adminAccess, getAllCoupons);

router.delete("/coupon/:id", adminAccess, deleteCoupon);

export default router;
