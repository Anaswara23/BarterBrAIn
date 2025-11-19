// Utility functions for BarterBrain
function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

module.exports = { round2 };
