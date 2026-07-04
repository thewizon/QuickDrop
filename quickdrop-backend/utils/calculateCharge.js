const RateCard = require("../models/RateCard");
const CodConfig = require("../models/CodConfig");
const ApiError = require("./ApiError");

const VOLUMETRIC_DIVISOR = 5000;

/**
 * Computes volumetric weight from dimensions in cm.
 * Formula: (L x B x H) / 5000
 */
const getVolumetricWeight = (length, breadth, height) => {
  return (length * breadth * height) / VOLUMETRIC_DIVISOR;
};

/**
 * Core rate calculation engine.
 *
 * Steps:
 *  1. Determine zoneType: "intra" if pickup & delivery zone are the same zone, else "inter"
 *  2. Compute volumetric weight from dimensions
 *  3. Chargeable weight = max(actualWeight, volumetricWeight)
 *  4. Look up the admin-configured RateCard for (orderType, zoneType)
 *  5. deliveryCharge = baseCharge + pricePerKg * chargeableWeight
 *  6. If paymentType === "COD", add the admin-configured COD surcharge for that orderType
 *
 * All rates are admin-configurable via RateCard / CodConfig - nothing is hardcoded here.
 */
const calculateCharge = async ({
  pickupZoneId,
  deliveryZoneId,
  orderType,
  paymentType,
  length,
  breadth,
  height,
  actualWeight,
}) => {
  const zoneType =
    pickupZoneId.toString() === deliveryZoneId.toString()
      ? "intra"
      : "inter";

  const volumetricWeight = getVolumetricWeight(length, breadth, height);
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  const rateCard = await RateCard.findOne({ orderType, zoneType });

  if (!rateCard) {
    throw new ApiError(
      404,
      `No rate card configured for ${orderType} / ${zoneType}-zone deliveries. Please ask admin to configure one.`
    );
  }

  let codSurcharge = 0;

  if (paymentType === "COD") {
    const codConfig = await CodConfig.findOne({ orderType });
    codSurcharge = codConfig ? codConfig.surchargeAmount : 0;
  }

  const deliveryCharge =
    rateCard.baseCharge +
    rateCard.pricePerKg * chargeableWeight +
    codSurcharge;

  return {
    zoneType,
    volumetricWeight: Number(volumetricWeight.toFixed(2)),
    chargeableWeight: Number(chargeableWeight.toFixed(2)),
    baseCharge: rateCard.baseCharge,
    pricePerKg: rateCard.pricePerKg,
    codSurcharge,
    deliveryCharge: Number(deliveryCharge.toFixed(2)),
    estimatedDays: rateCard.estimatedDays,
  };
};

module.exports = { calculateCharge, getVolumetricWeight };
