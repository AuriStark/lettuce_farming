var CronJob = require("cron").CronJob;

function dateToCron(date) {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
}

async function startjobWithID(id, botController) {
  try {
    if (botController.lock) {
      await botController.addJobInQueue(id);

      console.log(`Jobb : "${id}" is in queue`);

      botController.broadcast("jobinqueue", {
        jobId: id,
        message: `The job ${id} is in the queue`,
      });

      return false;
    } else {
      botController.startJob(id);

      console.log(`Job : "${id}" started`);

      return true;
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function startjobWithPayload(payload, botController) {
  try {
    if (botController.lock) {
      await botController.addJobInQueue(payload);

      console.log("Job is in queue");

      botController.broadcast("jobinqueue", {
        jobId: payload.id,
        message: "Job is in queue",
      });

      return false;
    } else {
      botController.startJob(payload);

      console.log("Job is started");

      return true;
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function lunchScheduling(DB, botController) {
  let cronPattern = "* * * * *";

  var cronJob = new CronJob(cronPattern, async () => {
    await sheduleAllJob(DB, botController);
  });
  cronJob.start();
  console.log("------> Cron job exectuted")
}

async function sheduleAllJob(DB, botController) {
  console.log("**********------> sheduleAllJob")

  // Get all activated watering job
  let jobs = await DB.getActivatedWateringJobs();

  // For each job
  jobs.forEach((job) => {

    if (job.wateringDetails.scheduledAt) {
      let scheduledAt = new Date(job.wateringDetails.scheduledAt);

      // If the scheduled date if lower as the actual date
      if (scheduledAt < new Date()) {
        if (!checkIfScheduled(botController, job)) {
          console.log(`The scheduling of the job ${job.name} will be started`);
          startjobWithID(job.id, botController);
        }
      }
    }
  });
}

function checkIfScheduled(botController, job) {
  let queue = botController.jobQueue;

  queue.forEach((jobId) => {
    if (job._id == jobId) {
      return true;
    }
  });

  return false;
}

module.exports = {
  lunchScheduling,
  startjobWithID,
  startjobWithPayload,
};
