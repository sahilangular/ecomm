import { tryCatch } from "./error.js";
import errorHandler from "../utils/utility-class.js";
import userModel from "../models/user.js";

const adminAccess = tryCatch(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new errorHandler("Please login first", 401));

  const user = await userModel.findById(id);

  if (!user) return next(new errorHandler("user not found", 400));

  if (user?.role !== "admin") return new errorHandler("admin user only", 404);

  next();
});

export { adminAccess };
