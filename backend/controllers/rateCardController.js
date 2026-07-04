const RateCard = require("../models/RateCard");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Create Rate Card (orderType x zoneType combination)
const createRateCard = asyncHandler(async (req, res) => {
  const { orderType, zoneType, baseCharge, pricePerKg, estimatedDays } = req.body;

  if (
    !orderType ||
    !zoneType ||
    baseCharge == null ||
    pricePerKg == null ||
    estimatedDays == null
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  if (!["B2B", "B2C"].includes(orderType)) {
    throw new ApiError(400, "orderType must be B2B or B2C.");
  }

  if (!["intra", "inter"].includes(zoneType)) {
    throw new ApiError(400, "zoneType must be intra or inter.");
  }

  const existing = await RateCard.findOne({ orderType, zoneType });
  if (existing) {
    throw new ApiError(400, "Rate Card already exists for this orderType/zoneType.");
  }

  const rateCard = await RateCard.create({
    orderType,
    zoneType,
    baseCharge,
    pricePerKg,
    estimatedDays,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Rate Card created successfully.", rateCard));
});

// Get All Rate Cards
const getRateCards = asyncHandler(async (req, res) => {
  const rateCards = await RateCard.find();

  return res.status(200).json(
    new ApiResponse(200, "Rate Cards fetched successfully.", {
      count: rateCards.length,
      rateCards,
    })
  );
});

// Update Rate Card
const updateRateCard = asyncHandler(async (req, res) => {
  const updated = await RateCard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(404, "Rate Card not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Rate Card updated successfully.", updated));
});

// Delete Rate Card
const deleteRateCard = asyncHandler(async (req, res) => {
  const deleted = await RateCard.findByIdAndDelete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, "Rate Card not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Rate Card deleted successfully."));
});

module.exports = {
  createRateCard,
  getRateCards,
  updateRateCard,
  deleteRateCard,
};
