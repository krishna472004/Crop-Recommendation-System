import { getAICropSuggestion } from "./services/geminiService.js";

const weather = {
  temperature: 28,
  humidity: 80,
  rainfall: 200
};

const result = await getAICropSuggestion("Chennai", 13.08, 80.27, weather);

console.log(result);