import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middleware/error.js";
import productModel from "../models/product.js";
import userModel from "../models/user.js";
import orderModel from "../models/orders.js";
import { calculatePercentage, getChartData } from "../utils/feature.js";

const getDashBoardStats = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let stats = {};
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const startDateofThisMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const endDateofThisMonth = today;

    const startDateofLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const endDateofLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    const thisMonthProduct = productModel.find({
      createdAt: {
        $gte: startDateofThisMonth,
        $lte: endDateofThisMonth,
      },
    });

    const lastMonthProduct = productModel.find({
      createdAt: {
        $gte: startDateofLastMonth,
        $lte: endDateofLastMonth,
      },
    });

    const thisMonthUser = userModel.find({
      createdAt: {
        $gte: startDateofThisMonth,
        $lte: endDateofThisMonth,
      },
    });

    const lastMonthUser = userModel.find({
      createdAt: {
        $gte: startDateofLastMonth,
        $lte: endDateofLastMonth,
      },
    });

    const thisMonthOrders = orderModel.find({
      createdAt: {
        $gte: startDateofThisMonth,
        $lte: endDateofThisMonth,
      },
    });

    const lastMonthOrders = orderModel.find({
      createdAt: {
        $gte: startDateofLastMonth,
        $lte: endDateofLastMonth,
      },
    });

    const lastSixMonthsOrdersPromise = orderModel.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const lastTransaction = orderModel
      .find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrder,
      lastMonthProducts,
      lastMonthOrder,
      lastMonthUsers,
      products,
      users,
      allOrders,
      lastSixMonthsOrders,
      categories,
      femaleCount,
      lastTransactionPromise,
    ] = await Promise.all([
      thisMonthProduct,
      thisMonthUser,
      thisMonthOrders,
      lastMonthProduct,
      lastMonthOrders,
      lastMonthUser,
      productModel.countDocuments(),
      userModel.countDocuments(),
      orderModel.find({}).select("total"),
      lastSixMonthsOrdersPromise,
      productModel.distinct("category"),
      userModel.countDocuments({ gender: "female" }),
      lastTransaction,
    ]);

    const thisMonthRevenue = thisMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const revenue = calculatePercentage(thisMonthRevenue, lastMonthRevenue);

    const allOrderRevenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const counts = {
      users,
      products,
      orders: allOrders.length,
    };

    const orderMonthsCount = new Array(6).fill(0);
    const orderMonthyRevenue = new Array(6).fill(0);

    lastSixMonthsOrders.forEach((order) => {
      const createdDate = order.createdAt;
      const monthDiff = (today.getMonth() - createdDate.getMonth() + 12) % 12;

      if (monthDiff < 6) {
        orderMonthsCount[5 - monthDiff] += 1;
        orderMonthyRevenue[5 - monthDiff] += order.total;
      }
    });

    const userPercentage = calculatePercentage(
      thisMonthUsers.length,
      lastMonthUsers.length
    );
    const productPercentage = calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    );
    const orderPercentage = calculatePercentage(
      thisMonthOrder.length,
      lastMonthOrder.length
    );

    const categoryPromise = categories.map((category, index) =>
      productModel.countDocuments({ category })
    );

    const categoryCountPromise = await Promise.all(categoryPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: (categoryCountPromise[i] / products) * 100,
      });
    });

    const ratio = {
      female: femaleCount,
      male: users - femaleCount,
    };

    const modifiedTransaction = lastTransactionPromise.map((i) => ({
      _id: i._id,
      discount: i.discount,
      status: i.status,
      amount: i.total,
      quantity: i.orderItems.length,
    }));

    stats = {
      userPercentage,
      productPercentage,
      orderPercentage,
      revenue,
      allOrderRevenue,
      counts,
      chart: {
        order: orderMonthsCount,
        revenue: orderMonthyRevenue,
      },
      categoryCount,
      ratio,
      lastTransaction: modifiedTransaction,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  }
);
const getPieChart = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let chart = {};

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      productCount,
      categories,
      outOfStock,
      allOrder,
      allDob,
      adminUser,
      customer,
      allUsers,
    ] = await Promise.all([
      orderModel.countDocuments({ status: "Processing" }),
      orderModel.countDocuments({ status: "Shipped" }),
      orderModel.countDocuments({ status: "Delivered" }),
      productModel.countDocuments({}),
      productModel.distinct("category"),
      productModel.countDocuments({ stock: 0 }),
      orderModel
        .find({})
        .select(["total", "discount", "subtotal", "tax", "shippingCharges"]),
      userModel.find({}).select("dob"),
      userModel.countDocuments({ role: "admin" }),
      userModel.countDocuments({ role: "user" }),
      userModel.find({}),
    ]);

    const countCategory = categories.map((category) =>
      productModel.countDocuments({ category })
    );

    const categoryPromise = await Promise.all(countCategory);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: (categoryPromise[i] / productCount) * 100,
      });
    });

    let stock = {
      inStock: productCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const discount = allOrder.reduce(
      (total, order) => total + (order.discount || 0),
      0
    );
    const productionCost = allOrder.reduce(
      (total, order) => total + (order.shippingCharges || 0),
      0
    );
    const burnt = allOrder.reduce(
      (total, order) => total + (order.tax || 0),
      0
    );
    const marketingCost = Math.round((grossIncome * 30) / 100);

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const adminCustomer = {
      admin: adminUser,
      customer: customer,
    };

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age <= 40).length,
      old: allUsers.filter((i) => i.age > 40).length,
    };

    chart = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
      categoryCount,
      stock,
      revenueDistribution,
      adminCustomer: adminCustomer,
      usersAgeGroup,
    };

    res.status(200).json({
      success: true,
      chart,
    });
  }
);
const getBarChart = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let chart;

    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const twelveMonthAgo = new Date();
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

    const sixMonthAgoProductsPromise = productModel
      .find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const sixMonthAgoUsersPromise = userModel
      .find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const twelveMonthAgoOrdersPromise = orderModel
      .find({
        createdAt: {
          $gte: twelveMonthAgo,
          $lte: today,
        },
      })
      .select("createdAt");

    const [sixMonthAgoProducts, sixMonthAgoUsers, twelveMonthAgoOrders] =
      await Promise.all([
        sixMonthAgoProductsPromise,
        sixMonthAgoUsersPromise,
        twelveMonthAgoOrdersPromise,
      ]);

    const products = getChartData({
      length: 6,
      docArr: sixMonthAgoProducts,
      today,
    });

    const userCounts = getChartData({
      length: 6,
      docArr: sixMonthAgoUsers,
      today: today,
    });

    const ordersCounts = getChartData({
      length: 12,
      docArr: twelveMonthAgoOrders,
      today: today,
    });

    chart = {
      products: products,
      users: userCounts,
      orders: ordersCounts,
    };

    res.status(200).json({
      success: true,
      chart,
    });
  }
);

const getLineChart = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let chart;

    const today = new Date();

    const twelveMonthAgo = new Date();
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

    const twelveMonthAgoProductPromise = productModel
    .find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    })
    .select("createdAt");

    const twelveMonthAgoUserPromise = userModel
    .find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    })
    .select("createdAt");


    const twelveMonthAgoOrdersPromise = orderModel
      .find({
        createdAt: {
          $gte: twelveMonthAgo,
          $lte: today,
        },
      })
      .select(['createdAt','discount','total']);

    const [twelveMonthAgoProduct, twelveMonthAgoUser, twelveMonthAgoOrders] =
      await Promise.all([
        twelveMonthAgoProductPromise,
        twelveMonthAgoUserPromise,
        twelveMonthAgoOrdersPromise,
      ]);

    const products = getChartData({
      length: 12,
      docArr: twelveMonthAgoProduct,
      today,
    });

    const userCounts = getChartData({
      length: 12,
      docArr: twelveMonthAgoUser,
      today: today,
    });

    const discount = getChartData({
      length: 12,
      docArr: twelveMonthAgoOrders,
      today: today,
      property:"discount",
    });

    const revenue = getChartData({
      length: 12,
      docArr: twelveMonthAgoOrders,
      today: today,
      property:"total",
    });

    chart = {
      product: products,
      user: userCounts,
      discount,
      revenue
    };

    res.status(200).json({
      success: true,
      chart,
    });
  }
);

export { getDashBoardStats, getBarChart, getLineChart, getPieChart };
