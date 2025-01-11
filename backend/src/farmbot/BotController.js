const { nanoid } = require("nanoid");

const { emitInfoFromStatus } = require("./helperStatus");
const Db = require("../db/db");
const {
  computesSeedPositions,
  checkHumidityValue,
  sortPlantByPosition,
} = require("./computations");

const { updateJobToDone } = require("./helperDB");

const {
  getNewFarmbot,
  moveToSafeZ,
  equipTooltip,
  seed,
  seedMultiple,
  waterSingle,
  waterMultiple,
  emergencyLock,
  emergencyUnLock,
  bringCurrentTTHome,
  checkIfNextJonNeedCurrentTT,
  measureHumidityMultiple,
} = require("./botUtils");

const { updateLastWaterTime } = require("./helperDB");

class BotController {
  useRealbot = false;
  currentStatus = null;
  bot = null;
  io = null;
  DB = null;

  lock = false;
  jobQueue = [];
  currentJobID = null;

  config = {
    currentTooltip: null,
  };

  variables = {};

  /**
   * @param {boolean} useRealbot whether to use the real Farmbot in lab or the fake bot.
   */
  constructor(useRealbot = false, io) {
    this.useRealbot = useRealbot;
    this.io = io;
    this.DB = new Db();

    this.loadVariables();
    this.connectToStatus();
  }

  loadVariables() {
    try {
      this.DB.getUserDatas().then((data) => {
        if (data.zSafe) this.variables.Z_MIN_BUT_SAFE = data.zSafe;
        if (data.zSeedSafe) this.variables.Z_TO_SEED_SAFE = data.zSeedSafe;
        if (data.seederPos) this.variables.SEEDER_POS = data.seederPos;
        if (data.humidityInterval)
          this.variables.HUMIDITY_INTERVAL = data.humidityInterval;
      });
    } catch (error) {}
  }

  /**
   * A function the require a new connection to the bot
   * @returns a new Bot
   */
  async getNewBot(){
    return await getNewFarmbot(this.useRealbot);
  }

  /**
   * Seed a single seed at plantPos taken from the seeder at seederPos.
   * @param {{x,y,z,minimalDistance,plant,seedID,batchID,jobID}} plantPos position where to seed
   * @param {{x,y,z}} seederPos position from where to get the seed
   * @param {string} plantType type of plant (used for storing in database)
   * @returns {boolean} whether operation succeeded
   */
  async seedSingle(plantPos, seederPos, plantType) {
    let bot = await this.getNewBot();

    return await bot
      .connect()
      .then(async () => {
        // move up z-axis, so needle won't break
        return await moveToSafeZ(this, bot);
      })
      .then(async () => {
        return await equipTooltip(this, bot, "seeding");
      })
      .then(async () => {
        return await seed(this, bot, plantPos, seederPos, plantType);
      })
      .then(async () => {
        let check = await checkIfNextJonNeedCurrentTT(this);
        if (!check) {
          await bringCurrentTTHome(this, bot);
        }
        await updateJobToDone(this, this.currentJobID);
        return bot.client.end();
      })
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log("Farmbot: couldn't seed your job, because ", reason);
        return false;
      });
  }

  async waterSingle(plantPos, waterAmountMl, useWater) {
    let bot = await this.getNewBot();
    return await bot
      .connect()
      .then(() => {
        // move up z-axis, so needle won't break
        return moveToSafeZ(this, bot);
      })
      .then(() => {
        return equipTooltip(this, bot, "watering");
      })
      .then(() => {
        return waterSingle(this, plantPos, waterAmountMl, useWater);
      })
      .then(async () => {
        let check = await checkIfNextJonNeedCurrentTT(this);
        if (!check) {
          await bringCurrentTTHome(this, bot);
        }
        await updateJobToDone(this, this.currentJobID);
        return bot.client.end();
      })
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log("Farmbot: couldn't water your job, because ", reason);
        return false;
      });
  }

  /**
   * Seeds one seed at all positions in listPlantPos from the seeder (at seederPos).
   * @param {[{x,y,z,minimalDistance,plant,seedID,batchID,jobID}]} listPlantPos list of positions where to seed
   * @param {{x,y,z}} seederPos position from where to get the seeds
   * @param {string} plantType type of plant (used for storing in database)
   * @returns {boolean} whether operation succeeded
   */
  async seedMultiple(listPlantPos, seederPos, plantType) {
    let bot = await this.getNewBot();
    return await bot
      .connect()
      .then(async () => {
        // move up z-axis, so needle won't break
        console.log("--------> move to safe Z");
        return await moveToSafeZ(this, bot);
      })
      .then(async () => {
        console.log("--------> equiping");
        return await equipTooltip(this, bot, "seeding");
      })
      .then(async () => {
        console.log("--------> Start seeding multiple");
        return await seedMultiple(
          this,
          bot,
          listPlantPos,
          seederPos,
          plantType,
          listPlantPos.length
        );
      })
      .then(async () => {
        let check = await checkIfNextJonNeedCurrentTT(this);
        if (!check) {
          await bringCurrentTTHome(this, bot);
        }
        await updateJobToDone(this, this.currentJobID);
        return bot.client.end();
      })
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log("Farmbot: couldn't seed your job, because \n", reason);
        return false;
      });
  }

  /***
   * Waters a list of plants.
   * @param {[{x,y,z}]} listPlantPos list of plant positions with the height z
   * @param {Number} waterAmountMl amount to water in ml.
   * @param {{id}} waterJobObj object with the id to update in database after success
   * @param {Boolean} useWater if useWater then bot uses real water, else its faked with LED-lighting
   * @returns {Promise<boolean>}
   */
  async waterMultiple(
    listPlantPos,
    waterAmountMl,
    waterJobObj,
    useWater = true
  ) {
    let bot = await this.getNewBot();

    return await bot
      .connect()
      .then(async () => {
        // move up z-axis, so needle won't break
        console.log("--------> move to safe Z 0");
        return await moveToSafeZ(this, bot);
      })
      .then(async () => {
        console.log("--------> equiping");
        return await equipTooltip(this, bot, "watering");
      })
      .then(async () => {
        return await waterMultiple(
          this,
          bot,
          listPlantPos,
          waterAmountMl,
          useWater,
          listPlantPos.length
        );
      })
      .then(async () => {
        let check = await checkIfNextJonNeedCurrentTT(this);
        if (!check) {
          await bringCurrentTTHome(this, bot);
        }
        await updateLastWaterTime(this, this.currentJobID);
        return bot.client.end();
      })
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log("Farmbot: couldn't water your job, because \n", reason);
        return false;
      });
  }

  /**
   * Measures the humidity at multiple positions and writes the values into the DB.
   * @param {[{x,y,z,x0,x1,y0,y1}]} listMeasurePos list of positions where to measure (and information to which rectangle they belong)
   * @returns {Promise<boolean>} whether job succeeded
   */
  async measureHumidityMultiple(listMeasurePos) {
    let bot = await this.getNewBot();
    return await bot
      .connect()
      .then(() => {
        // move up z-axis, so needle won't break
        return moveToSafeZ(this, bot);
      })
      .then(() => {
        return equipTooltip(this, bot, "moisture");
      })
      .then(() => {
        const jobId = nanoid();

        return measureHumidityMultiple(
          this,
          bot,
          listMeasurePos,
          listMeasurePos.length,
          jobId
        );
      })
      .then(async () => {
        let check = await checkIfNextJonNeedCurrentTT(this);
        if (!check) {
          await bringCurrentTTHome(this, bot);
        }
        await updateLastWaterTime(this, this.currentJobID);
        return bot.client.end();
      })
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log(
          "Farmbot: couldn't measure the humidities, because \n",
          reason
        );
        return false;
      });
  }

  connectToStatus() {
    console.log("Start");

    this.getNewBot().then((bot) => {
      this.bot = bot;
      this.bot.on("status", (status) => {
        console.log("Farmbot: receiving status");
        this.currentStatus = status;
        emitInfoFromStatus(status, this.io);
      });

      this.bot.on("logs", (logs) => {
        console.log("Farmbot: LOGS : ", logs);
        this.io.emit("log", logs);
      });

      this.bot.on("offline", (payload) => {
        //TODO
        console.log("Farmbot: OFFLINE : ", payload);
      });

      this.bot.on("online", (payload) => {
        //TODO
        console.log("Farmbot: ONLINE : ", payload);
      });

      this.bot.connect().then((bot) => {
        console.log("Bot online!");

        return bot.readStatus().then((status) => {
          this.currentStatus = status;
          console.log("======> 1", status);
        });
      });
    });
  }
  /**
   * Get the current status object of the Farmbot.
   * @returns
   */
  getStatus() {
    return this.currentStatus;
  }

  /**
   *
   * @param {String} events
   * @param {Object} params
   */
  broadcast(event, params) {
    this.io.emit(event, params);
  }

  async addJobInQueue(id) {
    this.jobQueue.push(id);

    let jobs = await this.getJobInQueueFromIDS();
    this.broadcast("listjobsqueue", jobs);
  }

  async startJob(param) {
    this.lock = true;

    if (typeof param == "object") {
      await this.startjobWithPayload(param);
    } else {
      await this.startjobWithID(param);
    }

    this.lock = false;
    this.currentJobID = null;
    this.broadcast("currentjob", null);

    // Start the next job in the queue
    if (this.jobQueue.length > 0) {
      const nextJob = this.jobQueue.shift();

      let jobs = await this.getJobInQueueFromIDS();
      this.broadcast("listjobsqueue", jobs);

      this.startJob(nextJob);
    }
  }

  async startjobWithID(id) {
    this.currentJobID = id;

    let job = await this.DB.getJobById(id);

    await this.startjobNext(job);
  }

  async startjobWithPayload(payload) {
    this.currentJobID = payload.id;

    await this.startjobNext(payload);
  }

  async startjobNext(job) {
    this.broadcast("currentjob", job.id);
    this.broadcast("jobstarted", {
      jobId: job.id,
      message: `The job ${job.name} is started`,
    });

    if (job.operation == "seeding") {
      //start seeding operation
      let listPlantPos = computesSeedPositions(
        job.fieldBondary,
        job.seedingDetails.plantDistance,
        job.seedingDetails.depth,
        this.variables.Z_TO_SEED_SAFE
      );

      // Seed multiple
      await this.seedMultiple(
        listPlantPos,
        this.variables.SEEDER_POS,
        job.seedingDetails.cropType
      );
    } else if (job.operation == "watering") {
      //start watering job here
      const croptype = job.wateringDetails.cropType;
      let plants = await this.DB.getSeededByType(croptype);
      let plantPos = [];

      plants.forEach((plant) => {
        plantPos.push({
          id: plant._id,
          x: plant.position.x,
          y: plant.position.y,
          z: job.wateringDetails.heightAboveGround,
          humidityValue: job.wateringDetails.humidityValue,
        });
      });

      plantPos = sortPlantByPosition(plantPos);

      // check if the humidity value of every plants are not too old
      let nbOfOldValues = 0;

      plants.forEach((plant) => {
        if (!checkHumidityValue(plant, this.variables.HUMIDITY_INTERVAL)) {
          nbOfOldValues++;
        }
      });

      // Check if a maximum of 1/3 of the values are old
      if (nbOfOldValues > plants.length / 3) {
        // Measure humidity
        await this.measureHumidityMultiple(plantPos);

        plants = await this.DB.getSeededByType(croptype);
        plantPos = [];

        plants.forEach((plant) => {
          plantPos.push({
            x: plant.position.x,
            y: plant.position.y,
            z: job.wateringDetails.heightAboveGround,
            humidityValue: job.wateringDetails.humidityValue,
          });
        });

        plantPos = sortPlantByPosition(plantPos);
      }

      // Do watering
      await this.waterMultiple(plantPos, job.id, true);

      // Measure humidity again
      await this.measureHumidityMultiple(plantPos);
    } else if (job.operation == "humidity") {
      console.log("---------------> get plants")
      let plants = await this.DB.getSeededByType(croptype);
      let plantPos = [];

      plants.forEach((plant) => {
        plantPos.push({
          id: plant._id,
          x: plant.position.x,
          y: plant.position.y,
          z: job.wateringDetails.heightAboveGround,
          humidityValue: job.wateringDetails.humidityValue,
        });
      });

      plantPos = sortPlantByPosition(plantPos);

      await this.measureHumidityMultiple(plantPos);
    }

    this.broadcast("jobdone", {
      jobId: job.id,
      message: `The job ${job.name} is done`,
    });
  }

  async getJobInQueueFromIDS() {
    let jobs = await this.DB.getJobsByIds(this.jobQueue);
    return jobs;
  }

  async sendAllInfoWhenConnecting(socket) {
    socket.emit("currentjob", this.currentJobID);

    let jobs = await this.getJobInQueueFromIDS();
    socket.emit("listjobsqueue", jobs);
    socket.emit("resetStepJob");

    let data = await this.DB.getUserDatas();
    socket.emit("userDatas", data);

    socket.emit("currentTooltip", this.config.currentTooltip);
  }

  async resendJobs() {
    const jobs = await this.DB.listAllJobs();
    this.broadcast("farmJobs", jobs);
  }

  async emergencyLock() {
    let bot = await this.getNewBot();
    return await bot.connect().then(async () => {
      emergencyLock(this, bot);
    });
  }

  async emergencyUnLock() {
    let bot = await this.getNewBot();
    return await bot.connect().then(async () => {
      emergencyUnLock(this, bot);
    });
  }

  setCurrentTooltip(name) {
    this.config.currentTooltip = name;
    this.broadcast("currentTooltip", this.config.currentTooltip);
  }
}

module.exports = BotController;
