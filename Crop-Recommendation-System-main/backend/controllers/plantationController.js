import Plantation from "../models/Plantation.js";
import {
  findPlantationByEmailAndLocation,
  isMemoryDbEnabled,
  upsertPlantation
} from "../database/runtimeStore.js";
import { createDailyNDVIReport, getPlantationHealthSummary } from "../services/ndviService.js";

function getPolygonCenter(coordinates = []) {
  if (!coordinates.length) {
    return null;
  }

  const totals = coordinates.reduce(
    (acc, point) => {
      acc.lat += Number(point.lat);
      acc.lng += Number(point.lng);
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return {
    latitude: totals.lat / coordinates.length,
    longitude: totals.lng / coordinates.length
  };
}

export const savePlantation = async (req, res) => {
  try {
    const { name, locationName, email, coordinates = [] } = req.body;

    if (!name || !locationName || !email || coordinates.length === 0) {
      return res.status(400).json({
        error: "name, locationName, email and coordinates are required"
      });
    }

    const center = getPolygonCenter(coordinates);

    const plantationPayload = {
      name: name.trim(),
      locationName: locationName.trim(),
      email: email.toLowerCase(),
      latitude: center.latitude,
      longitude: center.longitude,
      coordinates
    };

    const plantation = isMemoryDbEnabled()
      ? await upsertPlantation(plantationPayload)
      : await Plantation.findOneAndUpdate(
          { email: email.toLowerCase(), locationName: locationName.trim() },
          plantationPayload,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

    const plantationId = String(plantation.id || plantation._id);

    if (!plantationId) {
      throw new Error("Plantation ID was not generated");
    }

    const report = await createDailyNDVIReport({
      ...plantation,
      _id: plantationId,
      id: plantationId
    });
    const health = await getPlantationHealthSummary(plantationId);

    res.json({
      message: "Plantation saved successfully",
      plantationId,
      plantation: {
        id: plantationId,
        _id: plantationId,
        name: plantation.name,
        locationName: plantation.locationName,
        email: plantation.email,
        latitude: plantation.latitude,
        longitude: plantation.longitude
      },
      latestReport: report,
      health
    });
  } catch (error) {
    console.error("Save plantation error:", error);
    res.status(500).json({ error: "Failed to save plantation" });
  }
};

export const lookupPlantation = async (req, res) => {
  try {
    const { email, locationName } = req.query;

    if (!email || !locationName) {
      return res.status(400).json({ error: "email and locationName are required" });
    }

    const plantation = isMemoryDbEnabled()
      ? await findPlantationByEmailAndLocation(email, locationName)
      : await Plantation.findOne({
          email: email.toLowerCase(),
          locationName: locationName.trim()
        });

    if (!plantation) {
      return res.status(404).json({ error: "Plantation not found" });
    }

    const plantationId = String(plantation.id || plantation._id);
    const health = await getPlantationHealthSummary(plantationId);

    res.json({
      plantationId,
      plantation: {
        id: plantationId,
        _id: plantationId,
        name: plantation.name,
        locationName: plantation.locationName,
        email: plantation.email,
        latitude: plantation.latitude,
        longitude: plantation.longitude
      },
      health
    });
  } catch (error) {
    console.error("Lookup plantation error:", error);
    res.status(500).json({ error: "Failed to lookup plantation" });
  }
};
