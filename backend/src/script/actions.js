const BotController = require("../farmbot/BotController");
const { equipTooltip } = require("../farmbot/botUtils");

/**
 *
 * @param {{x: number, y: number, z: number}} position
 * @param {BotController} botController
 * @returns
 */
async function move({ x, y, z }, botController) {
  //let bot = await botController.getNewBot();
  let bot = botController.bot;

  const status = botController.getStatus();
  const currentX = status.location_data.position.x;
  const currentY = status.location_data.position.y;
  const currentZ = status.location_data.position.z;

  botController.broadcast("actionLog", {
    name: "move",
    arguments: { x, y, z },
    message: `Moving robot to (${x}, ${y}, ${z})`,
    time: new Date().toISOString(),
  });

  return bot
    .moveAbsolute({
      x: x ?? currentX,
      y: y ?? currentY,
      z: z ?? currentZ,
      speed: 100,
    })
    .then(function () {
      botController.broadcast("actionLog", {
        name: "move",
        arguments: { x, y, z },
        message: `Robot moved to (${x}, ${y}, ${z})`,
        time: new Date().toISOString(),
        success: true,
      });

      return bot;
    });
}

/**
 *
 * @param {{pin: number, state: boolean}} param0
 * @param {BotController} botController
 * @returns
 */
async function control({ pin, state }, botController) {
  //let bot = await botController.getNewBot();
  let bot = botController.bot;

  botController.broadcast("actionLog", {
    name: "control",
    arguments: { pin, state },
    message: `Try to set the value of pin (${pin}), to (${state})`,
    time: new Date().toISOString(),
  });

  return bot
    .writePin({
      pin_mode: 0,
      pin_number: pin,
      pin_value: state ? 1 : 0,
    })
    .then(function () {
      botController.broadcast("actionLog", {
        name: "control",
        arguments: { pin, state },
        message: `The value of pin (${pin}) have been set to (${state})`,
        time: new Date().toISOString(),
        success: true,
      });

      return bot;
    });
}

/**
 *
 * @param {{x: boolean, y: boolean, z: boolean}} param0
 * @param {BotController} botController
 * @returns
 */
async function home({ x, y, z }, botController) {
  return move(
    {
      x: x ? 0 : undefined,
      y: y ? 0 : undefined,
      z: z ? 0 : undefined,
    },
    botController
  );
}

/**
 *
 * @param {{tool: string}} param0
 * @param {BotController} botController
 * @returns
 */
async function pick({ tool }, botController) {
  //let bot = await botController.getNewBot();
  let bot = botController.bot;
  return await equipTooltip(botController, bot, tool);
}

module.exports = {
  move,
  control,
  home,
  pick,
};
