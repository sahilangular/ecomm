import mongoose from "mongoose";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  gender: "male" | "female";
  image: string;
  role: "user " | "admin";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  age: number;
}

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter ID"],
    },
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    email: {
      type: String,
      unique: [true, "Email already exist"],
      required: [true, "Please enter email"],
      match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/, //email validation
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please select gender"],
    },
    photo: {
      type: String,
      required: [true, "Please add photo"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dob: {
      type: Date,
      required: [true, "Please provide your date of birth"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  const todayDate = new Date();
  const dob = this.dob;

  let age = todayDate.getFullYear() - dob.getFullYear();

  if (
    todayDate.getMonth() < dob.getMonth() ||
    (todayDate.getMonth() === dob.getMonth() &&
      todayDate.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});

const userModel = mongoose.model<IUser>("user", userSchema);

export default userModel;
