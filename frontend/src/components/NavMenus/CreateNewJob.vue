<template>
  <div class="mx-auto tw-relative tw-h-full" max-width="500">
    <v-form ref="createJobForm">
      <div
        class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-bg-violet-200 tw-px-2 tw-pt-3 tw-flex tw-items-center tw-z-10">
        <v-select v-model="selectedJob" :items="Jobs" :rules="[(v) => !!v || 'Item is required']" label="Job to perform"
          required density="compact" variant="solo"></v-select>
      </div>

      <div class="tw-px-3 tw-pt-3 tw-pb-12">
        <v-text-field v-model="jobTitle" :counter="100" :rules="nameRules" label="Job Title" required density="compact"
          variant="outlined"></v-text-field>

        <div v-if="selectedJob == 'seeding'">
          <v-select v-model="seedingCropType" :items="cropTypes" :rules="[(v) => !!v || 'Item is required']"
            label="Crop Type" required density="compact" variant="outlined"></v-select>

          <div class="tw-mb-2">Seeding details:</div>

          <v-text-field v-model="seedingdepth" :rules="requiredRules" label="Seeding depht" required density="compact"
            variant="outlined" suffix="mm" type="number">
          </v-text-field>
          <v-text-field v-model="seedingPlantDistance" :rules="requiredRules" label="Distance between plants" required
            density="compact" variant="outlined" suffix="mm" type="number" min="100">
          </v-text-field>

          <div class="tw-mb-2">Field Boundary:</div>

          <v-row>
            <v-col cols="6">
              <v-text-field v-model="fieldBondaryX" :rules="fieldBondaryXRules" label="X" required density="compact"
                variant="outlined" suffix="mm" type="number">
              </v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field v-model="fieldBondaryY" :rules="fieldBondaryYRules" label="Y" required density="compact"
                variant="outlined" suffix="mm" type="number">
              </v-text-field>
            </v-col>
          </v-row>

          <v-text-field v-model="fieldBondaryWidth" :rules="fieldBondaryWidthRules" label="Width" required
            density="compact" variant="outlined" suffix="mm" type="number">
          </v-text-field>
          <v-text-field v-model="fieldBondaryHeight" :rules="fieldBondaryHeightRules" label="Height" required
            density="compact" variant="outlined" suffix="mm" type="number">
          </v-text-field>
        </div>

        <div v-if="selectedJob == 'watering'">
          <v-select v-model="wateringCropType" :items="cropTypes" :rules="[(v) => !!v || 'Item is required']"
            label="Crop Type" required density="compact" variant="outlined"></v-select>
          <div class="tw-mb-2">Watering details:</div>
          <v-text-field v-model="wateringAmountMl" @input="setWateringAmountMs" :rules="requiredRules"
            label="Watering Amount per plants" required density="compact" variant="outlined" suffix="ml" type="number">
          </v-text-field>
          <v-text-field v-model="wateringAmountMs" :disabled="true" :rules="requiredRules"
            label="Watering Duration per plants in ms" required density="compact" variant="outlined" suffix="ms"
            type="number">
          </v-text-field>
          <v-text-field v-model="wateringHeightAboveGround" :rules="requiredRules" label="Distance above the ground"
            required density="compact" variant="outlined" suffix="mm" type="number">
          </v-text-field>

          <v-text-field v-model="wateringScheduledAt" :rules="requiredRules" label="Schedule watering" required
            density="compact" variant="outlined" input type="datetime-local" id="date">
          </v-text-field>

          <v-text-field v-model="wateringInterval" :rules="requiredRules" label="Watering Interval" required
            density="compact" variant="outlined" suffix="Hour" type="number">
          </v-text-field>

          <v-switch v-model="wateringActivated" :label="`Actived: ${wateringActivated.toString()}`"
            :color="wateringActivated ? 'green' : 'red'"></v-switch>
        </div>
      </div>

      <div
        class="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-violet-50 tw-px-2 tw-py-3 tw-flex tw-items-center tw-z-10 tw-justify-end">
        <v-btn v-if="!isEditing" :disabled="!valid" color="green-accent-1" class="mr-4" @click="saveNewJob">
          Create
        </v-btn>
        <v-btn v-if="isEditing" :disabled="!valid" color="green-accent-1" class="mr-4" @click="updateJob">
          Update
        </v-btn>
        <v-btn v-if="!isEditing" color="red-accent-1" @click="resetForm">
          Reset
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<!-- Script -->
<script>
import { addJob, updateJob } from "@/js/api";
import { computesSeedPositions } from "@/js/computing";

export default {
  name: "CreateJob",
  props: {
    isEditing: Boolean,
    default: false,
    jobDatas: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    valid: true,
    nameRules: [(v) => !!v || "jobTitle is required"],
    requiredRules: [(v) => (v != undefined && v != null) || "this field is required"],
    dateFormater: new Intl.DateTimeFormat('en-US', {
      timeStyle: "short",
      dateStyle: "short",
    }),

    cropTypes: ["lettuce", "radish"],
    Jobs: ["seeding", "watering"],

    jobTitle: null,
    selectedJob: "seeding",

    seedingCropType: null,
    seedingdepth: null,
    seedingPlantDistance: null,

    wateringCropType: null,
    wateringAmountMl: null,
    wateringAmountMs: null,
    wateringHeightAboveGround: null,
    wateringInterval: null,
    wateringActivated: true,
    wateringScheduledAt: null,
    showPicker: false,

    sensingDepth: null,

    createdAt: null,
    executedAt: null,

    timer: undefined,

    lastCreateArea: null,
  }),

  computed: {
    userDatas: {
      get() {
        return this.$store.state.userDatas;
      },
    },
    fieldBondaryXRules: {
      get() {
        return [
          (v) =>
            (v <=
              this.userDatas.allowedField.x +
              this.userDatas.allowedField.width &&
              v >= this.userDatas.allowedField.x) ||
            "enter a valid value for fieldBondary x"
        ];
      },
    },

    fieldBondaryYRules: {
      get() {
        return [
          (v) =>
            (v <=
              this.userDatas.allowedField.y +
              this.userDatas.allowedField.height &&
              v >= this.userDatas.allowedField.y) ||
            "enter a valid value for fieldBondary y"
        ];
      },
    },

    fieldBondaryWidthRules: {
      get() {
        return [
          (v) =>
            (
              v <= this.userDatas.allowedField.width &&
              (this.fieldBondaryX + v) <= (this.userDatas.allowedField.x + this.userDatas.allowedField.width)) ||
            "enter a valid value for fieldBondary width"
        ];
      },
    },
    fieldBondaryHeightRules: {
      get() {
        return [
          (v) =>
            (
              v <= this.userDatas.allowedField.height &&
              (this.fieldBondaryY + v) <= (this.userDatas.allowedField.y + this.userDatas.allowedField.height)) ||
            "enter a valid value for fieldBondary height"
        ];
      },
    },
    coordinates() {
      return this.$store.state.coordinates;
    },

    createArea() {
      return this.$store.state.createArea;
    },

    fieldBondaryX: {
      get() {
        return this.createArea?.x;
      },
      set(val) {
        if (val != this.createArea.x) {
          this.updateCreateArea({ x: val });
        }
      },
    },

    fieldBondaryY: {
      get() {
        return this.createArea?.y;
      },
      set(val) {
        if (val != this.createArea.y) {
          this.updateCreateArea({ y: val });
        }
      },
    },

    fieldBondaryWidth: {
      get() {
        return this.createArea?.width;
      },
      set(val) {
        if (val != this.createArea.width) {
          this.updateCreateArea({ width: val });
        }
      },
    },

    fieldBondaryHeight: {
      get() {
        return this.createArea?.height;
      },
      set(val) {
        if (val != this.createArea.height) {
          this.updateCreateArea({ height: val });
        }
      },
    },
  },

  watch: {
    userDatas(val) {
      this.chargeDatas();
    },

    seedingCropType() {
      this.chargeDatas();
      this.computesSeeds(0);
    },

    wateringCropType(val) {
      if (!this.isEditing) {
        this.$store.commit("setSelectedCropType", val);
      }
      this.chargeDatas();
    },

    selectedJob() {
      this.chargeDatas();
    },

    seedingPlantDistance() {
      this.computesSeeds();
    },

    createArea() {
      this.computesSeeds();
    },

    selectedJob(val) {
      switch (val) {
        case "seeding":
          if (!this.lastCreateArea) return;
          let createArea = { ...this.lastCreateArea };

          if (!this.isEditing) {
            this.$store.commit("setCreateArea", createArea);
          }

          this.lastCreateArea = null;
          break;
        case "watering":
          this.lastCreateArea = { ...this.createArea };
          this.$store.commit("setCreateArea", null);

          this.$store.commit("setTemporalSeeds", []);
          break;
      }
    },
  },

  methods: {
    computesSeeds(time = 1000) {
      if (this.isEditing) return;

      clearTimeout(this.timer);

      this.timer = setTimeout(async () => {
        if (
          this.selectedJob == "seeding" &&
          this.seedingPlantDistance &&
          this.seedingCropType
        ) {
          let tmpPlants = await computesSeedPositions(
            this.seedingCropType,
            this.createArea,
            this.seedingPlantDistance
          );

          this.$store.commit("setTemporalSeeds", tmpPlants);
        } else {
          this.$store.commit("setTemporalSeeds", []);
        }
      }, time);
    },

    createPayload() {
      return {
        selectedJob: this.selectedJob,
        jobTitle: this.jobTitle,

        fieldBondaryX: this.fieldBondaryX,
        fieldBondaryY: this.fieldBondaryY,
        fieldBondaryWidth: this.fieldBondaryWidth,
        fieldBondaryHeight: this.fieldBondaryHeight,

        seedingCropType: this.seedingCropType,
        seedingdepth: this.seedingdepth * -1,
        seedingPlantDistance: this.seedingPlantDistance,

        wateringCropType: this.wateringCropType,
        wateringAmountMl: this.wateringAmountMl,
        wateringAmountMs: this.wateringAmountMs,
        wateringHeightAboveGround: this.wateringHeightAboveGround * -1,
        wateringInterval: this.wateringInterval,
        wateringActivated: this.wateringActivated,
        wateringScheduledAt: this.wateringScheduledAt,

        createdAt: this.createdAt,
        executedAt: this.executedAt
      }
    },

    setWateringAmountMs() {
      if (this.selectedJob == "watering" && this.wateringAmountMl != null) {
        this.wateringAmountMs = this.wateringAmountMl / 0.049;
      }
    },

    async saveNewJob() {
      const { valid } = await this.$refs.createJobForm.validate();

      if (valid) {
        this.createdAt = new Date();
        let params = this.createPayload();

        addJob(params)
          .then((response) => {
            console.log(response);
            this.$toast.success("success");
            this.$store.dispatch("setListallJobsVisible");
          })
          .catch((error) => {
            console.log(error);
            this.$toast.error(error);
          });
      }
    },

    async updateJob() {
      const { valid } = await this.$refs.createJobForm.validate();

      if (valid) {
        let params = this.createPayload();

        updateJob(this.jobDatas._id, params)
          .then((response) => {
            console.log(response);
            this.$toast.success("Update was successfull");

            if (this.isEditing) {
              this.$store.commit("setCreateNewJobVisible", false);

              this.$emit("closeDialog");
            }
          })
          .catch((error) => {
            console.log(error);
            this.$toast.error(error);
          });
      }
    },

    updateCreateArea(area = {}) {
      const { x, y, width, height } = area;

      let newArea = { ...this.createArea };

      if (x) newArea.x = parseInt(x);
      if (y) newArea.y = parseInt(y);
      if (width) newArea.width = parseInt(width);
      if (height) newArea.height = parseInt(height);

      this.$store.commit("setCreateArea", newArea);
    },

    resetForm() {
      this.$refs.createJobForm.reset();
    },

    padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    },

    formatDate(date) {
      return (
        [
          date.getFullYear(),
          this.padTo2Digits(date.getUTCMonth() + 1),
          this.padTo2Digits(date.getUTCDate()),
        ].join('-') +
        'T' +
        [
          this.padTo2Digits(date.getUTCHours() + 2),
          this.padTo2Digits(date.getUTCMinutes()),
        ].join(':')
      );
    },

    fillInput() {
      let formatedScheduledDate = this.formatDate(new Date(this.jobDatas.wateringDetails?.scheduledAt));

      if (this.jobDatas) {
        this.jobTitle = this.jobDatas.name;
        this.selectedJob = this.jobDatas.operation;
        this.fieldBondaryX = this.jobDatas.fieldBondary?.x;
        this.fieldBondaryY = this.jobDatas.fieldBondary?.y;
        this.fieldBondaryWidth = this.jobDatas.fieldBondary?.width;
        this.fieldBondaryHeight = this.jobDatas.fieldBondary?.height;

        this.seedingCropType = this.jobDatas.seedingDetails?.cropType;
        this.seedingdepth = (this.jobDatas.seedingDetails?.depth) * -1;
        this.seedingPlantDistance = this.jobDatas.seedingDetails?.plantDistance;

        this.wateringCropType = this.jobDatas.wateringDetails?.cropType;
        this.wateringAmountMl = this.jobDatas.wateringDetails?.amountMl;
        this.wateringAmountMs = this.jobDatas.wateringDetails?.amountMs;
        this.wateringHeightAboveGround =
          (this.jobDatas.wateringDetails?.heightAboveGround) * -1;
        this.wateringInterval = this.jobDatas.wateringDetails?.interval;
        this.wateringScheduledAt = formatedScheduledDate;
        this.wateringActivated = this.jobDatas.wateringDetails?.activated ?? false;

        this.sensingDepth = this.jobDatas.sensingDetail?.depth;
      }
    },

    chargeDatas() {
      if (!this.userDatas) return;

      switch (this.selectedJob) {
        case "seeding":
          break;
        case "watering":
          this.chargeWateringDatas();
          break;
      }
    },

    chargeWateringDatas() {
      if (!this.wateringCropType) return;

      let vals = this.userDatas.defaultValues[this.wateringCropType];

      this.wateringAmountMl = vals.wateringAmount;
      this.wateringHeightAboveGround = vals.wateringDistanceAbeveTheGround;
      this.wateringInterval = vals.wateringInterval;

      this.setWateringAmountMs();
    },
  },

  mounted() {
    let defaultArea = {
      x: this.coordinates?.x ?? 0,
      y: this.coordinates?.y ?? 0,
      width: 200,
      height: 200,
    };

    this.$store.commit("setCreateArea", defaultArea);

    this.chargeDatas();

    if (this.isEditing) {
      this.fillInput();
    }
  },

  showDatePicker() {
    this.showPicker = true;
  },
  hideDatePicker() {
    this.showPicker = false;
  }

};
</script>

<!-- Style -->
<style scoped lang="scss"></style>
<style>
.date-picker {
  position: absolute;
  z-index: 9999;
}
</style>