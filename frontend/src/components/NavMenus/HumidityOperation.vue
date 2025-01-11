<template>
  <div class="mx-auto tw-relative tw-h-full" max-width="500">
    <v-form ref="humidityOperationForm">
      <div
        class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-bg-violet-200 tw-px-2 tw-pt-3 tw-flex tw-items-center tw-z-10">
        <v-select v-model="selectedOperation" :items="cropTypes" :rules="[(v) => !!v || 'Item is required']" label="Plant Type"
          required density="compact" variant="solo"></v-select>
      </div>

      <div class="tw-px-3 tw-pt-3 tw-pb-12">
          <div class="tw-mb-2">Humidity </div>
          <v-btn :disabled="humidityActivated" color="green-accent-1" @click="startHumidity">start</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { startHumidityJob } from "@/js/api";
export default {
  name: "HumidityOperation",
  props: {
    isEditing: Boolean,
    default: false,
    jobDatas: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    cropTypes: ["lettuce", "radish"],
    selectedOperation: "lettuce",
    humidityActivated: false,
  }),
  methods: {
    async startHumidity() {
      console.log("HUMIDITY started")
      this.humidityActivated = true

      startHumidityJob(this.selectedOperation).then((res => {
      this.humidityActivated = false
        this.$toast.success("Humidy Job has been launched");
      })).catch((error)=> {
        this.$toast.error(error);
      });
    }
  },
};
</script>

<style scoped lang="scss"></style>
