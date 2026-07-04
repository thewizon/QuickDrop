const Zone = require("../models/Zone");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Create Zone
const createZone = asyncHandler(async (req, res) => {
  const { zoneName, areas } = req.body;

  if (!zoneName || !areas || !Array.isArray(areas)) {
    throw new ApiError(400, "Zone name and areas are required.");
  }

  const existingZone = await Zone.findOne({ zoneName });

  if (existingZone) {
    throw new ApiError(400, "Zone already exists.");
  }

  const zone = await Zone.create({
    zoneName,
    areas,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Zone created successfully.", zone));
});

// Get All Zones
const getAllZones = asyncHandler(async (req, res) => {
  const zones = await Zone.find();

  return res.status(200).json(
    new ApiResponse(200, "Zones fetched successfully.", {
      count: zones.length,
      zones,
    })
  );
});

// Get Zone By ID
const getZoneById = asyncHandler(async (req, res) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    throw new ApiError(404, "Zone not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Zone fetched successfully.", zone));
});

// Update Zone
const updateZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!zone) {
    throw new ApiError(404, "Zone not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Zone updated successfully.", zone));
});

// Delete Zone
const deleteZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findByIdAndDelete(req.params.id);

  if (!zone) {
    throw new ApiError(404, "Zone not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Zone deleted successfully."));
});

module.exports = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
};