const {
  WATERIN_TOOL_POS,
  SOIL_SENSOR_TOOL_POS,
  SEEDER_TOOL_POS,
  TOOL_CONNECTED_PIN,
} = require("./const");

const { nanoid } = require("nanoid");

/**
 *
 * @param {String} name
 */
function isToolTipConnected(botController, name) {
  return botController.config.currentTooltip == name;
}

/**
 *
 * @param {FarmBot} bot
 */
function unequippedToolTip(botController, bot) {
  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "equippedToolTip",
    message: "unequip tooltips",
    progress: 10,
    time: new Date().toISOString(),
  });

  botController.config.currentTooltip = null;
  return bot
    .writePin({
      pin_mode: 0,
      pin_number: TOOL_CONNECTED_PIN,
      pin_value: 0,
    })
    .then(function () {
      botController.broadcast("job", {
        id: jobId,
        name: "equippedToolTip",
        message: "unequip tooltips",
        progress: 100,
        time: new Date().toISOString(),
      });

      return bot;
    });
}

/**
 *
 * @param {FarmBot} bot
 */
function equippedToolTip(botController, bot, name) {
  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "equippedToolTip",
    message: "equip tooltips: " + name,
    progress: 10,
    time: new Date().toISOString(),
  });

  botController.setCurrentTooltip(name);

  return bot
    .writePin({
      pin_mode: 0,
      pin_number: TOOL_CONNECTED_PIN,
      pin_value: 1,
    })
    .then(function () {
      botController.broadcast("job", {
        id: jobId,
        name: "equippedToolTip",
        message: "equip tooltips: " + name,
        progress: 100,
        time: new Date().toISOString(),
      });

      return bot;
    });
}

/**
 *
 * @param {FarmBot} bot
 */
function unequippedAllToolTips(botController, bot) {
  //TODO
  const jobId = nanoid();
  botController.broadcast("job", {
    id: jobId,
    name: "unequippedAllToolTips",
    message: "Unequip all tooltips",
    progress: 10,
    time: new Date().toISOString(),
  });

  return unequippedToolTip(botController, bot).then(function () {
    botController.broadcast("job", {
      id: jobId,
      name: "unequippedAllToolTips",
      message: "Unequip all tooltips",
      progress: 100,
      time: new Date().toISOString(),
    });

    return bot;
  });
}

/**
 *
 * @param {BotController} bot
 */
function getPosOfCurrentTooltip(botController) {
  return toolTipNameToPos(botController.config.currentTooltip);
}

function toolTipNameToPos(name) {
  switch (name) {
    case "seeding":
    case "seeder":
      return SEEDER_TOOL_POS;
    case "watering":
    case "waterin":
      return WATERIN_TOOL_POS;
    case "moisture":
    case "soil":
      return SOIL_SENSOR_TOOL_POS;
  }
  return null;
}

module.exports = {
  isToolTipConnected,
  unequippedToolTip,
  equippedToolTip,
  unequippedAllToolTips,
  getPosOfCurrentTooltip,
  toolTipNameToPos,
};
