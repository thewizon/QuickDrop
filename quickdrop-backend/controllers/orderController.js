const Order = require("../models/Order");
const Zone = require("../models/Zone");
const User = require("../models/User");
const TrackingHistory = require("../models/TrackingHistory");

const { calculateCharge } = require("../utils/calculateCharge");
const { detectZoneFromAddress } = require("../utils/detectZone");
const { autoAssignAgent } = require("../utils/autoAssignAgent");
const sendEmail = require("../utils/sendEmail");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const STATUS_LABELS = {
  created: "Order Created",
  assigned: "Agent Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed: "Delivery Failed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
};

const notifyCustomer = async (order, status, extraMessage = "") => {
  const customer = await User.findById(order.customer);
  if (!customer) return;

  await sendEmail({
    to: customer.email,
    subject: `Order ${order.orderNumber}: ${STATUS_LABELS[status] || status}`,
    text: `Hi ${customer.name},\n\nYour order ${order.orderNumber} status is now "${STATUS_LABELS[status] || status}". ${extraMessage}\n\n- QuickDrop`,
  });
};

// ===== Create Order (customer, or admin on behalf of a customer) =====
const createOrder = asyncHandler(async (req, res) => {
  const {
    customerId, // optional, admin only
    pickupAddress,
    deliveryAddress,
    orderType,
    paymentType,
    length,
    breadth,
    height,
    actualWeight,
  } = req.body;

  if (
    !pickupAddress ||
    !deliveryAddress ||
    !orderType ||
    !paymentType ||
    !length ||
    !breadth ||
    !height ||
    !actualWeight
  ) {
    throw new ApiError(400, "All order fields are required.");
  }

  if (!["B2B", "B2C"].includes(orderType)) {
    throw new ApiError(400, "orderType must be B2B or B2C.");
  }

  if (!["Prepaid", "COD"].includes(paymentType)) {
    throw new ApiError(400, "paymentType must be Prepaid or COD.");
  }

  // Admin can place an order on behalf of a customer
  let customer = req.user.id;

  if (req.user.role === "admin") {
    if (!customerId) {
      throw new ApiError(400, "customerId is required when admin creates an order.");
    }

    const customerUser = await User.findById(customerId);
    if (!customerUser || customerUser.role !== "customer") {
      throw new ApiError(400, "Invalid customerId.");
    }

    customer = customerId;
  }

  // Auto-detect pickup & delivery zones from the address text
  const pickupZone = await detectZoneFromAddress(pickupAddress);
  const deliveryZone = await detectZoneFromAddress(deliveryAddress);

  const charge = await calculateCharge({
    pickupZoneId: pickupZone._id,
    deliveryZoneId: deliveryZone._id,
    orderType,
    paymentType,
    length: Number(length),
    breadth: Number(breadth),
    height: Number(height),
    actualWeight: Number(actualWeight),
  });

  const orderNumber = "QD-" + Date.now().toString().slice(-8);

  const order = await Order.create({
    orderNumber,
    customer,
    createdBy: req.user.id,

    pickupZone: pickupZone._id,
    deliveryZone: deliveryZone._id,
    pickupAddress,
    deliveryAddress,

    orderType,
    paymentType,

    length,
    breadth,
    height,
    actualWeight,
    volumetricWeight: charge.volumetricWeight,
    chargeableWeight: charge.chargeableWeight,

    zoneType: charge.zoneType,
    baseCharge: charge.baseCharge,
    pricePerKg: charge.pricePerKg,
    codSurcharge: charge.codSurcharge,
    deliveryCharge: charge.deliveryCharge,
    estimatedDays: charge.estimatedDays,
  });

  await TrackingHistory.create({
    order: order._id,
    status: "created",
    updatedBy: req.user.id,
    note: "Order created",
  });

  await notifyCustomer(order, "created");

  return res
    .status(201)
    .json(new ApiResponse(201, "Order created successfully.", order));
});

// ===== Get all orders (admin) with optional filters =====
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, zone, agent } = req.query;
  const query = {};

  if (status) query.orderStatus = status;
  if (agent) query.assignedAgent = agent;
  if (zone) {
    query.$or = [{ pickupZone: zone }, { deliveryZone: zone }];
  }

  const orders = await Order.find(query)
    .populate("customer", "name email phone")
    .populate("pickupZone", "zoneName")
    .populate("deliveryZone", "zoneName")
    .populate("assignedAgent", "name email phone")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully.", {
      count: orders.length,
      orders,
    })
  );
});

// ===== Get my orders (customer / agent) =====
const getMyOrders = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === "customer") {
    query.customer = req.user.id;
  } else if (req.user.role === "agent") {
    query.assignedAgent = req.user.id;
  }

  const orders = await Order.find(query)
    .populate("customer", "name phone")
    .populate("pickupZone", "zoneName")
    .populate("deliveryZone", "zoneName")
    .populate("assignedAgent", "name phone")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully.", {
      count: orders.length,
      orders,
    })
  );
});

// ===== Get single order by id =====
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("pickupZone", "zoneName")
    .populate("deliveryZone", "zoneName")
    .populate("assignedAgent", "name email phone");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // Customers/agents may only view their own orders
  if (
    req.user.role === "customer" &&
    order.customer._id.toString() !== req.user.id
  ) {
    throw new ApiError(403, "You cannot view this order.");
  }

  if (
    req.user.role === "agent" &&
    (!order.assignedAgent || order.assignedAgent._id.toString() !== req.user.id)
  ) {
    throw new ApiError(403, "You cannot view this order.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order fetched successfully.", order));
});

// ===== Manual agent assignment (admin) =====
const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;

  if (!agentId) {
    throw new ApiError(400, "Agent ID is required.");
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== "agent") {
    throw new ApiError(400, "Invalid delivery agent.");
  }

  order.assignedAgent = agentId;
  order.orderStatus = "assigned";
  await order.save();

  await TrackingHistory.create({
    order: order._id,
    status: "assigned",
    updatedBy: req.user.id,
    note: `Agent ${agent.name} manually assigned`,
  });

  await notifyCustomer(order, "assigned");

  return res
    .status(200)
    .json(new ApiResponse(200, "Agent assigned successfully.", order));
});

// ===== Auto-assignment (admin triggers; picks nearest available agent) =====
const autoAssign = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("pickupZone");
  if (!order) throw new ApiError(404, "Order not found.");

  const agent = await autoAssignAgent({
    pickupZoneId: order.pickupZone._id,
  });

  if (!agent) {
    throw new ApiError(409, "No available delivery agent found for auto-assignment.");
  }

  order.assignedAgent = agent._id;
  order.orderStatus = "assigned";
  await order.save();

  await TrackingHistory.create({
    order: order._id,
    status: "assigned",
    updatedBy: req.user.id,
    note: `Auto-assigned to nearest available agent: ${agent.name}`,
  });

  await notifyCustomer(order, "assigned");

  return res
    .status(200)
    .json(new ApiResponse(200, "Agent auto-assigned successfully.", order));
});

// ===== Update order status (agent updates own order; admin can override any) =====
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, failureReason } = req.body;

  const validStatuses = [
    "assigned",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed",
    "cancelled",
  ];

  if (!validStatuses.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status.");
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  // Agents may only update orders assigned to them
  if (
    req.user.role === "agent" &&
    (!order.assignedAgent || order.assignedAgent.toString() !== req.user.id)
  ) {
    throw new ApiError(403, "You are not assigned to this order.");
  }

  order.orderStatus = orderStatus;

  let note = `Status changed to ${STATUS_LABELS[orderStatus] || orderStatus}`;

  if (orderStatus === "failed") {
    order.deliveryAttempts += 1;
    order.failureReason = failureReason || "Delivery attempt failed";
    note = `Delivery failed: ${order.failureReason}`;
  }

  await order.save();

  await TrackingHistory.create({
    order: order._id,
    status: orderStatus,
    updatedBy: req.user.id,
    note,
  });

  await notifyCustomer(
    order,
    orderStatus,
    orderStatus === "failed"
      ? "You can request a reschedule from your dashboard."
      : ""
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Order status updated successfully.", order));
});

// ===== Reschedule a failed delivery (customer requests, agent gets reassigned) =====
const rescheduleOrder = asyncHandler(async (req, res) => {
  const { rescheduledDate } = req.body;

  if (!rescheduledDate) {
    throw new ApiError(400, "rescheduledDate is required.");
  }

  const order = await Order.findById(req.params.id).populate("pickupZone");
  if (!order) throw new ApiError(404, "Order not found.");

  if (order.orderStatus !== "failed") {
    throw new ApiError(400, "Only failed deliveries can be rescheduled.");
  }

  if (
    req.user.role === "customer" &&
    order.customer.toString() !== req.user.id
  ) {
    throw new ApiError(403, "You cannot reschedule this order.");
  }

  order.rescheduledDate = new Date(rescheduledDate);
  order.orderStatus = "rescheduled";

  // Re-assign to the nearest available agent for the new attempt
  const agent = await autoAssignAgent({ pickupZoneId: order.pickupZone._id });
  order.assignedAgent = agent ? agent._id : null;

  await order.save();

  await TrackingHistory.create({
    order: order._id,
    status: "rescheduled",
    updatedBy: req.user.id,
    note: `Rescheduled to ${order.rescheduledDate.toDateString()}${agent ? `, reassigned to ${agent.name}` : " (no agent available yet)"}`,
  });

  await notifyCustomer(order, "rescheduled");

  return res
    .status(200)
    .json(new ApiResponse(200, "Order rescheduled successfully.", order));
});

// ===== Full immutable tracking timeline =====
const getOrderTracking = asyncHandler(async (req, res) => {
  const history = await TrackingHistory.find({ order: req.params.id })
    .populate("updatedBy", "name role")
    .sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(200, "Tracking history fetched successfully.", {
      count: history.length,
      history,
    })
  );
});

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  assignAgent,
  autoAssign,
  updateOrderStatus,
  rescheduleOrder,
  getOrderTracking,
};
