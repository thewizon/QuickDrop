const Zone = require("../models/Zone");
const ApiError = require("./ApiError");

/**
 * Detects which zone an address belongs to by matching the address text
 * against the "areas" list configured on each Zone by the admin.
 *
 * Matching is case-insensitive substring matching: if any configured area
 * name appears inside the address string, that zone is returned. The zone
 * with the longest matching area name wins (so a more specific area name
 * like "Andheri East" beats a broader one like "Mumbai" if both matched).
 */
const detectZoneFromAddress = async (address) => {
  if (!address || typeof address !== "string") {
    throw new ApiError(400, "A valid address is required for zone detection.");
  }

  const normalizedAddress = address.toLowerCase();
  const zones = await Zone.find();

  let bestMatch = null;
  let bestMatchLength = 0;

  for (const zone of zones) {
    for (const area of zone.areas) {
      const normalizedArea = area.toLowerCase().trim();

      if (
        normalizedArea.length > 0 &&
        normalizedAddress.includes(normalizedArea) &&
        normalizedArea.length > bestMatchLength
      ) {
        bestMatch = zone;
        bestMatchLength = normalizedArea.length;
      }
    }
  }

  if (!bestMatch) {
    throw new ApiError(
      422,
      `Could not detect a zone for address "${address}". Ask admin to add a matching area to a zone.`
    );
  }

  return bestMatch;
};

module.exports = { detectZoneFromAddress };
