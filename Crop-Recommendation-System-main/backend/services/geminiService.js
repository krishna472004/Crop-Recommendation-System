import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function getAICropSuggestion(location, lat, lon, weather) {

  try {

    const prompt = `You are a senior Indian agriculture expert.
Analyze the data below and return your answer in EXACTLY this plain text format.
Analyze the data below and give REALISTIC, REGION-FAMOUS crop suggestions — not generic ones.
If the location is in Punjab, suggest Wheat or Rice. If Kerala, suggest Coconut or Rubber.
If Rajasthan, suggest Bajra or Jowar. Match the crop to what REAL farmers grow there.
No JSON. No curly braces. No square brackets. No quotes. No markdown. No extra text.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT DATA:
Location: ${location}
Coordinates: ${lat}, ${lon}
Temperature: ${weather.temperature}°C
Humidity: ${weather.humidity}%
Rainfall: ${weather.rainfall} mm
Month: ${new Date().toLocaleString('default', { month: 'long' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COPY THIS OUTPUT FORMAT EXACTLY:
================================================================================================================================================================
                                                                                                 BEST CROP SUGGESTION
================================================================================================================================================================

- [CROP NAME IN CAPITALS]
      confidence: [number 55-92]
      reason: [One sentence — mention temperature, soil, or season for this location.]
================================================================================================================================================================
                                                                                                 TOP 5 CROP SUGGESTIONS
================================================================================================================================================================

- [CROP 1 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — mention temperature, soil, rainfall, or season.]

- [CROP 2 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — mention temperature, soil, rainfall, or season.]

- [CROP 3 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — mention temperature, soil, rainfall, or season.]

- [CROP 4 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — mention temperature, soil, rainfall, or season.]

- [CROP 5 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — mention temperature, soil, rainfall, or season.]

================================================================================================================================================================
                                                                                                 ALTERNATE SECONDARY CROPS / LONG-TERM TREES & CASH CROPS
================================================================================================================================================================

- [TREE OR CASH CROP 1 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — why this tree or cash crop suits this region long term.]

- [TREE OR CASH CROP 2 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — why this tree or cash crop suits this region long term.]

- [TREE OR CASH CROP 3 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — why this tree or cash crop suits this region long term.]

- [TREE OR CASH CROP 4 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — why this tree or cash crop suits this region long term.]

- [TREE OR CASH CROP 5 NAME IN CAPITALS]
      confidence: [number]
      reason: [One sentence — why this tree or cash crop suits this region long term.]

================================================================================================================================================================
                                                                                                AI RECOMMENDATION
================================================================================================================================================================

[Write exactly 4 to 5 natural sentences as a plain paragraph.
Sentence 1: Name the best crop and explain why it suits this location and season.
Sentence 2: Suggest 2 crops from Top 5 as good rotation partners and why.
Sentence 3: Give one specific irrigation or water management tip for this region.
Sentence 4: Recommend 1 to 2 long-term tree or cash crops and why they suit this area.
Sentence 5 (optional): Any extra seasonal or soil care advice for this location.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT RULES — FOLLOW ALL:
1. No JSON. No braces. No brackets. No quotes. No markdown. No asterisks. No numbering.
2. BEST CROP must NOT appear again in TOP 5 list.
3. TOP 5 must have EXACTLY 5 different seasonal crops. No trees.
4. ALTERNATE section must have EXACTLY 5 trees or cash crops such as Coconut, Mango, Banana, Sugarcane, Arecanut, Teak, Neem, Guava, Papaya, Drumstick — NOT regular seasonal crops.
5. Confidence values must be realistic integers between 55 and 92 in descending order.
6. Each reason must be ONE sentence only and must reference temperature, rainfall, soil type, or season.
7. AI Recommendation must be plain natural paragraph — no bullet points, no numbering, no headers inside it.
8. Crop names must be in CAPITAL LETTERS on their own line starting with bullet •
9. confidence and reason must be indented below the crop name as sub-points.
10. Do not write anything outside this format. No greetings, no notes, no disclaimers.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**What the output will look like:**
`
;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant"
    });

    return response.choices[0].message.content;

  } catch (error) {

    console.log("Groq Error:", error.message);
    return "AI recommendation unavailable.";

  }

}