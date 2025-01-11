import { createStore } from "vuex";

const store = createStore({
  state: {
    coordinates: { x: 0, y: 0, z: 0 },
    createArea: { x: 0, y: 0, width: 0, height: 0 },
    hoverArea: null,
    backendBaseURL: "localhost:8000",
    connected: false,
    botPosition: { x: 0, y: 0, z: 0 },
    logs: [],
    jobs: [],
    lastJob: null,
    robotIsBusy: null,

    userDatas: null,

    farmJobs: [],
    seedsList: [],
    currentFarmJobID: null,
    farmJobQueue: [],

    createNewJobVisible: false,
    listallJobsVisible: false,
    listAllJobsInQueueVisible: false,
    settingVisible: false,
    humidityOperationVisible: false,
    plantsListVisible: false,
    editorVisible: false,

    locked: false,

    temporalSeeds: [],

    selectedCropType: null,

    currentTooltip: null,
  },

  mutations: {
    setCreateNewJobVisible(state, value) {
      state.createNewJobVisible = value;
    },
    setListallJobsVisible(state, value) {
      state.listallJobsVisible = value;
    },
    setListAllJobsInQueueVisible(state, value) {
      state.listAllJobsInQueueVisible = value;
    },
    setSettingVisible(state, value) {
      state.settingVisible = value;
    },
    humidityOperationVisible(state, value) {
      state.humidityOperationVisible = value;
    },
    setPlantsListVisible(state, value) {
      state.plantsListVisible = value;
    },
    setEditorVisible(state, value) {
      state.editorVisible = value;
    },

    setCoordinates(state, coordinates) {
      state.coordinates = coordinates;
    },

    setCreateArea(state, area) {
      state.createArea = area;
    },

    setConnectionState(state, val) {
      state.connected = val;
    },

    setBotPosition(state, val) {
      if (val) {
        state.botPosition = val;
      }
    },

    setLogs(state, logs) {
      state.logs = logs;
    },

    setJobs(state, jobs) {
      state.jobs = jobs;
    },

    setUserDatas(state, datas) {
      state.userDatas = datas;
    },

    setWorkingState(state, value) {
      state.robotIsBusy = value;
    },

    setLastJob(state, job) {
      state.lastJob = job;
    },

    setFarmJobs(state, jobs) {
      state.farmJobs = jobs;
    },

    setSeedsList(state, list) {
      state.seedsList = list;
    },

    setCurrentFarmJobID(state, id) {
      state.currentFarmJobID = id;
    },

    setFarmJobQueue(state, val) {
      state.farmJobQueue = val;
    },

    setLocked(state, val) {
      state.locked = val;
    },

    setTemporalSeeds(state, val) {
      state.temporalSeeds = val;
    },

    setSelectedCropType(state, val) {
      state.selectedCropType = val;
    },

    setCurrentTooltip(state, val) {
      state.currentTooltip = val;
    },

    setHoverArea(state, val) {
      state.hoverArea = val;
    },
    setHumidityVisible(state, val) {
      state.humidityOperationVisible = val;
    },
  },

  actions: {
    addLog({ commit, state }, log) {
      let logs = [...state.logs];

      logs.push(log);

      commit("setLogs", logs);
    },

    addJob({ commit, state }, job) {
      let jobs = { ...state.jobs };

      jobs[job.id] = job;

      commit("setJobs", jobs);
      commit("setLastJob", job);
    },

    setCreateNewJobVisible({ commit, state }, value) {
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", true);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", false);
      commit("humidityOperationVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", false);
    },

    setListallJobsVisible({ commit, state }, value) {
      commit("setListallJobsVisible", true);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", false);
      commit("humidityOperationVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", false);

      commit("setTemporalSeeds", []);
      commit("setSelectedCropType", null);
    },

    setListAllJobsInQueueVisible({ commit, state }, value) {
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", true);
      commit("setSettingVisible", false);
      commit("humidityOperationVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", false);
    },

    setSettingVisible({ commit, state }, value) {
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", true);
      commit("humidityOperationVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", false);
    },

    setHumidityOperationVisible({ commit, state }, value) {
      commit("setHumidityVisible", true);
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", false);
    },

    setPlantsListVisible({ commit, state }, value) {
      commit("setHumidityVisible", false);
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", false);
      commit("setPlantsListVisible", true);
      commit("setEditorVisible", false);
    },

    setEditorVisible({ commit, state }, value) {
      commit("setHumidityVisible", false);
      commit("setListallJobsVisible", false);
      commit("setCreateNewJobVisible", false);
      commit("setListAllJobsInQueueVisible", false);
      commit("setSettingVisible", false);
      commit("setPlantsListVisible", false);
      commit("setEditorVisible", true);
    },
  },
});

export default store;
