import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: [true, "Please enter address"],
      },
      city: {
        type: String,
        required: [true, "Please enter address"],
      },
      country: {
        type: String,
        required: [true, "Please enter address"],
      },
      state: {
        type: String,
        required: [true, "Please enter address"],
      },
      pincode: {
        type: Number,
        required: [true, "Please enter address"],
      },
    },
    user: {
      type: String,
      ref: "user",
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
      default:0
    },
    discount: {
      type: Number,
      required: true,
      default:0
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        name: String,
        photo: String,
        price: Number,
        quantity: Number,
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
