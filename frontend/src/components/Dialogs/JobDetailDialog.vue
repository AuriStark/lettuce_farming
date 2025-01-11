<template>
  <v-row justify="center">
    <v-dialog v-model="m_opened" scrollable width="500" height="800">
      <v-card class="rounded-lg">
        <v-card-title class="tw-bg-violet-400 text-white !tw-flex tw-items-center">
          <div class="tw-flex-1">Job Details</div>

          <v-btn color="white" variant="plain" icon density="compact" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="border-opacity-75"></v-divider>

        <v-card-text style="height: 300px;">
          <div class="job-details-body">
           
            <!-- JOB DETAILS -->
        
            <v-row class="job-details-row">
              <span> Job Title </span>
              <span> {{ jobName }}</span>
            </v-row>
            
            <v-row class="job-details-row">
              <span>Status</span>
              <v-chip :color="jobDatas.executed ? 'green' : 'gray'" text-color="white"
                :prepend-icon="jobDatas.executed ? 'mdi-checkbox-marked-circle' : 'mdi-calendar-clock'" size="small">
                {{ executed ? 'Executed' : 'Planned' }}
              </v-chip>
            </v-row>

            <v-row class="job-details-row" >
              <span> Operation </span>
              <span> {{ filedOperation }} </span>
            </v-row>

            <div v-if="filedOperation == 'seeding'">
              <div class="divider">
                <span></span>
                <span>Seeding details</span>
                <span></span>
              </div>

              <v-row class="job-details-row">
                <span> Crop type</span>
                <span> {{ seedingCropType }} </span>
              </v-row>

              <v-row class="job-details-row">
                <span>Seeding depth </span>
                <span> {{ seedingDepth * -1 }} mm </span>
              </v-row>
              
              <v-row class="job-details-row">
                <span> Distance between plants</span>
                <span> {{ distanceBetweenPlants }} mm </span>
              </v-row>

            </div>

            <div v-if="filedOperation == 'watering'">

              <div class="divider">
                <span></span>
                <span>Watering details</span>
                <span></span>
              </div>

              <v-row class="job-details-row">
                <span> Crop type</span>
                <span> {{ wateringCropType }} </span>
              </v-row>

              <v-row class="job-details-row" >
                <span> Distance above the ground </span>
                <span>  {{ distanceAboveTheGround * -1 }} mm </span>
              </v-row>

              <v-row class="job-details-row" >
                <span> Watering Amount in ml </span>
                <span> {{ wateringAmountMl }} ml </span>
              </v-row>

              <v-row class="job-details-row">
                <span> Watering Amount in ms</span>
                <span> {{ wateringAmountMs}} ms </span>
              </v-row>

            </div>
            
            <div v-if="filedOperation == 'sensing'">  <!-- it is sensing or sensoring ? -->

              <div class="divider">
                <span></span>
                <span> Sensing details</span>
                <span></span>
              </div>

              <v-row class="job-details-row" >
                <span> Sensing depth </span>
                <span> {{ sensingDepth }} </span>
              </v-row>
            
            </div>
            
            <div v-if="filedOperation == 'seeding' || filedOperation == 'sensing'">
              <div class="divider">
                <span></span>
                <span>Field Boundaries</span>
                <span></span>
              </div>
            
              <v-row class="job-details-row" >
                  <span> Origin </span>
                  <span> ( X: {{ fieldBondaryStart}} ,  Y: {{  fieldBondaryEnd }})</span>
              </v-row>

              <v-row class="job-details-row" >
                  <span> Width </span>
                  <span> {{ fieldBondaryWidth }} </span>
              </v-row>

              <v-row class="job-details-row" >
                  <span> Height </span>
                  <span> {{fieldBondaryHeight}} </span>
              </v-row>
            </div>

            <div class="divider">
              <span></span>
              <span> Job infos</span>
              <span></span>
            </div>

            <!-- Todo extract the exact date needed ( calender day plus time) -->

            <v-row class="job-details-row" >
              <span> Created at</span>
              <span>  {{ createdAt }} </span>
            </v-row>

            <v-row v-if="filedOperation == 'watering'" class="job-details-row" >
              <span> Scheduled At</span>
              <span>   {{ wateringScheduledAt }}</span>
            </v-row>
  
            <v-row class="job-details-row">
              <span> Executed At</span>
              <span> {{ executedAt }} </span>
            </v-row>
          </div>

        </v-card-text>

        <v-divider class="border-opacity-75"></v-divider>

        <v-card-actions class="tw-flex tw-justify-items-end">
          <v-btn variant="text" @click="close">
            Close
          </v-btn>
          <v-btn color="green" variant="tonal" @click="executeJob">
            Execute
          </v-btn>
          <v-btn color="red" variant="tonal" @click="jobDeletion">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { startJob, deleteJob } from '@/js/api'

export default {
  name: "JobDetailDialog",

  props: {
    opened: Boolean,
    jobDatas: Object
  },

  data() {
    return {
      progress: 30,

      labels: { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WED', 4: 'TH', 5: 'FR', 6: 'SA' },
      expand: false,
      time: 0,
      m_opened: true,
      dateFormater: new Intl.DateTimeFormat('en-US', {
            timeStyle: "short",
            dateStyle: "short",
      }),
    }
  },

  watch:{
    opened(value){
      this.m_opened = value
    }
  },

  computed: {
    // The real data values of the Json should stilll be matched in the Return pattern

    jobName() { return (this.jobDatas?.name ?? '---') },
    executed() { return (this.jobDatas?.executed ?? false) },
    filedOperation() { return (this.jobDatas?.operation ?? '---') },
    createdAt() { return (this.dateFormater.format( new Date(this.jobDatas?.createdAt)) ?? '---')},
    executedAt() { return (this.jobDatas?.executedAt ? this.dateFormater.format( new Date(this.jobDatas?.executedAt)) : '---') },
    seedingCropType() { return (this.jobDatas?.seedingDetails.cropType ?? '---') },
    wateringCropType() {return (this.jobDatas?.wateringDetails.cropType ?? '---') },
    wateringScheduledAt() {return (this.jobDatas?.wateringDetails.scheduledAt ? this.dateFormater.format( new Date(this.jobDatas?.wateringDetails.scheduledAt)) : '---')},
    distanceBetweenPlants() { return (this.jobDatas?.seedingDetails.plantDistance)},
    seedingDepth() { return (this.jobDatas?.seedingDetails.depth)},
    distanceAboveTheGround() { return (this.jobDatas?.wateringDetails.heightAboveGround ?? '---')},
    wateringAmountMl() { return (this.jobDatas?.wateringDetails.amountMl ?? '---')},
    wateringAmountMs() { return (this.jobDatas?.wateringDetails.amountMs ?? '---')},
    fieldBondaryStart() { return (this.jobDatas?.fieldBondary.x ?? '---')}, // .x
    fieldBondaryEnd() { return (this.jobDatas?.fieldBondary.y ?? '---')}, //.y
    fieldBondaryWidth() { return (this.jobDatas?.fieldBondary.width ?? '---')}, //.width
    fieldBondaryHeight() { return (this.jobDatas?.fieldBondary.height ?? '---')}, //.height
    sensingDepth() { return( this.jobDatas?.sensingDetail.depth ?? '---')},

    actions() {
      return [
        { title: 'Execute', action: () => { alert("yo") } },
        { title: 'Delete', action: () => { } },
        { title: 'Full Details', action: this.openDetails }
      ]
    },
    

  },
  
  methods: {

    deleteJob(){
      this.$emit('deleteJob', id);
    },
    executeJob() {
      startJob(this.jobDatas._id)
        .then((response) => {
            console.log("Job started with id: ",  this.jobDatas._id)
        }).catch((error) => {
            console.log("something is broke unfortunately :)")
            console.log(error);
        });
      },
      
    jobDeletion() {
      deleteJob(this.jobDatas._id)

      .then((response) => {
          console.log("delete job with id: ",  this.jobDatas._id)
      }).catch((error) => {
          console.log(error);
      });
      this.close();
    },

    close() {
      this.$emit('close')
    },
  }
}
</script>

<style lang="scss" scoped>
.job-details-body{
  align-items: center;
  .job-details-row {
    margin: 5px 20px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
  }

  .divider {								/* minor cosmetics */
    display: table; 
    font-size: 24px; 
    text-align: center; 
    width: 75%; 						/* divider width */
    margin: 40px auto;					/* spacing above/below */
  }
  .divider span { 
    display: table-cell; 
    position: relative; 
  }
  .divider span:first-child, .divider span:last-child {
    width: 50%;
    top: 13px;							/* adjust vertical align */
    -moz-background-size: 100% 2px; 	/* line width */
    background-size: 100% 2px; 			/* line width */
    background-position: 0 0, 0 100%;
    background-repeat: no-repeat;
  }

  .divider span:first-child {				/* color changes in here */
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(transparent), to(#6200EE));
    background-image: -webkit-linear-gradient(180deg, transparent, #6200EE);
    background-image: -moz-linear-gradient(180deg, transparent, #6200EE);
    background-image: -o-linear-gradient(180deg, transparent, #6200EE);
    background-image: linear-gradient(90deg, transparent, #6200EE);
  }
  .divider span:nth-child(2) {
    color: #6200EE; 
    padding: 0px 5px; 
    width: auto; 
    white-space: nowrap;
    font-size: 14px;
  }
  .divider span:last-child {				/* color changes in here */
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#6200EE), to(transparent));
    background-image: -webkit-linear-gradient(180deg, #6200EE, transparent);
    background-image: -moz-linear-gradient(180deg, #6200EE, transparent);
    background-image: -o-linear-gradient(180deg, #6200EE, transparent);
    background-image: linear-gradient(90deg, #6200EE, transparent);
  }
}

</style>