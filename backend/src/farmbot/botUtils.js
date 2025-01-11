const axios = require("axios");
const dateTime = require("node-datetime");
const { nanoid } = require("nanoid");

const Farmbot = require("farmbot").Farmbot;
const {
  isToolTipConnected,
  unequippedToolTip,
  equippedToolTip,
  unequippedAllToolTips,
  getPosOfCurrentTooltip,
  toolTipNameToPos,
} = require("./helperToolTip");

const {
  storePlantedSeed,
  updateJobProgress,
  storeMoistureData,
} = require("./helperDB");

const {
  computeMlFromHumidity
} = require("./computations");

const {
  TOOLTIP_CATCH_DISTANZ,
  TOOL_CONNECTED_PIN,
  HUMIDITY_PIN,
  VACUUM_PIN,
  HUMIDITY_GAP_MEASUREMENT,
  HUMIDITY_Z_MEASUREMENT
} = require("./const");

/**
 * Get a new Token to access the FarmBot.
 * @param {boolean} useReal if true, get a token of the real Farmbot in lab. Otherwise, a token from the Fakebot
 * @returns on success a Promise for a token, otherwise null.
 * @example const token = await getNewToken();
 */
async function getNewToken(useReal = false) {
  //console.log("GetNewToken() called.");
  let promise;
  if (useReal) {
    promise = axios.post("https://my.farm.bot/api/tokens", {
      user: {
        email: "kalagdf@rhrk.uni-kl.de",
        password: "mYfarm2022*",
      },
    });
  } else {
    promise = axios.post("https://my.farm.bot/api/tokens", {
      user: {
        email: "favier+bot1@rhrk.uni-kl.de",
        password: "mYfarm2022*",
      },
    });
  }

  try {
    const promiseResult = await promise;
    const token = promiseResult.data.token.encoded;
    return token;
  } catch (error) {
    console.error("Accessing a token from my.farm.bot failed.");
    return null;
  }
}

/**
 * Get a new Farmbot object.
 * @returns {Farmbot} a FarmBot.
 * @param {boolean} useReal if true, uses the real Farmbot in lab. Otherwise, the Fakebot
 * @example const bot = await getAFarmbot();
 */
async function getNewFarmbot(useReal = false) {
  const token = await getNewToken(useReal);
  return new Farmbot({ token: token });
}

/***
 * moves Farmbot to a save z position
 * @param {BotController} botController the controller of the bot
 * @param {Farmbot} bot a Farmbot
 * @returns {Promise<Farmbot>} a bot to contain chaining
 */
async function moveToSafeZ(botController, bot) {
  console.log("Farmbot: move z to safety.");

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "moveToSafeZ",
    message: "Move to the safe Z",
    progress: 10,
    time: new Date().toISOString(),
  });

  // wait for the first status to arrive, will only be needed immediately after boot of backend, in other cases should not take time
  while (botController.getStatus() == null) {
    await bot.readStatus();
    await new Promise((r) => setTimeout(r, 1000));
  }

  const status = botController.getStatus();
  const currentX = status.location_data.position.x;
  const currentY = status.location_data.position.y;
  //console.log(currentX,currentY);
  return bot
    .moveAbsolute({
      x: currentX,
      y: currentY,
      z: botController.variables.Z_MIN_BUT_SAFE,
      speed: 100,
    })
    .then(() => {
      botController.broadcast("job", {
        id: jobId,
        name: "moveToSafeZ",
        message: "Move to the safe Z",
        progress: 100,
        time: new Date().toISOString(),
      });
      return bot;
    });
}

/***
 * Makes sure the Tooltip is connected after calling this function.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot a FarmBot.
 * @param {string} name Name of the Tooltip, which should be equipped.
 * @returns {Promise<>} Promise to continue chaining
 */
async function equipTooltip(botController, bot, name) {
  if (botController.config.currentTooltip) {
    // some Tooltip is connected
    console.log("some TT connected");

    if (isToolTipConnected(botController, name)) {
      return bot;
    } else {
      // wrong TT connected
      console.log("wrong TT connected");

      if (botController.config.currentTooltip) {
        return await bringCurrentTTHome(botController, bot).then(() => {
          return pickUpTooltip(botController, bot, name);
        });
      } else {
        return pickUpTooltip(botController, bot, name);
      }
    }
  } else {
    console.log("no TT connected");
    return unequippedAllToolTips(botController, bot).then(() => {
      return pickUpTooltip(botController, bot, name);
    });
  }
}

/**
 * Seed a single seed at plantPos taken from the seeder at seederPos.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot current Farmbot object
 * @param {{x,y,z,minimalDistance,plant,seedID,batchID,jobID}} plantPos position where to seed
 * @param {{x,y,z}} seederPos position from where to get the seed
 * @param {string} plantType type of plant (used for storing in database)
 * @returns {Promise<Farmbot>} a bot to continue chaining
 */
async function seed(botController, bot, plantPos, seederPos, plantType) {
  // let bot = await getAFarmbot();

  console.log("Farmbot: I'm going to seed at : ", plantPos);

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "seed",
    message: "Seed",
    progress: 10,
    time: new Date().toISOString(),
  });

  return pickUpSeed(botController, bot, seederPos)
    .then(function (bot) {
      console.log("--------> put in soil");

      botController.broadcast("job", {
        id: jobId,
        name: "seed",
        message: "Seed",
        progress: 50,
        time: new Date().toISOString(),
      });

      return putTheSeedFromNeedleIntoSoil(botController, bot, plantPos);
    })
    .then(async function (bot) {
      console.log("Farmbot: plant seeded at ", plantPos, ".");
      let seed = await storePlantedSeed(
        botController,
        plantType,
        plantPos,
        new Date().toString()
      );

      botController.broadcast("job", {
        id: jobId,
        name: "seed",
        message: "Seed",
        progress: 100,
        time: new Date().toISOString(),
      });

      let seeds = await botController.DB.listAllSeeds();
      botController.broadcast("seeds", seeds);

      return bot;
    });
}

/***
 * Waters a single plant.
 * @param {Farmbot} bot a FarmBot.
 * @param {{x,y,z, humidityCoeff}} plantPos position of plant with the height z and water coefficient
 * @param {Number} waterAmountMl amount to water in ml.
 * @param {boolean} useWater if useWater then bot uses real water, else its faked with LED-lighting
 * @returns {Promise<Farmbot>} a bot to continue chaining
 */

async function waterSingle(
  botController,
  bot,
  plantPos,
  waterAmountMl,
  useWater
) {
  console.log("Farmbot: I'm going to water at : ", plantPos);

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "watering",
    message: "watering",
    progress: 10,
    time: new Date().toISOString(),
  });

  const pin_number = useWater ? WATER_PIN : LIGHTING_PIN;

  return (
    bot
      // move above watering position
      .moveAbsolute({
        x: plantPos.x,
        y: plantPos.y,
        z: Math.max(plantPos.z, botController.variables.Z_MIN_BUT_SAFE),
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "watering",
          message: "watering",
          progress: 20,
          time: new Date().toISOString(),
        });

        // move at watering position
        return bot.moveAbsolute({
          x: plantPos.x,
          y: plantPos.y,
          z: plantPos.z,
        });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "watering",
          message: "watering",
          progress: 30,
          time: new Date().toISOString(),
        });

        // turn on water / light
        return bot.writePin({
          pin_mode: 0,
          pin_number: pin_number,
          pin_value: 1,
        });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "watering",
          message: "watering",
          progress: 40,
          time: new Date().toISOString(),
        });

        // wait for watering amount
        console.log(
          `Farmbot: Watering with coefficient ${WATER_CONVERSION_FACTOR} ml/ms`
        );

        // dynamically compute the Ml using the humidity
        const newWaterAmountMl = computeMlFromHumidity(waterAmountMl, plantPos.humidityValue)
        const waterAmountMs = newWaterAmountMl / WATER_CONVERSION_FACTOR; // ml/ms
        return new Promise((r) =>
          setTimeout(r, waterAmountMs)
        );
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "watering",
          message: "watering",
          progress: 80,
          time: new Date().toISOString(),
        });

        // turn off water / light
        return bot.writePin({
          pin_mode: 0,
          pin_number: pin_number,
          pin_value: 0,
        });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "watering",
          message: "watering",
          progress: 100,
          time: new Date().toISOString(),
        });

        // move above watering position
        return bot.moveAbsolute({
          x: plantPos.x,
          y: plantPos.y,
          z: Math.max(plantPos.z, botController.variables.Z_MIN_BUT_SAFE),
        });
      })
      .then(() => {
        return bot;
      })
  );
}

/**
 * Measures humidity at a single position and stores value in DB.
 * @param {Farmbot} bot a FarmBot.
 * @param {{x,y,z,x0,x1,y0,y1}} measurePos position where to measure
 * @returns {Promise<*>}
 */
async function measureHumiditySingle(botController, bot, measurePos) {
  console.log("Farmbot: I'm going to measure humidity at ", measurePos);

  let newX = measurePos.x + HUMIDITY_GAP_MEASUREMENT

  return (
    bot
      // move above pos
      .moveAbsolute({ x: newX, y: measurePos.y, z: botController.variables.Z_MIN_BUT_SAFE })
      .then(() => {
        // move down to pos
        return bot.moveAbsolute({
          x: newX,
          y: measurePos.y,
          z: HUMIDITY_Z_MEASUREMENT,
        });
      })
      .then(() => {
        return readPinHelper(botController, bot, 1, HUMIDITY_PIN);
      })
      .then(async (measuredHumidity) => {
        console.log("---> Measured Humidity: " + measuredHumidity);

        // Save humidity
        await storeMoistureData(botController, measurePos.id, measuredHumidity);

        let seeds = await botController.DB.listAllSeeds();
        botController.broadcast("seeds", seeds);
      })
      .then(() => {
        // move above pos / save height
        return bot.moveAbsolute({
          x: newX,
          y: measurePos.y,
          z: botController.variables.Z_MIN_BUT_SAFE,
        });
      })
  );
}

/**
 * Seeds one seed at all positions in listPlantPos from the seeder (at seederPos).
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot current Farmbot object
 * @param {[{x,y,z,minimalDistance,plant,seedID,batchID,jobID}]} listPlantPos list of positions where to seed
 * @param {{x,y,z}} seederPos position from where to get the seeds
 * @param {string} plantType type of plant (used for storing in database)
 * @returns {Promise<Farmbot>} a bot to continue chaining
 */
async function seedMultiple(
  botController,
  bot,
  listPlantPos,
  seederPos,
  plantType,
  totalNbSeeds
) {
  if (listPlantPos.length === 0) {
    return bot;
  }

  const firstPlantPos = listPlantPos[0];
  const residualPlantPos = listPlantPos.slice(1);

  return seed(botController, bot, firstPlantPos, seederPos, plantType).then(
    async function (bot) {
      let progress = (1 - residualPlantPos.length / totalNbSeeds) * 100;
      await updateJobProgress(botController, progress);

      return seedMultiple(
        botController,
        bot,
        residualPlantPos,
        seederPos,
        plantType,
        totalNbSeeds
      );
    }
  );
}

/***
 * Waters a list of plants.
 * @param {Farmbot} bot a FarmBot.
 * @param {[{x,y,z}]} listPlantPos list of plant positions with the height z
 * @param {Number} waterAmountMl amount to water in ml.
 * @param {boolean} useWater if useWater then bot uses real water, else its faked with LED-lighting
 * @returns {Farmbot} a bot to continue chaining
 */
async function waterMultiple(
  botController,
  bot,
  listPlantPos,
  waterAmountMl,
  useWater,
  totalNbPlants
) {
  if (listPlantPos.length === 0) {
    return bot;
  }

  const firstPlantPos = listPlantPos[0];
  const residualPlantPos = listPlantPos.slice(1);

  return waterSingle(
    botController,
    bot,
    firstPlantPos,
    waterAmountMl,
    useWater
  ).then(async (bot) => {
    let progress = (1 - residualPlantPos.length / totalNbPlants) * 100;
    await updateJobProgress(botController, progress);

    return waterMultiple(
      botController,
      bot,
      residualPlantPos,
      waterAmountMl,
      useWater,
      totalNbPlants
    );
  });
}

/**
 * Measures humidity of a list of positions and stores values in DB.
 * @param {Farmbot} bot a FarmBot.
 * @param {[{x,y,z,x0,x1,y0,y1}]} listMeasurePos list of positions where to measure
 * @returns {Farmbot} a bot to continue chaining
 */
async function measureHumidityMultiple(botController, bot, listMeasurePos, totalNbPos, jobId) {
  if (listMeasurePos.length === 0) {
    botController.broadcast("job", {
      id: jobId,
      name: "humidity",
      message: "Humidity",
      progress: 100,
      time: new Date().toISOString(),
    });

    return bot;
  }

  botController.broadcast("job", {
    id: jobId,
    name: "humidity",
    message: "Humidity",
    progress: ((totalNbPos - listMeasurePos.length) / totalNbPos) * 100,
    time: new Date().toISOString(),
  });

  const firstMeasurePos = listMeasurePos[0];
  const residualMeasurePos = listMeasurePos.slice(1);

  return await measureHumiditySingle(botController, bot, firstMeasurePos)
    .then(() => {
      return measureHumidityMultiple(botController, bot, residualMeasurePos, totalNbPos, jobId);
    })
    .then(() => {
      return bot;
    });
}

// ============================================================================================================================================================================================================================

/**
 * Helper function to read the value on a pin and receive the result (as a Promise).
 * @param {BotController} botController a BotController.
 * @param {Farmbot} bot a FarmBot.
 * @param {number} pin_mode digital_mode: 0; analog_mode: 1
 * @param {number} pin_number
 * @returns {Promise<number>} read Pin value
 * @example
 * .then(() => {
 *      return readPinHelper(botController, bot, 1, PIN);
 * })
 * .then((result) => {
 *      console.log(result);
 * })
 */
async function readPinHelper(botController, bot, pin_mode, pin_number) {
  return bot
    .readPin({ pin_mode: pin_mode, pin_number: pin_number })
    .then(async (RpcOk) => {
      const timePinRead = dateTime.create().now();
      let status = botController.getStatus();
      // while older status, wait for new one
      while (status.receivedTime < timePinRead) {
        await bot.readStatus();
        await new Promise((r) => setTimeout(r, 1000));
        status = botController.getStatus();
      }
      const measuredValue = status.pins[pin_number].value;
      // console.log("measured: ", measuredValue);
      return measuredValue;
    });
}

async function checkIfNextJonNeedCurrentTT(botController) {
  // Check if the current TT will be used by the next job
  if (botController.jobQueue.length > 0) {
    const nextJobID = botController.jobQueue[0];
    let nextJob = await botController.DB.getJobById(nextJobID);

    if (nextJob) {
      return isToolTipConnected(botController, nextJob.operation);
    }
  }

  return false;
}

/***
 * Brings home the currently connected Tooltip.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot a FarmBot.
 * @returns {Promise<number | undefined>} Promise to continue chaining
 */
async function bringCurrentTTHome(botController, bot) {
  const pos = getPosOfCurrentTooltip(botController);

  console.log("brings home TT to : ", pos);

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "bringCurrentTTHome",
    message: "Bring current Tooltip home",
    progress: 10,
    time: new Date().toISOString(),
  });

  return (
    bot
      // move above insert position
      .moveAbsolute({
        x: pos.x - TOOLTIP_CATCH_DISTANZ,
        y: pos.y,
        z: botController.variables.Z_MIN_BUT_SAFE,
        speed: 100,
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "bringCurrentTTHome",
          message: "Bring current Tooltip home",
          progress: 40,
          time: new Date().toISOString(),
        });

        // move to insert position
        return bot.moveAbsolute({
          x: pos.x - TOOLTIP_CATCH_DISTANZ,
          y: pos.y,
          z: pos.z,
          speed: 100,
        });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "bringCurrentTTHome",
          message: "Bring current Tooltip home",
          progress: 60,
          time: new Date().toISOString(),
        });

        // move into slot
        return bot.moveAbsolute({ x: pos.x, y: pos.y, z: pos.z, speed: 100 });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "bringCurrentTTHome",
          message: "Bring current Tooltip home",
          progress: 80,
          time: new Date().toISOString(),
        });

        return unequippedToolTip(botController, bot);
      })
      .then(() => {
        // move up

        botController.broadcast("job", {
          id: jobId,
          name: "bringCurrentTTHome",
          message: "Bring current Tooltip home",
          progress: 100,
          time: new Date().toISOString(),
        });

        return bot.moveAbsolute({
          x: pos.x,
          y: pos.y,
          z: botController.variables.Z_MIN_BUT_SAFE,
          speed: 100,
        });
      })
  );
}

/***
 * Picks up the Tooltip.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot a FarmBot.
 * @param {string} name Name of the Tooltip, which should be picked up.
 * @returns {Promise<number | undefined>} Promise to continue chaining
 */
async function pickUpTooltip(botController, bot, name) {
  const pos = toolTipNameToPos(name);
  console.log("picking up TT from: ", pos);

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "pickUpTooltip",
    message: `pickup tooltips -> ${name}`,
    progress: 10,
    time: new Date().toISOString(),
  });

  return (
    bot
      // move above pickup position
      .moveAbsolute({
        x: pos.x,
        y: pos.y,
        z: botController.variables.Z_MIN_BUT_SAFE,
        speed: 100,
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpTooltip",
          message: `pickup tooltips -> ${name}`,
          progress: 40,
          time: new Date().toISOString(),
        });

        // pickup
        return bot.moveAbsolute({ x: pos.x, y: pos.y, z: pos.z, speed: 100 });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpTooltip",
          message: `pickup tooltips -> ${name}`,
          progress: 60,
          time: new Date().toISOString(),
        });

        return equippedToolTip(botController, bot, name);
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpTooltip",
          message: `pickup tooltips -> ${name}`,
          progress: 80,
          time: new Date().toISOString(),
        });

        // move out of slot
        return bot.moveAbsolute({
          x: pos.x - TOOLTIP_CATCH_DISTANZ,
          y: pos.y,
          z: pos.z,
          speed: 100,
        });
      })
      .then(() => {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpTooltip",
          message: `pickup tooltips -> ${name}`,
          progress: 100,
          time: new Date().toISOString(),
        });

        // move up
        return bot.moveAbsolute({
          x: pos.x - TOOLTIP_CATCH_DISTANZ,
          y: pos.y,
          z: botController.variables.Z_MIN_BUT_SAFE,
          speed: 100,
        });
      })
  );
}

/**
 *
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot current Farmbot object
 * @param {{x,y,z}} seeder_pos xyz Position from where to get the seed
 * @returns {Promise<Farmbot>} a bot to continue chaining
 */
function pickUpSeed(botController, bot, seeder_pos) {
  console.log("Farmbot: going to pick up seed!");

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "pickUpSeed",
    message: "Pickup seed",
    progress: 10,
    time: new Date().toISOString(),
  });

  return (
    bot
      // move above Seeder
      .moveAbsolute({
        x: seeder_pos.x,
        y: seeder_pos.y,
        z: botController.variables.Z_MIN_BUT_SAFE,
        speed: 100,
      })
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpSeed",
          message: "Pickup seed",
          progress: 40,
          time: new Date().toISOString(),
        });

        // move down into seeder
        return bot.moveAbsolute({
          x: seeder_pos.x,
          y: seeder_pos.y,
          z: seeder_pos.z,
          speed: 100,
        });
      })
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpSeed",
          message: "Pickup seed",
          progress: 60,
          time: new Date().toISOString(),
        });

        // turn on vacuum
        return turnOnVacuum(botController, bot);
      })
      .then(function (bot) {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpSeed",
          message: "Pickup seed",
          progress: 80,
          time: new Date().toISOString(),
        });

        // move up, so needle won't break
        return bot.moveAbsolute({
          x: seeder_pos.x,
          y: seeder_pos.y,
          z: botController.variables.Z_MIN_BUT_SAFE,
          speed: 100,
        });
      })
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "pickUpSeed",
          message: "Pickup seed",
          progress: 100,
          time: new Date().toISOString(),
        });

        return bot;
      })
  );
}

/**
 * If seed is already on the needle and vacuum pump is on, then this function brings the seed into the pos and turns off the vacuum pump.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot current Farmbot object
 * @param {{x,y,z}} pos xyz Position where to put the seed.
 * @returns {Promise<Farmbot>} a bot to continue chaining
 */
function putTheSeedFromNeedleIntoSoil(botController, bot, pos) {
  console.log("Farmbot: put the seed into the soil!", pos);

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "putTheSeedFromNeedleIntoSoil",
    message: "Put the seed from needle into soil",
    progress: 10,
    time: new Date().toISOString(),
  });

  return (
    bot
      // move above pos
      .moveAbsolute({
        x: pos.x,
        y: pos.y,
        z: botController.variables.Z_MIN_BUT_SAFE,
        speed: 100,
      })
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "putTheSeedFromNeedleIntoSoil",
          message: "Put the seed from needle into soil",
          progress: 40,
          time: new Date().toISOString(),
        });

        // move down at pos
        return bot.moveAbsolute({ x: pos.x, y: pos.y, z: pos.z, speed: 100 });
      })
      // turn off vacuum pump
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "putTheSeedFromNeedleIntoSoil",
          message: "Put the seed from needle into soil",
          progress: 60,
          time: new Date().toISOString(),
        });

        return turnOffVacuum(botController, bot);
      })
      // move up, so needle won't break
      .then(function (bot) {
        botController.broadcast("job", {
          id: jobId,
          name: "putTheSeedFromNeedleIntoSoil",
          message: "Put the seed from needle into soil",
          progress: 80,
          time: new Date().toISOString(),
        });

        return bot.moveAbsolute({
          x: pos.x,
          y: pos.y,
          z: botController.variables.Z_MIN_BUT_SAFE,
          speed: 100,
        });
      })
      .then(function () {
        botController.broadcast("job", {
          id: jobId,
          name: "putTheSeedFromNeedleIntoSoil",
          message: "Put the seed from needle into soil",
          progress: 100,
          time: new Date().toISOString(),
        });

        return bot;
      })
  );
}

/**
 * Turns on the vacuum pump.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot
 * @returns {Promise<Farmbot>}
 */
function turnOnVacuum(botController, bot) {
  console.log("Farmbot: turning on vacuum pump!");

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "turnOnVacuum",
    message: "Turnon vacum",
    progress: 10,
    time: new Date().toISOString(),
  });

  return bot
    .writePin({
      pin_mode: 0,
      pin_number: VACUUM_PIN,
      pin_value: 1,
    })
    .then(function () {
      botController.broadcast("job", {
        id: jobId,
        name: "turnOnVacuum",
        message: "Turnon vacum",
        progress: 100,
        time: new Date().toISOString(),
      });

      return bot;
    });
}

/**
 * Turns off the vacuum pump.
 * @param {BotController} botController the controller of the Bot.
 * @param {Farmbot} bot
 * @returns {Promise<Farmbot>}
 */
function turnOffVacuum(botController, bot) {
  console.log("Farmbot: turning off vacuum pump!");

  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "turnOffVacuum",
    message: "Turn-off vacum",
    progress: 10,
    time: new Date().toISOString(),
  });

  return bot
    .writePin({ pin_mode: 0, pin_number: VACUUM_PIN, pin_value: 0 })
    .then(function () {
      botController.broadcast("job", {
        id: jobId,
        name: "turnOffVacuum",
        message: "Turn-off vacum",
        progress: 100,
        time: new Date().toISOString(),
      });

      return bot;
    });
}

function emergencyLock(botController, bot) {
  console.log("Farmbot: Emergency Lock");

  return bot.emergencyLock().then(function (param) {
    botController.broadcast("emergencyLock", { message: "Farmbot locked" });
  });
}

function emergencyUnLock(botController, bot) {
  console.log("Farmbot: Emergency UnLock");

  return bot.emergencyUnlock().then(function (param) {
    botController.broadcast("emergencyUnLock", { message: "Farmbot unlocked" });
  });
}

module.exports = {
  getNewToken,
  getNewFarmbot,
  moveToSafeZ,
  equipTooltip,
  seed,
  waterSingle,
  waterMultiple,
  seedMultiple,
  emergencyLock,
  emergencyUnLock,
  bringCurrentTTHome,
  checkIfNextJonNeedCurrentTT,
  measureHumidityMultiple,
};
