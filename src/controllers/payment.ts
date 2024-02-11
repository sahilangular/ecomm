import { stripe } from "../app.js";
import { tryCatch } from "../middleware/error.js";
import couponModel from "../models/coupon.js";
import errorHandler from "../utils/utility-class.js";

const createPaymentIntent = tryCatch(async (req, res, next) => {
  const { amount, name, shippingInfo } = req.body;

  if (!amount || !name || !shippingInfo)
    return next(new errorHandler("Please enter amount", 401));

  const { city, address, state, country, pincode } = shippingInfo;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "INR",
    description: "Ecommerce order payment",
    shipping: {
      name: name,
      address: {
        line1: address,
        postal_code: pincode,
        city: city,
        state: state,
        country: country,
      },
    },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

const Newcoupon = tryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  if (!code || !amount)
    return next(new errorHandler("All fields are required", 401));

  const coupen = await couponModel.create({
    code,
    amount,
  });

  res.status(200).json({
    success: true,
    message: `coupon  ${code}, created successfully`,
  });
});

const applyDiscount = tryCatch(async (req, res, next) => {
  const { code } = req.query;

  const discount = await couponModel.findOne({ code: code });

  if (!discount) return next(new errorHandler("invalid coupon", 400));

  res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

const getAllCoupons = tryCatch(async (req, res, next) => {
  const coupons = await couponModel.findOne({});

  if (!coupons) return next(new errorHandler("No coupon found", 400));

  res.status(200).json({
    success: true,
    coupons,
  });
});

const deleteCoupon = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  await couponModel.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "coupon deleted successfully",
  });
});

export {
  Newcoupon,
  applyDiscount,
  getAllCoupons,
  deleteCoupon,
  createPaymentIntent,
};
