import mongoose, { Document } from "mongoose";
import { orderItemsType } from "../types/types.js";
import productModel from "../models/product.js";
import errorHandler from "./utility-class.js";
import cartModel from "../models/cart.js";

interface myDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

interface func {
  length: number;
  docArr: myDocument[];
  today: Date;
  property?: "discount" | "total";
}

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri)
    .then((res) => {
      console.log("database connected successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

export const reduceStock = async (orderItems: orderItemsType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await productModel.findById(order.productId);

    if (!product) return new errorHandler("invalid order", 401);

    product.stock -= order.quantity;

    await product.save();

    console.log(order.productId);

    await cartModel.findOneAndDelete({ productId: order.productId });
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return percent.toFixed(0);
};

export const getChartData = ({ length, docArr, today, property }: func) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const createdDate = i.createdAt;
    const monthDiff = (today.getMonth() - createdDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
