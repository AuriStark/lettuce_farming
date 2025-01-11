import axios from "axios";

import store from "../stores/store";

const $axios = axios.create({
  baseURL: `http://${store.state.backendBaseURL}`,
});

const baseUrl = `http://${store.state.backendBaseURL}`;

export function connect() {}

export function getListOfJobs() {
  return $axios.get("/listjobs");
}

function createJobPayload(params) {
  let payload = {
    name: params.jobTitle,
    operation: params.selectedJob,
    fieldBondary: {
      x: parseFloat(params.fieldBondaryX),
      y: parseFloat(params.fieldBondaryY),
      width: parseFloat(params.fieldBondaryWidth),
      height: parseFloat(params.fieldBondaryHeight),
    },
  };

  if (params.selectedJob == "seeding") {
    payload.seedingDetails = {
      cropType: params.seedingCropType,
      depth: parseFloat(params.seedingdepth),
      plantDistance: parseFloat(params.seedingPlantDistance),
    };
  } 
  
  if (params.selectedJob == "watering") {
    payload.wateringDetails = {
      cropType: params.wateringCropType,
      amountMl: parseFloat(params.wateringAmountMl),
      amountMs: parseFloat(params.wateringAmountMs),
      heightAboveGround: parseFloat(params.wateringHeightAboveGround),
      interval: parseInt(params.wateringInterval),
      activated: params.wateringActivated,
      scheduledAt: params.wateringScheduledAt
    };
  }

  return payload;
}

export function addJob(params) {
  let payload = createJobPayload(params);

  return $axios.post("/addjob", payload);
}

export function updateJob(id, params) {
  let payload = createJobPayload(params);

  return $axios.put(`/editjob/${id}`, payload);
}

export function startJob(id) {
  return $axios.post("/startjob", { id });
}

export async function deleteJob(id) {
  try {
    const response = await axios.delete(`${baseUrl}/job/${id}`);
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
}

export function getListOfSeeds() {
  return $axios.get("/listseeds");
}

export function emergencyLock() {
  return $axios.get("/emergencyLock");
}

export function emergencyUnLock() {
  return $axios.get("/emergencyUnLock");
}

export async function startHumidityJob(plantType) {
  return $axios.post("/starthumidityjob", {cropType: plantType})
}

function createSettingPayload(params) {
  let payload = {
    name: params.name,
    allowedField: {
      x: parseFloat(params.allowedFieldX),
      y: parseFloat(params.allowedFieldY),
      width: parseFloat(params.allowedFieldWidth),
      height: parseFloat(params.allowedFieldHeight),
    },

    zSafe: params.zSafe,
  
    zSeedSafe: params.zSeedSafe,

    seederPos: {
      x: parseFloat(params.seederPosX),
      y: parseFloat(params.seederPosY),
      z: parseFloat(params.seederPosZ),
    },

    defaultValues: {
      radish : {
        wateringAmount: params.wateringAmountR,
        wateringDistanceAbeveTheGround: params.wateringDistanceAbeveTheGroundR,
        wateringInterval: params.wateringIntervalR,
      },
      lettuce : {
        wateringAmount: params.wateringAmountL,
        wateringDistanceAbeveTheGround: params.wateringDistanceAbeveTheGroundL,
        wateringInterval: params.wateringIntervalL,
      },
    }
  }

  return payload;
}

export function updateSetting(params) {
  let payload = createSettingPayload(params);

  return $axios.put("/saveSetting", payload);
}


// ---------------------------------[Code]
export function analyzeCode(code) {
  return $axios.post("/analyzeCode", { code });
}

export function runCode(code) {
  return $axios.post("/runCode", { code });
}

export function stopCode() {
  return $axios.get("/stopCode");
}

