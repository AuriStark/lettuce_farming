<template>
  <div class="mx-auto tw-relative tw-h-full" max-width="500">
    <div class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-bg-violet-200 tw-px-2 tw-py-3 tw-flex tw-items-center tw-z-10">
      <v-text-field density="compact" variant="solo" label="Filter jobs" append-inner-icon="mdi-magnify" single-line
        hide-details v-model="searchQuery"></v-text-field>
    </div>

    <div class="tw-grid tw-gap-4 tw-p-2">
      <JobCard v-for="(job, index) in farmJobQueue" :key="index" @openJobDialog="openJobDialog" :mode="'queueMode'"
        :jobDatas="job"></JobCard>
    </div>

    <JobDetailDialog v-if="jobDialogOpened" @close="closeJobDialog" :jobDatas="selectedJobData"></JobDetailDialog>
  </div>
</template>

<script>
import JobCard from "@/components/Cards/JobCard.vue";
import JobDetailDialog from '@/components/Dialogs/JobDetailDialog.vue';

export default {
  name: "VDisplayJobQueue",

  components: {
    JobCard,
    JobDetailDialog
  },

  data() {
    return {
      jobDialogOpened: false,
      selectedJobData: undefined,
    searchQuery: '',
    };
  },
  computed: {
    currentFarmJobID() {
      return this.$store.state.currentFarmJobID;
    },
    farmJobQueue() {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return this.$store.state.farmJobQueue.filter((job) =>
          (job._id.toLowerCase().includes(query) || job.seedingDetails.cropType.toLowerCase().includes(query))
        )
      } else {
        return this.$store.state.farmJobQueue;
      }
    }
  },
  methods: {
    closeJobDialog() {
      this.jobDialogOpened = false;
    },
    openJobDialog(jobDatas) {
      this.selectedJobData = jobDatas;
      this.jobDialogOpened = true;
    },
  },
};
</script>
