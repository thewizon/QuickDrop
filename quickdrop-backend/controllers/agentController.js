const User = require("../models/User");
const bcrypt = require("bcryptjs");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Admin creates a delivery agent account
const createAgent = asyncHandler(async (req, res) => {
  const { name, email, password, phone, zone } = req.body;

  if (!name || !email || !password || !phone) {
    throw new ApiError(400, "All fields are required.");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const agent = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: "agent",
    zone: zone || null,
  });

  return res.status(201).json(
    new ApiResponse(201, "Agent created successfully.", {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      zone: agent.zone,
    })
  );
});

// Admin lists all agents (for manual assignment dropdowns, etc.)
const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: "agent" })
    .select("-password")
    .populate("zone", "zoneName");

  return res.status(200).json(
    new ApiResponse(200, "Agents fetched successfully.", {
      count: agents.length,
      agents,
    })
  );
});

// Admin assigns/updates an agent's home zone
const updateAgentZone = asyncHandler(async (req, res) => {
  const { zone } = req.body;

  const agent = await User.findOneAndUpdate(
    { _id: req.params.id, role: "agent" },
    { zone },
    { new: true }
  ).select("-password");

  if (!agent) {
    throw new ApiError(404, "Agent not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Agent zone updated successfully.", agent));
});

// Agent updates their own availability + current location
const updateMyStatus = asyncHandler(async (req, res) => {
  const { isAvailable, latitude, longitude } = req.body;

  const update = {};
  if (isAvailable !== undefined) update.isAvailable = isAvailable;
  if (latitude !== undefined && longitude !== undefined) {
    update.currentLocation = { latitude, longitude };
  }

  const agent = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
  }).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Status updated successfully.", agent));
});

module.exports = {
  createAgent,
  getAllAgents,
  updateAgentZone,
  updateMyStatus,
};
