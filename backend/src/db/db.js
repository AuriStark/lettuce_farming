const mongoose = require("mongoose");
const { JobModel, seedModel, userModel, humidityModel } = require("./models");
const {
  Z_MIN_BUT_SAFE,
  Z_TO_SEED_SAFE,
  DEFAULT_Z_TO_WATERING_RADISH,
  DEFAULT_Z_TO_WATERING_LETTUCE,
  DEFAULT_INTERVAL_WATERING_RADISH,
  DEFAULT_INTERVAL_WATERING_LETTUCE,
  DEFAULT_AMOUNT_WATERING_RADISH,
  DEFAULT_AMOUNT_WATERING_LETTUCE,
  HUMIDITY_INTERVAL,
  VACUUM_PIN,
  WATER_PIN,
  LIGHTING_PIN,
  HUMIDITY_PIN,
  TOOL_CONNECTED_PIN,
  SEEDER_POS
} = require("../farmbot/const");

class DB {
  constructor() {
    this.initDB();
  }

  initDB() {
    let mongoURL = process.env.MONGODB_URL ?? "mongodb://127.0.0.1:27017/FarmBot";
    mongoose.set("strictQuery", false);
    mongoose
      .connect(
        `${mongoURL}`
      )
      .then(() => {
        console.log("connection to database is successfull");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // ========================================================[ Job ]========================================================
  async insertJobToDB(params) {
    const seeding = await JobModel.create(params);
  }
 
  async listAllJobs() {
    const jobs = await JobModel.find({});
    return jobs;
  }

  async deleteJob(id) {
    const job = await JobModel.findByIdAndDelete(id);
    return job;
  }

  async editJob(id, params) {
    const job = await JobModel.findByIdAndUpdate(id, params);
    return job;
  }

  async getJobByOperation(operation) {
    const job = await JobModel.find({ operation: operation });
    return job;
  }

  async getJobById(id) {
    const job = await JobModel.findById(id);
    return job;
  }

  async getJobsByIds(ids) {
    const jobs = await JobModel.find({ _id: { $in: ids } });
    return jobs;
  }

  async getActivatedWateringJobs() {
    const jobs = await JobModel.find({ operation: 'watering', "wateringDetails.activated": true });
    return jobs;
  }


  // ========================================================[ Seed ]========================================================
  async insertSeededData(params) {
    const seed = await seedModel.create(params);
    return seed;
  }

  async getSeededByType(type) {
    const seedings = await seedModel.find({cropType: type});
    return seedings;
  }

  async listAllSeeds() {
    const seeds = await seedModel.find({});
    return seeds;
  }

  async editSeed(id, params) {
    const job = await seedModel.findByIdAndUpdate(id, params);
    return job;
  }

  // ========================================================[ User ]========================================================
  async insertUserData(params) {
    const user = await userModel.create(params);
    return user;
  }

  async editUser(params) {
    try {
      const user = await this.getUserDatas();

      if (user._id) {
        await userModel.findByIdAndUpdate(user._id, params);
      } else {
        await this.insertUserData(params);
      }
      const newUser = await this.getUserDatas();
      return newUser;
    } catch (error) {
      console.log("...........", error);
    }
  }

  async getUserDatas() {
    let users = await userModel.find({});
    let user = users[0];

    if (user) {
      return user;
    } else {
      return {
        zSafe: Z_MIN_BUT_SAFE,
        zSeedSafe: Z_TO_SEED_SAFE,
        seederPos: SEEDER_POS,
        humidityInterval: HUMIDITY_INTERVAL,
        defaultValues: {
          radish : {
            wateringAmount: DEFAULT_AMOUNT_WATERING_RADISH,
            wateringDistanceAbeveTheGround: DEFAULT_Z_TO_WATERING_RADISH,
            wateringInterval: DEFAULT_INTERVAL_WATERING_RADISH,
          },
          lettuce : {
            wateringAmount: DEFAULT_AMOUNT_WATERING_LETTUCE,
            wateringDistanceAbeveTheGround: DEFAULT_Z_TO_WATERING_LETTUCE,
            wateringInterval: DEFAULT_INTERVAL_WATERING_LETTUCE,
          },
        }
      };
    }
  }
}

module.exports = DB;
