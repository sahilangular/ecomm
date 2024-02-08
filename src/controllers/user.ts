import { NextFunction, Request, Response } from "express";
import { newUserRequestBody } from "../types/types.js";
import userModel from "../models/user.js";
import { tryCatch } from "../middleware/error.js";
import errorHandler from "../utils/utility-class.js";

const newUser = tryCatch(
  async (
    req: Request<{}, {}, newUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    if (!name || !email || !photo || !gender || !_id || !dob) {
      return new errorHandler("Please enter all fields", 404);
    }

    let user = await userModel.findById(_id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: `welcome ${user.name}`,
      });
    }

    user = await userModel.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    console.log(user);

    return res.status(200).json({
      success: true,
      message: `welcome ${user.name}`,
    });
  }
);

const getAllUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userModel.find({});

    return res.status(200).json({
      success: true,
      users,
    });
  }
);

const getUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(id)

    const user = await userModel.findById(id);
    if (!user) {
      return new errorHandler("invalid id", 400);
    }

    return res.status(200).json({
      success: true,
      user,
    });
  }
);

const deleteUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) {
      return new errorHandler("invalid id", 400);
    }
    await userModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  }
);

export { newUser, getAllUser, getUser, deleteUser };
