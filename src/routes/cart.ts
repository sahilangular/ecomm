import express from "express";
import { allCart, calculatePrice, createCart, decQuantity, deleteCart, incQuantity } from "../controllers/cart.js";

const router = express.Router();

router.post("/new", createCart);
router.post("/dec/:id", decQuantity);
router.post("/:id", incQuantity);
router.get("/all", allCart);
router.get("/price", calculatePrice);
router.delete("/:id", deleteCart);


export default router;
