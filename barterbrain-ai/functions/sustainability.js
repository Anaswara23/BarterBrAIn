const { round2 } = require('./utils');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const functions = require('firebase-functions');

// Helper to safely get environment variables
function getEnv(key, defaultValue = null) {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : defaultValue;
}

const GEMINI_API_KEY = getEnv('GEMINI_API_KEY') || (functions.config().gemini && functions.config().gemini.api_key);
const GEMINI_MODEL = getEnv('GEMINI_MODEL', 'gemini-2.5-flash') || (functions.config().gemini && functions.config().gemini.model) || 'gemini-2.5-flash';

// Estimate carbon footprint (kg CO2) for manufacturing a new item using Gemini
async function estimateCarbonFootprint(itemName) {
  try {
    if (!itemName || typeof itemName !== 'string') return 20; // fallback
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are an environmental expert. Estimate the carbon footprint (kg CO₂) for manufacturing a brand-new "${itemName}". Return ONLY a single number between 1 and 200. Do not include units or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    const parsed = parseFloat(text);

    if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
      return round2(parsed);
    }
    return 20; // fallback if parse failed or out of range
  } catch (err) {
    console.warn('estimateCarbonFootprint failed:', err.message);
    return 20; // fallback on Gemini error
  }
}

// Generate a one-line summary using Gemini
async function generateSustabilitySummary(co2SavedKg, moneySaved, itemName) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are a sustainability communicator. Write exactly one short sentence (max 20 words) about the positive sustainability impact of swapping a "${itemName}" instead of buying new, where the user saved ${co2SavedKg} kg CO₂ and $${moneySaved}. Return ONLY the sentence, no extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Ensure it's a single line and trim to max 20 words if needed
    text = text.replace(/\n/g, ' ').substring(0, 200);
    return text;
  } catch (err) {
    console.warn('generateSustabilitySummary failed:', err.message);
    // Fallback sentence
    return `You saved about ${co2SavedKg} kg CO₂ and $${moneySaved} by swapping instead of buying new.`;
  }
}

// Compute sustainability score and generate a single-line summary
async function computeSustainabilityScore(estimatedNewCost, actualSwapCost, itemName) {
  try {
    if (estimatedNewCost == null || isNaN(Number(estimatedNewCost))) return null;
    
    const est = Number(estimatedNewCost);
    const actual = Number(actualSwapCost) || 0;
    const item = itemName || 'item';

    // Compute money saved
    const moneySaved = Math.max(0, round2(est - actual));

    // Get carbon footprint from Gemini
    const carbonFootprint = await estimateCarbonFootprint(item);
    const co2SavedKg = carbonFootprint; // User avoided buying new, so CO2 saved = carbon footprint

    // Generate summary from Gemini
    const summary = await generateSustabilitySummary(co2SavedKg, moneySaved, item);

    // Return only the summary as sustainabilityImpact
    return summary;
  } catch (err) {
    console.warn('computeSustainabilityScore failed:', err);
    return null;
  }
}

module.exports = { computeSustainabilityScore };
