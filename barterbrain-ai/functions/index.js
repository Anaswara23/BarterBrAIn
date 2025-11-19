// Firebase Cloud Function for AI valuation with Gemini multimodal support
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const admin = require('firebase-admin');
const { round2 } = require('./utils');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin if not already
if (!admin.apps || !admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Helper to safely get environment variables
function getEnv(key, defaultValue = null) {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : defaultValue;
}

const GEMINI_API_KEY = getEnv('GEMINI_API_KEY') || (functions.config().gemini && functions.config().gemini.api_key);
const GEMINI_MODEL = getEnv('GEMINI_MODEL', 'gemini-2.5-flash') || (functions.config().gemini && functions.config().gemini.model) || 'gemini-2.5-flash';

// Main AI valuation endpoint
app.post('/ai/metadataValuation', async (req, res) => {
  const metadata = req.body || {};
  if (!metadata.title && !metadata.description) {
    return res.status(400).json({ error: 'provide title or description' });
  }

  // Accept up to 3 image URLs
  const images = Array.isArray(metadata.images) ? metadata.images.slice(0, 3) : [];
  const productLink = metadata.productLink || '';

  // Build prompt text
  let promptText = `You are an expert used-goods valuation assistant for a college barter marketplace.\n`;
  if (images.length > 0) {
    promptText += `Images provided.\n`;
  }
  if (productLink) {
    promptText += `Product link: ${productLink}.\n`;
  }
  promptText += `Input metadata as JSON: ${JSON.stringify(metadata)}.\n`;
  promptText += `Return valid JSON only, following this exact schema:\n\n`;
  promptText += `{"value": <float>, "confidence": <float>, "breakdown": {"basePrice": <float>, "ageFactor": <float>, "conditionFactor": <float>, "brandFactor": <float>, "accessoryValue": <float>}, "explanation": "<short human explanation 1-3 sentences>"}\n`;
  promptText += `Compute value = round(basePrice * ageFactor * conditionFactor * brandFactor + accessoryValue, 2). If you cannot determine basePrice, return basePrice=null and confidence=0.0.`;

  // Prepare Gemini SDK
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  // Prepare content parts
  const parts = [{ text: promptText }];
  
  // Add images if provided
  if (images.length > 0) {
    for (const imageUrl of images) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: await fetchImageAsBase64(imageUrl)
        }
      });
    }
  }

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    let rawText = response.text();
    
    // Clean up response
    rawText = rawText.replace(/```json|```/gi, '').trim();
    rawText = rawText.replace(/^\s*json\s*/i, '').trim();
    const parsedResult = JSON.parse(rawText);
    return res.json(parsedResult);
  } catch (err) {
    console.error('Gemini call failed:', err);
    return res.status(500).json({ error: 'Gemini error', details: err.message });
  }
});

// Helper to fetch image and convert to base64
async function fetchImageAsBase64(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer.toString('base64');
}

// AI Chat-Negotiation Coach endpoint
app.post('/ai/negotiationCoach', async (req, res) => {
  const { chatTranscript, userItem, otherUserItem, currentOffer } = req.body || {};
  
  // Validation
  if (!chatTranscript || !Array.isArray(chatTranscript) || chatTranscript.length === 0) {
    return res.status(400).json({ error: 'chatTranscript is required and must be a non-empty array' });
  }
  if (!userItem || !userItem.title) {
    return res.status(400).json({ error: 'userItem with title is required' });
  }
  if (!otherUserItem || !otherUserItem.title) {
    return res.status(400).json({ error: 'otherUserItem with title is required' });
  }

  // Build prompt for negotiation coaching
  let promptText = `You are an expert negotiation coach for a college barter marketplace. Analyze the conversation and provide helpful negotiation advice.\n\n`;
  
  promptText += `USER'S ITEM:\n`;
  promptText += `- Title: ${userItem.title}\n`;
  if (userItem.description) promptText += `- Description: ${userItem.description}\n`;
  if (userItem.estimatedValue) promptText += `- Estimated Value: $${userItem.estimatedValue}\n`;
  if (userItem.condition) promptText += `- Condition: ${userItem.condition}\n`;
  
  promptText += `\nOTHER USER'S ITEM:\n`;
  promptText += `- Title: ${otherUserItem.title}\n`;
  if (otherUserItem.description) promptText += `- Description: ${otherUserItem.description}\n`;
  if (otherUserItem.estimatedValue) promptText += `- Estimated Value: $${otherUserItem.estimatedValue}\n`;
  if (otherUserItem.condition) promptText += `- Condition: ${otherUserItem.condition}\n`;
  
  if (currentOffer) {
    promptText += `\nCURRENT OFFER:\n`;
    if (currentOffer.cashAdjustment !== undefined) {
      promptText += `- Cash adjustment: $${currentOffer.cashAdjustment} ${currentOffer.cashAdjustment > 0 ? '(user pays)' : '(user receives)'}\n`;
    }
    if (currentOffer.status) promptText += `- Status: ${currentOffer.status}\n`;
  }
  
  promptText += `\nCHAT TRANSCRIPT (most recent 20 messages):\n`;
  const recentMessages = chatTranscript.slice(-20);
  recentMessages.forEach((msg, idx) => {
    const sender = msg.isCurrentUser ? 'YOU' : 'THEM';
    promptText += `[${sender}]: ${msg.message}\n`;
  });
  
  promptText += `\n\nBased on the conversation and items, provide negotiation advice. Return ONLY valid JSON with this exact schema:\n\n`;
  promptText += `{\n`;
  promptText += `  "suggestionPhrase": "<A friendly, natural message the user can send (1-2 sentences)>",\n`;
  promptText += `  "suggestedCashAdjustment": <number (positive if user should pay, negative if user should receive, 0 for even swap)>,\n`;
  promptText += `  "explanation": "<Brief explanation of the strategy and why this approach makes sense (2-3 sentences)>",\n`;
  promptText += `  "negotiationTips": ["<tip1>", "<tip2>", "<tip3>"]\n`;
  promptText += `}\n\n`;
  promptText += `Make suggestions friendly, college-student appropriate, and focused on fair value exchange. Consider item conditions, estimated values, and conversation tone. And if the determined price itself seemed fair, just say that its already a fair trade, so no adjustment is needed.`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const result = await model.generateContent([{ text: promptText }]);
    const response = await result.response;
    let rawText = response.text();
    
    // Clean up response
    rawText = rawText.replace(/```json|```/gi, '').trim();
    rawText = rawText.replace(/^\s*json\s*/i, '').trim();
    const parsedResult = JSON.parse(rawText);
    
    return res.json(parsedResult);
  } catch (err) {
    console.error('Negotiation coach failed:', err);
    return res.status(500).json({ error: 'Negotiation coach error', details: err.message });
  }
});

const { computeSustainabilityScore } = require('./sustainability');

// Endpoint to mark a swap as confirmed and compute sustainability impact
app.post('/swaps/confirm', async (req, res) => {
  const body = req.body || {};
  const swapId = body.swapId || null;
  let swapData = body.swap || null;

  try {
    let docRef = null;
    let docData = null;

    if (swapId) {
      docRef = db.collection('swaps').doc(swapId);
      const snap = await docRef.get();
      if (snap.exists) docData = snap.data();
    }

    // Prefer authoritative Firestore data when available
    const source = docData || swapData || {};

    // Attempt to find an estimated new cost from common fields
    const estimatedNewCost = (
      source.estimatedNewCost ||
      (source.newItem && (source.newItem.estimatedValue || source.newItem.valuation)) ||
      source.estimatedValueNew ||
      (source.valuation && source.valuation.value) ||
      null
    );

    // Extract item name (from various possible field names)
    const itemName = (
      source.itemName ||
      source.newItemName ||
      (source.newItem && source.newItem.name) ||
      source.title ||
      (source.newItem && source.newItem.title) ||
      null
    );

    // Value of the item the proposer gives (several possible field names)
    const proposerItemValue = (
      source.proposerItemValue ||
      source.offerValue ||
      (source.offerItem && (source.offerItem.estimatedValue || source.offerItem.valuation)) ||
      (source.offer && source.offer.value) ||
      0
    );

    const proposerCash = Number(source.proposerCash || source.cashPaid || source.proposerPaid || 0) || 0;

    const actualSwapCost = round2(Number(proposerItemValue || 0) + Number(proposerCash || 0));

    let sustainabilityImpact = null;
    if (estimatedNewCost != null && !isNaN(Number(estimatedNewCost))) {
      // computeSustainabilityScore is now async and returns a single-line string (or null on failure)
      sustainabilityImpact = await computeSustainabilityScore(estimatedNewCost, actualSwapCost, itemName);
    } else {
      // If missing estimatedNewCost, leave null to indicate unknown impact
      sustainabilityImpact = null;
    }

    // If we have a Firestore doc, attempt to update it with the result (or null)
    if (docRef) {
      await docRef.update({ sustainabilityImpact: sustainabilityImpact });
    }

    return res.json({ success: true, swapId: swapId || null, sustainabilityImpact });
  } catch (err) {
    console.error('Error computing sustainability impact for swap confirm:', err);
    // Respond with null impact on error per requirements
    return res.status(200).json({ success: false, error: err.message, sustainabilityImpact: null });
  }
});

// Export the Firebase Cloud Function
exports.BarterBrainAPI = functions.https.onRequest(app);

// If run directly (not as a Cloud Function), start an express server for local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local dev server listening on http://localhost:${PORT}`));
}
