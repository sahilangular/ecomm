import { Request } from "express";
import { tryCatch } from "../middleware/error.js";
import { cartInfo, reqQuery } from "../types/types.js";
import errorHandler from "../utils/utility-class.js";
import cartModel from "../models/cart.js";

const createCart = tryCatch(
  async (req: Request<{}, {}, cartInfo>, res, next) => {
    const { photo, price, name, quantity, stock, productId, user } = req.body;

    if (!name || !price || !quantity || !stock || !productId || !photo || !user)
      return next(new errorHandler("all fields required", 404));


    const cartItem = await cartModel.findOne({ productId: productId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem?.save();
    } else {
      const cart = await cartModel.create({
        photo,
        price,
        name,
        quantity,
        stock,
        productId,
        user,
      });
    }

    res.status(201).json({
      success: true,
      message: "item added to cart",
    });
  }
);

const allCart = tryCatch(async (req, res, next) => {
  const { id } = req.query;

  const cart = await cartModel
    .find({ user: id })
    .select(["productId", "name", "price", "photo", "quantity", "stock"]);
  console.log(cart);

  res.status(201).json({
    success: true,
    cart,
  });
});

const incQuantity = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  const cartItem = await cartModel.findById(id);

  if (!cartItem) return next(new errorHandler("cartItne not found", 404));

  cartItem.quantity += 1;

  await cartItem.save();

  res.status(201).json({
    success: true,
  });
});

const decQuantity = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  const cartItem = await cartModel.findById(id);

  if (!cartItem) return next(new errorHandler("cartItne not found", 404));

  cartItem.quantity -= 1;

  await cartItem.save();
  res.status(201).json({
    success: true,
  });
});

const deleteCart = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  await cartModel.findByIdAndDelete(id);

  res.status(201).json({
    success: true,
  });
});

const calculatePrice = tryCatch(async (req, res, next) => {
  
  const cartItems = await cartModel.find({});
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];

    subtotal += item.price * item.quantity;
  }

  let shippingCharges = subtotal > 1000 ? 0 : 200;
  let tax = Math.round(subtotal * 0.18);
  let discount = 0;
  let total = subtotal + shippingCharges + tax - discount;

  const pricing = {
    shippingCharges,
    subtotal,
    tax,
    discount,
    total,
  };

  res.status(200).json({
    success: true,
    pricing,
  });
});


export {
  createCart,
  allCart,
  deleteCart,
  incQuantity,
  decQuantity,
  calculatePrice,
};
