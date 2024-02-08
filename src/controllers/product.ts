import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middleware/error.js";
import {
  baseQuery,
  getProductQueryParams,
  newProductRequestBody,
} from "../types/types.js";
import productModel from "../models/product.js";
import errorHandler from "../utils/utility-class.js";
import { rm } from "fs";

const newProduct = tryCatch(
  async (
    req: Request<{}, {}, newProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;

    if (!name || !category || !price || !stock || !photo)
      return next(new errorHandler("Please enter all fields", 400));

    const product = await productModel.create({
      name,
      category: category.toLowerCase(),
      price,
      stock,
      photo: photo?.path,
    });

    return res.status(201).json({
      message: "product created successfully",
      product,
    });
  }
);

export const latestProduct = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await productModel.find({}).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      products,
    });
  }
);

const getAllCategories = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await productModel.distinct("category");

    return res.status(200).json({
      categories,
    });
  }
);

const getAdminProducts = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await productModel.find({});

    return res.status(200).json({
      products,
    });
  }
);

const getProductDetail = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const products = await productModel.findById(id);

    return res.status(200).json({
      success:true,
      products,
    });
  }
);

const updateProduct = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;

  const photo = req.file;

  const product = await productModel.findById(id);

  if (!product) return next(new errorHandler("invalid id", 404));

  if (photo) {
    rm(product?.photo!, () => {
      console.log("product deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  res.status(200).json({
    sucess: true,
    message: "product updated successfully",
  });
});

const deleteProduct = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new errorHandler("invalid id", 404));

  const product = await productModel.findById(id);

  if (!product) return next(new errorHandler("product not found", 404));

  console.log(product.photo);

  rm(product?.photo, () => {
    console.log("photo deleted");
  });

  await productModel.findByIdAndDelete(id);

  res.status(200).json({
    sucess: true,
    message: "product deleted successfully",
  });
});

const getAllProducts = tryCatch(
  async (req: Request<{}, {}, {}, getProductQueryParams>, res, next) => {
    const { category, search, sort, price } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const BaseQuery: baseQuery = {};

    if (search)
      BaseQuery.name = {
        $regex: search,
        $options: "i", //case insensitive
      };

    if (price)
      BaseQuery.price = {
        $lte: Number(price),
      };

    if (category) BaseQuery.category = category;

    const productsPromise = await productModel
      .find(BaseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filterProducts] = await Promise.all([
      productsPromise,
      productModel.find(BaseQuery),
    ]);

    console.log(products);

    const totalPage = Math.ceil(filterProducts.length / limit);

    return res.status(200).json({
      success:true,
      products,
      totalPage,
    });
  }
);

export {
  newProduct,
  getAllCategories,
  getAdminProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
