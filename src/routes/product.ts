import express from "express";
import {
    deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getProductDetail,
  latestProduct,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middleware/multer.js";
import { adminAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", adminAccess, singleUpload, newProduct);

router.get("/all",getAllProducts);

router.get("/latest", latestProduct);

router.get("/categories", getAllCategories);

router.get("/admin-products",adminAccess, getAdminProducts);

router.get('/:id',getProductDetail);

router.put('/:id',adminAccess,singleUpload,updateProduct)

router.delete('/:id',adminAccess,deleteProduct)

export default router;
