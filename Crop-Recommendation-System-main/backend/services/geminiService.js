import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const FALLBACK_RESPONSE = {
  best_crop: null,
  top_5_crops: [],
  alternate_top_5_crops: [],
  other_possible_crops: [],
  aiRecommendation: "AI recommendation unavailable.",
  aiRecommendationDetails: {
    summary: "AI recommendation unavailable.",
    bestCropWhy: "",
    rotationAdvice: [],
    irrigationTip: "",
    longTermPlan: [],
    soilCare: []
  }
};

function clampConfidence(value, fallback = 60) {
  const numericValue = Number.parseInt(value, 10);

  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.max(55, Math.min(92, numericValue));
}

function normalizeCrop(crop, fallbackName = "Unknown Crop", fallbackConfidence = 60) {
  if (!crop) {
    return null;
  }

  return {
    name: String(crop.name || crop.crop || fallbackName).trim(),
    confidence: clampConfidence(crop.confidence, fallbackConfidence),
    reason: String(crop.reason || "").trim()
  };
}

function uniqueCrops(crops = []) {
  const seen = new Set();

  return crops.filter((crop) => {
    const key = crop?.name?.toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeList(crops, defaultList = []) {
  const source = Array.isArray(crops) && crops.length > 0 ? crops : defaultList;

  return uniqueCrops(
    source
      .map((crop, index) => normalizeCrop(crop, `Crop ${index + 1}`, 78 - index * 4))
      .filter(Boolean)
  );
}

function normalizeRecommendationPayload(payload) {
  const bestCrop = normalizeCrop(payload?.best_crop, "Recommended Crop", 85);
  const top5 = normalizeList(payload?.top_5_crops);
  const alternateTop5 = normalizeList(payload?.alternate_top_5_crops);
  const otherPossible = normalizeList(payload?.other_possible_crops);

  const summary = String(
    payload?.aiRecommendation ||
    payload?.ai_recommendation ||
    payload?.aiRecommendationDetails?.summary ||
    FALLBACK_RESPONSE.aiRecommendation
  ).trim();

  const details = payload?.aiRecommendationDetails || {};

  return {
    best_crop: bestCrop,
    top_5_crops: top5,
    alternate_top_5_crops: alternateTop5,
    other_possible_crops: otherPossible,
    aiRecommendation: summary,
    aiRecommendationDetails: {
      summary,
      bestCropWhy: String(details.bestCropWhy || "").trim(),
      rotationAdvice: Array.isArray(details.rotationAdvice)
        ? details.rotationAdvice.map((item) => String(item).trim()).filter(Boolean)
        : [],
      irrigationTip: String(details.irrigationTip || "").trim(),
      longTermPlan: Array.isArray(details.longTermPlan)
        ? details.longTermPlan.map((item) => String(item).trim()).filter(Boolean)
        : [],
      soilCare: Array.isArray(details.soilCare)
        ? details.soilCare.map((item) => String(item).trim()).filter(Boolean)
        : []
    }
  };
}

function extractJSONObject(content) {
  if (!content) {
    return null;
  }

  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return content.slice(firstBrace, lastBrace + 1);
}

export async function getAICropSuggestion(location, lat, lon, weather, predictions = []) {
  try {
    const prompt = `You are a senior Indian agriculture expert.
Analyze the data below and return ONLY valid JSON.

Return exactly this schema:
{
  "best_crop": {
    "name": "string",
    "confidence": number,
    "reason": "string"
  },
  "top_5_crops": [
    { "name": "string", "confidence": number, "reason": "string" }
  ],
  "alternate_top_5_crops": [
    { "name": "string", "confidence": number, "reason": "string" }
  ],
  "other_possible_crops": [
    { "name": "string", "confidence": number, "reason": "string" }
  ],
  "aiRecommendation": "4 to 5 sentence paragraph",
  "aiRecommendationDetails": {
    "summary": "short paragraph",
    "bestCropWhy": "string",
    "rotationAdvice": ["string", "string"],
    "irrigationTip": "string",
    "longTermPlan": ["string", "string"],
    "soilCare": ["string", "string"]
  }
}

Rules:
- Use realistic crops for the exact Indian region.
- If location is Punjab, strongly prefer Wheat or Rice.
- If Kerala, prefer Coconut or Rubber.
- If Rajasthan, prefer Bajra or Jowar.
- "best_crop" must not appear again inside "top_5_crops".
- "top_5_crops" must contain exactly 5 seasonal crops.
- "alternate_top_5_crops" must contain exactly 5 tree or cash crops.
- "other_possible_crops" should contain exactly 3 additional realistic options.
- Confidence values must be integers between 55 and 92.
- Every reason must be one sentence and mention temperature, rainfall, soil, or season.
- Do not include markdown, explanations, or text outside the JSON object.

Input data:
Location: ${location}
Coordinates: ${lat}, ${lon}
Temperature: ${weather.temperature} C
Humidity: ${weather.humidity}%
Rainfall: ${weather.rainfall} mm
Month: ${new Date().toLocaleString("default", { month: "long" })}
ML predictions: ${predictions.map((crop) => `${crop.crop || crop.name} (${crop.confidence}%)`).join(", ") || "None"}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content || "";
    const jsonText = extractJSONObject(content);

    if (!jsonText) {
      throw new Error("Groq returned no JSON payload");
    }

    const parsed = JSON.parse(jsonText);
    return normalizeRecommendationPayload(parsed);
  } catch (error) {
    console.log("Groq Error:", error.message);
    return FALLBACK_RESPONSE;
  }
}
