import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "product",
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
    },
    user: {
      type: String,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true, // Saves createdAt and updatedAt as dates (default=false)
  }
);

const cartModel = mongoose.model("cart", cartSchema);
export default cartModel;
