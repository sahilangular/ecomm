import { NextFunction, Response, Request } from "express";

export interface newUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}

export interface newProductRequestBody {
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface getProductQueryParams {
  search?: string;
  category?: string;
  sort?: string;
  price?: number;
  page?: number;
}

 export type cartInfo ={
  productId:string,
  name:string,
  price:number,
  photo:string,
  quantity:number,
  stock:number
  user:string
}


export interface orderItemsType{
  name:string,
  photo:string,
  price:number,
  quantity:number,
  productId:string;
}

export interface shippingInfoType{
  address:string,
  city:string,
  country:string,
  state:string,
  pincode:number;
}

export interface newOrderRequestBody {
  shippingInfo: shippingInfoType ;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  total: number;
  orderItems: orderItemsType[];
}

export interface baseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $lte: number;
  };
  category?: string;
}

export type errorController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response<any, Record<string, any>> | Error | void>;

export type reqQuery={
  discount:number
}
