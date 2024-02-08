import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: [true,'Please enter coupen code'],unique:true },
    amount: { type: Number, required: [true,'Please enter the discount amount'] }
})

const couponModel = mongoose.model('coupen',couponSchema)

export default couponModel;