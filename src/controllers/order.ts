import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middleware/error.js";
import { newOrderRequestBody } from "../types/types.js";
import orderModel from "../models/orders.js";
import { reduceStock } from "../utils/feature.js";
import errorHandler from "../utils/utility-class.js";
import cartModel from "../models/cart.js";

const newOrder = tryCatch(
  async (
    req: Request<{}, {}, newOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharge,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new errorHandler("Please enter all fields", 404));

    const order = await orderModel.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharge,
      discount,
      total,
    });

    await reduceStock(orderItems);

    res.status(201).json({
      success: true,
      message:'Your order is placed'
    });
  }
);

const myOrder = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    const orders = await orderModel.find({ user: id });

    res.status(201).json({
      success: true,
      orders,
    });
  }
);

const allOrder = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderModel.find({}).populate("user", "name");
    console.log(orders);

    res.status(201).json({
      success: true,
      orders,
    });
  }
);

const getOrderDetail = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const order = await orderModel.findById(id);

    if (!order) return next(new errorHandler("order not found!", 401));

    res.status(201).json({
      success: true,
      order,
    });
  }
);

const processOrder = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const order = await orderModel.findById(id);

    if (!order) return next(new errorHandler("order not found", 404));

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;

      default:
        order.status = "Delivered";
        break;
    }

    await order.save();

    res.status(201).json({
      success: true,
      message:'order update successfully',
      order,
    });
  }
);

const deleteOrder = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
  
      await orderModel.findByIdAndDelete(id);
  
      res.status(201).json({
        success: true,
        message:'order delete successfully'
      });
    }
  );

export { newOrder, myOrder, allOrder, getOrderDetail,processOrder,deleteOrder };
