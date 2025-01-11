<template>
  <div class="mx-auto tw-relative tw-h-full" max-width="500">
    <div class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-bg-violet-200 tw-px-2 tw-py-3 tw-flex tw-items-center tw-z-10">
      <v-text-field :loading="loading" density="compact" variant="solo" label="Search for jobs"
        append-inner-icon="mdi-magnify" single-line hide-details v-model="searchQuery">

        <template v-slot:prepend>
          <v-menu :close-on-content-click="false" location="end">
            <template v-slot:activator="{ props }">
              <v-badge :content="sorts ? sorts.length : 0" color="error">
                <v-icon icon="mdi-sort" v-bind="props"></v-icon>
              </v-badge>
            </template>

            <v-card min-width="300">
              <v-select v-model="sorts" :items="sortsList" chips label="Sorting" multiple
                hint="Pick the properties to consider for sorting" persistent-hint density="compact"></v-select>
              <v-switch v-model="sortingAsc" class="tw-ml-2" :label="sortingAsc ? 'Ascending' : 'Descending'"
                hide-details></v-switch>
            </v-card>
          </v-menu>
        </template>

        <template v-slot:prepend-inner>
          <v-menu :close-on-content-click="false" location="end">
            <template v-slot:activator="{ props }">
              <v-badge :content="filters ? filters.length : 0" color="error">
                <v-icon icon="mdi-filter" v-bind="props"></v-icon>
              </v-badge>
            </template>

            <v-card min-width="300">
              <v-select v-model="filters" :items="filtersList" chips label="Filters" multiple
                hint="Pick attributes for filtering" persistent-hint density="compact"></v-select>
            </v-card>
          </v-menu>
        </template>

      </v-text-field>

      <v-btn variant="elevated" icon density="compact" class="tw-ml-2" @click="displayJobForm">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <div class="tw-grid tw-gap-4 tw-p-2">
      <JobCard v-for="(job, index) in jobs" :key="index" @openJobDialog="openJobDialog" @editJobDialog="editJobDialog"
        :jobDatas="job"></JobCard>
    </div>

    <JobDetailDialog v-if="jobDialogOpened" @close="closeJobDialog" :jobDatas="selectedJobData"></JobDetailDialog>
    <EditJobDialog v-if="isEditingJob" :jobDatas="selectedJobData" @close="closeEditDialog"></EditJobDialog>

  </div>
</template>

<script>
import JobCard from "@/components/Cards/JobCard.vue";
import JobDetailDialog from "@/components/Dialogs/JobDetailDialog.vue";
import EditJobDialog from "@/components/Dialogs/VEditJobDialog.vue";

import { getListOfJobs } from "@/js/api";

export default {
  name: "ListAllJobs",

  components: {
    JobCard,
    JobDetailDialog,
    EditJobDialog,
  },

  data: () => ({
    jobDialogOpened: false,
    loading: false,
    selectedJobData: undefined,
    isEditingJob: false,
    searchQuery: '',

    filters: null,

    sorts: null,
    sortsList: ['Creation date', 'Executed date', 'Name'],
    sortingAsc: true
  }),

  computed: {
    jobs() {
      let jobs = this.$store.state.farmJobs

      if (this.filters) {
        this.filters.forEach(filter => {
          switch (filter) {
            case "Activated":
              jobs = jobs.filter((job) => job.operation == 'watering' && (job.wateringDetails.activated ?? false))
              break

            case "Disabled":
              jobs = jobs.filter((job) => job.operation == 'watering' && !(job.wateringDetails.activated ?? false))
              break

            case "Executed":
              jobs = jobs.filter((job) => job.executed)
              break

            case "Only Seeding":
              jobs = jobs.filter((job) => job.operation == 'seeding')
              break

            case "Only Watering":
              jobs = jobs.filter((job) => job.operation == 'watering')
              break
          }
        })
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();

        jobs = jobs.filter((job) =>
          (job._id.toLowerCase().includes(query)) ||
          (job.seedingDetails.cropType.toLowerCase().includes(query)) ||
          (job.name.toLowerCase().includes(query)) ||
          (job.operation.toLowerCase().includes(query))
        )
      }

      if (this.sorts) {
        this.sorts.forEach(sort => {
          switch (sort) {
            case "Creation date":
              jobs = jobs.sort((job1, job2) => {
                if (!job1.createdAt) return 1

                if (!job2.createdAt) return -1

                if (this.sortingAsc) {
                  return new Date(job1.createdAt) - new Date(job2.createdAt);
                } else {
                  return new Date(job2.createdAt) - new Date(job1.createdAt);
                }
              })
              break

            case "Executed date":
              jobs = jobs.sort((job1, job2) => {
                if (!job1.executedAt) return 1

                if (!job2.executedAt) return -1

                if (this.sortingAsc) {
                  return new Date(job1.executedAt) - new Date(job2.executedAt);
                } else {
                  return new Date(job2.executedAt) - new Date(job1.executedAt);
                }
              })
              break

            case "Name":
              jobs = jobs.sort((job1, job2) => {
                const nameA = job1.name.toUpperCase(); // ignore upper and lowercase
                const nameB = job2.name.toUpperCase(); // ignore upper and lowercase

                if (nameA < nameB) {
                  return this.sortingAsc ? -1 : 1;
                }
                if (nameA > nameB) {
                  return this.sortingAsc ? 1 : -1;
                }

                // names must be equal
                return 0;
              })
              break
          }
        })
      }

      return jobs;
    },

    filtersList() {
      let list = ['Activated', 'Disabled', 'Executed', 'Only Seeding', 'Only Watering']

      if (this.filters) {
        if (this.filters.indexOf("Activated") > -1) {
          list = ['Activated']
        }

        if (this.filters.indexOf("Disabled") > -1) {
          list = ['Disabled']
        }

        if (this.filters.indexOf("Executed") > -1) {
          list = ['Executed']
        }

        if (this.filters.indexOf("Only Seeding") > -1) {
          list = ['Executed', 'Only Seeding']
        }

        if (this.filters.indexOf("Only Watering") > -1) {
          list = ['Activated', 'Disabled', 'Only Watering']
        }
      }

      return list
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
    editJobDialog(jobDatas) {
      this.selectedJobData = jobDatas;
      this.isEditingJob = true;
    },
    closeEditDialog() {
      this.isEditingJob = false;
    },
    displayJobForm() {
      this.closeJobDialog();

      this.$store.dispatch("setCreateNewJobVisible", true);

      this.searchQuery = "";
    },
  },

  mounted() {
    this.loading = true;
    getListOfJobs()
      .then((response) => {
        this.$store.commit("setFarmJobs", response.data);
        this.loading = false;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>
