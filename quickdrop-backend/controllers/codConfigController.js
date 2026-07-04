const CodConfig = require("../models/CodConfig");

const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Create or update the COD surcharge for an order type (upsert)
const setCodConfig = asyncHandler(async (req, res) => {
  const { orderType, surchargeAmount } = req.body;

  if (!orderType || surchargeAmount == null) {
    throw new ApiError(400, "orderType and surchargeAmount are required.");
  }

  if (!["B2B", "B2C"].includes(orderType)) {
    throw new ApiError(400, "orderType must be B2B or B2C.");
  }

  const config = await CodConfig.findOneAndUpdate(
    { orderType },
    { surchargeAmount },
    { new: true, upsert: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "COD surcharge saved successfully.", config));
});

const getCodConfigs = asyncHandler(async (req, res) => {
  const configs = await CodConfig.find();

  return res
    .status(200)
    .json(new ApiResponse(200, "COD configs fetched successfully.", configs));
});

const deleteCodConfig = asyncHandler(async (req, res) => {
  const deleted = await CodConfig.findByIdAndDelete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, "COD config not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "COD config deleted successfully."));
});

module.exports = { setCodConfig, getCodConfigs, deleteCodConfig };
