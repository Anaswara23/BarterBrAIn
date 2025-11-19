# Sustainability Feature Deployment Guide

## What You Built
- `functions/sustainability.js` - Separate module for sustainability calculations
- `/swaps/confirm` endpoint in `functions/index.js` - Confirms swaps and computes sustainability impact

## Safe Deployment Strategy

### Step 1: Get Current Deployed Code
Ask your friend or Flutter dev for the **current deployed `functions/index.js`** file.

Or pull from Git:
```bash
git pull origin main
# Or whatever branch they deployed from
```

### Step 2: Files to Add/Merge

#### NEW FILE (no conflicts):
Copy this file to the deployed version:
- `functions/sustainability.js` (your complete new module)

#### MERGE into their `index.js`:

**Add this import at the top (after other requires):**
```javascript
const { computeSustainabilityScore } = require('./sustainability');
```

**Add this endpoint (before the final `exports` or dev server block):**
```javascript
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

    const source = docData || swapData || {};

    const estimatedNewCost = (
      source.estimatedNewCost ||
      (source.newItem && (source.newItem.estimatedValue || source.newItem.valuation)) ||
      source.estimatedValueNew ||
      (source.valuation && source.valuation.value) ||
      null
    );

    const itemName = (
      source.itemName ||
      source.newItemName ||
      (source.newItem && source.newItem.name) ||
      source.title ||
      (source.newItem && source.newItem.title) ||
      null
    );

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
      sustainabilityImpact = await computeSustainabilityScore(estimatedNewCost, actualSwapCost, itemName);
    }

    if (docRef) {
      await docRef.update({ sustainabilityImpact: sustainabilityImpact });
    }

    return res.json({ success: true, swapId: swapId || null, sustainabilityImpact });
  } catch (err) {
    console.error('Error computing sustainability impact for swap confirm:', err);
    return res.status(200).json({ success: false, error: err.message, sustainabilityImpact: null });
  }
});
```

### Step 3: Set Environment Variables in Firebase

```bash
# Set the Gemini API key in Firebase Functions
firebase functions:config:set gemini.api_key="your-gemini-api-key"

# Verify it's set
firebase functions:config:get
```

**Update code to read from Firebase config:**
In `functions/sustainability.js` and `functions/index.js`, change:
```javascript
const GEMINI_API_KEY = getEnv('GEMINI_API_KEY');
```
To:
```javascript
const GEMINI_API_KEY = getEnv('GEMINI_API_KEY') || functions.config().gemini?.api_key;
```

### Step 4: Deploy to Firebase

```bash
cd BarterBr-AI-n

# Make sure you're logged in
firebase login

# Deploy only functions (safer than full deploy)
firebase deploy --only functions

# Or deploy just your new function
firebase deploy --only functions:ProductPricePredictionApi
```

### Step 5: Test the Deployed Function

Get your Firebase function URL from the deploy output, then test:

```bash
curl -X POST https://YOUR-PROJECT.cloudfunctions.net/ProductPricePredictionApi/swaps/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "swap": {
      "estimatedNewCost": 120,
      "proposerItemValue": 40,
      "proposerCash": 20,
      "itemName": "laptop"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "swapId": null,
  "sustainabilityImpact": "You saved about 85 kg CO₂ and $60 by swapping instead of buying new."
}
```

## Conflict Resolution Tips

1. **If your friend modified the same `index.js`:**
   - Use a merge tool (VS Code has built-in merge editor)
   - Keep their chat negotiation endpoints
   - Add your `/swaps/confirm` endpoint
   - Don't overwrite their code

2. **If they also have Firestore/admin setup:**
   - Keep their initialization (don't duplicate)
   - Your code can use the same `db` instance

3. **If they have different Express routes:**
   - All routes can coexist in the same `app`
   - Just add yours alongside theirs

## Files Checklist

Before deploying, ensure you have:
- ✅ `functions/sustainability.js` (new file)
- ✅ `functions/index.js` (merged with friend's version)
- ✅ `functions/package.json` (includes all dependencies)
- ✅ `.env` or Firebase config has `GEMINI_API_KEY`

## Testing Locally Before Deploy

```bash
cd functions
npm install
firebase emulators:start --only functions

# In another terminal:
curl -X POST http://localhost:5001/YOUR-PROJECT/us-central1/ProductPricePredictionApi/swaps/confirm \
  -H "Content-Type: application/json" \
  -d '{"swap":{"estimatedNewCost":120,"proposerItemValue":40,"proposerCash":20,"itemName":"laptop"}}'
```

## Communication with Team

Share with Flutter dev:
1. The new endpoint URL: `/swaps/confirm`
2. Request payload format:
   ```json
   {
     "swapId": "firestore-doc-id",
     "swap": {
       "estimatedNewCost": 120,
       "itemName": "laptop",
       "proposerItemValue": 40,
       "proposerCash": 20
     }
   }
   ```
3. Response format:
   ```json
   {
     "success": true,
     "sustainabilityImpact": "One-line summary string or null"
   }
   ```

## Rollback Plan

If something breaks:
```bash
# Redeploy previous version
firebase deploy --only functions

# Or from Git
git checkout HEAD~1 functions/
firebase deploy --only functions
```
