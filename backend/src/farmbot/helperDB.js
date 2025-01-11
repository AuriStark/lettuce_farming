/**
 *
 * @param {String} plantType
 * @param {{x: Number, y: Number, z: Number}} plantPos
 * @param {String} seddedTime
 */
async function storePlantedSeed(
  botController,
  plantType,
  positionvalue,
  seededtime
) {
  const cropType = plantType;

  const seedpositionX = positionvalue.x;
  const seedpositionY = positionvalue.y;
  const seedpositionZ = positionvalue.z;
  const position = { x: seedpositionX, y: seedpositionY, z: seedpositionZ };

  const dataobject = { cropType, position, seededtime };

  let seed = await botController.DB.insertSeededData(dataobject);
  return seed;
}

function computeScheduledDate(currentDate, intervalHours) {
  var scheduledDate = new Date(currentDate);
  scheduledDate.setHours(scheduledDate.getHours() + intervalHours);
  return scheduledDate;
}

/**
 *
 * @param {Object} waterJobObj
 */
async function updateLastWaterTime(botController, id, interval) {
  let job = await botController.DB.getJobById(id);

  let date = new Date();

  var scheduledDate = computeScheduledDate(date, job.wateringDetails.interval);

  let wateringDetails = job.wateringDetails;
  let listDates = wateringDetails.executedDates ?? [];
  listDates.push(date.toISOString());

  wateringDetails.executedDates = listDates;
  wateringDetails.scheduledAt = scheduledDate.toISOString();

  let newJob = await botController.DB.editJob(id, {
    progress: 0,
    executed: false,
    executedAt: date.toISOString(),
    wateringDetails: wateringDetails,
  });

  await botController.resendJobs();
  return newJob;
}

async function updateJobToDone(botController, id) {
  let job = await botController.DB.editJob(id, {
    progress: 100,
    executed: true,
    executedAt: new Date().toISOString(),
  });

  await botController.resendJobs();
  return job;
}

async function updateJobProgress(botController, progress) {
  let job = await botController.DB.editJob(botController.currentJobID, {
    progress: progress,
  });

  await botController.resendJobs();
  return job;
}

//function to store humidity data
async function storeMoistureData(botController, id, value) {
  let job = await botController.DB.editSeed(id, {
    humidityValue: value,
    lastHumdityMeasureTime: new Date().toISOString(),
  });
  return job;
}

module.exports = {
  storePlantedSeed,
  updateJobToDone,
  updateJobProgress,
  updateLastWaterTime,
  storeMoistureData,
};
