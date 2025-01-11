import store from "../stores/store";
import { io } from "socket.io-client";
import {useToast} from 'vue-toast-notification';

// "undefined" means the URL will be computed from the `window.location` object
const URL = `ws://${store.state.backendBaseURL}`;
const $toast = useToast();

export const socket = io(URL);

socket.on("connect", () => {
  console.log("------> connected");
  $toast.success("Connected to bot");
  store.commit("setConnectionState", true);
});

socket.on("disconnect", () => {
  console.log("------> disconnected");
  $toast.error("Disconnected to bot");
  store.commit("setConnectionState", false);
});

socket.on("position", (val) => {
  store.commit("setBotPosition", val);
});

socket.on("log", (log) => {
  store.dispatch("addLog", log);
});

socket.on("userDatas", (datas) => {
  store.commit("setUserDatas", datas);
});

socket.on("job", (job) => {
  store.dispatch("addJob", job);
});

socket.on("resetStepJob", (job) => {
  store.commit("setJobs", []);
});

socket.on("workingState", (state) => {
  store.commit("setWorkingState", state);
});

socket.on("farmJobs", (jobs) => {
  store.commit("setFarmJobs", jobs);
});

socket.on("seeds", (seeds) => {
  store.commit("setSeedsList", seeds);
});

socket.on("listjobsqueue", (jobs) => {
  store.commit("setFarmJobQueue", jobs);
});

socket.on("currentjob", (id) => {
  store.commit("setCurrentFarmJobID", id);
});

socket.on("jobdone", (params) => {
  $toast.success(params.message);
});

socket.on("jobstarted", (params) => {
  $toast.success(params.message);
});

socket.on("jobinqueue", (params) => {
  $toast.warning(params.message);
});

socket.on("emergencyLock", (params) => {
  $toast.error(params.message);
  store.commit("setLocked", true);
});

socket.on("emergencyUnLock", (params) => {
  $toast.success(params.message);
  store.commit("setLocked", false);
});

socket.on("lock", (val) => {
  store.commit("setLocked", val);
});

socket.on("currentTooltip", (val) => {
  store.commit("setCurrentTooltip", val);
});
