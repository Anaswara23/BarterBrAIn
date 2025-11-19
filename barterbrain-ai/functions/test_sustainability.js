const { computeSustainabilityScore } = require('./sustainability');

// Test samples with itemName for Gemini carbon footprint estimation
const samples = [
  { estimatedNewCost: 120, actualSwapCost: 60, itemName: 'laptop' },
  { estimatedNewCost: 80, actualSwapCost: 100, itemName: 'chair' },
  { estimatedNewCost: 250, actualSwapCost: 150, itemName: 'desk' },
  { estimatedNewCost: null, actualSwapCost: 50, itemName: 'table' }, // Missing cost, should return null
];

(async () => {
  for (const s of samples) {
    try {
      const res = await computeSustainabilityScore(s.estimatedNewCost, s.actualSwapCost, s.itemName);
      console.log('INPUT:', s);
      console.log('OUTPUT (summary):', res);
      console.log('---\n');
    } catch (err) {
      console.error('ERROR:', err.message);
    }
  }
})();

