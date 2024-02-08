import express from "express";
import { adminAccess } from "../middleware/auth.js";
import {
  getBarChart,
  getDashBoardStats,
  getLineChart,
  getPieChart,
} from "../controllers/stats.js";

const router = express.Router();

router.get("/stats", adminAccess, getDashBoardStats);
router.get("/pie", adminAccess, getPieChart);
router.get("/bar", adminAccess, getBarChart);
router.get("/line", adminAccess, getLineChart);

export default router;
