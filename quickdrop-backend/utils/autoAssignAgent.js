const User = require("../models/User");

/**
 * Finds the "nearest" available delivery agent for an order.
 *
 * Strategy (best-effort, since we don't have live GPS routing):
 *   1. If the agent's currentLocation and the given pickup coordinates are both
 *      available, pick the available agent in the pickup zone with the smallest
 *      straight-line (haversine) distance.
 *   2. Otherwise, fall back to zone-based matching: any available agent whose
 *      "zone" equals the order's pickup zone.
 *   3. If nobody is available in that zone, fall back to any available agent
 *      system-wide (better to assign someone than leave the order unassigned).
 *
 * Returns the agent User document, or null if no agent is available at all.
 */

const toRadians = (deg) => (deg * Math.PI) / 180;

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const autoAssignAgent = async ({ pickupZoneId, pickupLocation }) => {
  const candidatesInZone = await User.find({
    role: "agent",
    isAvailable: true,
    zone: pickupZoneId,
  });

  const pool = candidatesInZone.length > 0
    ? candidatesInZone
    : await User.find({ role: "agent", isAvailable: true });

  if (pool.length === 0) {
    return null;
  }

  // If we have pickup coordinates, pick the geographically nearest agent that also has coordinates set
  if (
    pickupLocation &&
    typeof pickupLocation.latitude === "number" &&
    typeof pickupLocation.longitude === "number"
  ) {
    const withLocation = pool.filter(
      (agent) =>
        agent.currentLocation &&
        typeof agent.currentLocation.latitude === "number" &&
        typeof agent.currentLocation.longitude === "number"
    );

    if (withLocation.length > 0) {
      let nearest = withLocation[0];
      let nearestDistance = haversineDistanceKm(
        pickupLocation.latitude,
        pickupLocation.longitude,
        nearest.currentLocation.latitude,
        nearest.currentLocation.longitude
      );

      for (const agent of withLocation.slice(1)) {
        const distance = haversineDistanceKm(
          pickupLocation.latitude,
          pickupLocation.longitude,
          agent.currentLocation.latitude,
          agent.currentLocation.longitude
        );

        if (distance < nearestDistance) {
          nearest = agent;
          nearestDistance = distance;
        }
      }

      return nearest;
    }
  }

  // Fallback: no coordinates available, just take the first available agent in the pool
  return pool[0];
};

module.exports = { autoAssignAgent };
