const { HUMIDITY_CONVERSION_FACTOR } = require("./const");

/**
 * Compute the positions of all the plants that could go in a field boundary
 * @param {{x, y, width, height}} fieldBondary
 * @param {Number} plantDistance
 */
function computesSeedPositions(
  fieldBondary,
  plantDistance,
  depth,
  Z_TO_SEED_SAFE
) {
  const { x, y, width, height } = fieldBondary;

  if (width <= 0) return [];
  if (height <= 0) return [];
  let poss = [];

  let n = parseInt(width / plantDistance);
  let m = parseInt(height / plantDistance);

  if (n < 1 || m < 1) return [];

  for (let i = 0; i < n; i++) {
    let plantX = x + plantDistance * (i + 1 / 2);

    for (let j = 0; j < m; j++) {
      let plantY = y + plantDistance * (j + 1 / 2);

      poss.push({ x: plantX, y: plantY, z: Math.min(Z_TO_SEED_SAFE, depth) });
    }
  }

  return poss;
}

function checkHumidityValue(plant, nbHours) {
  if (!plant.lastHumdityMeasureTime) return false;

  let dt1 = new Date(plant.lastHumdityMeasureTime);
  let dt2 = new Date();

  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  diff = Math.abs(Math.round(diff));
  return diff <= nbHours;
}

function computeMlFromHumidity(waterAmountMl, humidityValue) {
  if(!humidityValue) return waterAmountMl

  let val = waterAmountMl - humidityValue * HUMIDITY_CONVERSION_FACTOR;

  if (val < 0) {
    return 0;
  }
  return val;
}

function sortPlantByPosition(points) {
  // TODO
  points.sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x; // Sort by x coordinate
    } else {
      return a.y - b.y; // If x coordinates are equal, sort by y coordinate
    }
  });

  return points;
}

module.exports = {
  computesSeedPositions,
  checkHumidityValue,
  computeMlFromHumidity,
  sortPlantByPosition,
};
