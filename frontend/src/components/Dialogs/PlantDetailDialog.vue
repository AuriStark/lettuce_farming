<template>
    <v-row justify="center">
        <v-dialog v-model="m_opened" scrollable width="500">
            <v-card class="rounded-lg">
                <v-card-title class="tw-bg-violet-400 text-white !tw-flex tw-items-center">
                    <div class="tw-flex-1">Plant Details</div>

                    <v-btn color="white" variant="plain" icon density="compact" @click="close">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="border-opacity-75"></v-divider>

                <v-card-text style="height: 300px;">
                    <div class="job-details-body">

                        <!-- JOB DETAILS -->

                        <v-row class="job-details-row">
                            <span> Croptype </span>
                            <v-chip color="primary" text-color="white" prepend-icon="mdi-sprout" size="small">
                                {{ cropType }}
                            </v-chip>
                        </v-row>

                        <v-row class="job-details-row">
                            <span> Humidity value </span>
                            <span> {{ humidityValue }} </span>
                        </v-row>

                        <!-- Todo extract the exact date needed ( calender day plus time) -->

                        <v-row class="job-details-row">
                            <span> Seeded at</span>
                            <span> {{ seededDate }} </span>
                        </v-row>

                        <div class="divider">
                            <span></span>
                            <span>Position</span>
                            <span></span>
                        </div>

                        <v-row class="job-details-row">
                            <span> X </span>
                            <span> {{ positionX }} </span>
                        </v-row>

                        <v-row class="job-details-row">
                            <span> Y </span>
                            <span> {{ positionY }} </span>
                        </v-row>

                        <v-row class="job-details-row">
                            <span> Z </span>
                            <span> {{ positionZ }} </span>
                        </v-row>


                    </div>

                </v-card-text>
            </v-card>
        </v-dialog>
    </v-row>
</template>
  
<script>
export default {
    name: "PlantDetailDialog",

    props: {
        opened: Boolean,
        plantDatas: Object
    },

    data() {
        return {
            m_opened: true,
            dateFormater: new Intl.DateTimeFormat('en-US', {
                timeStyle: "short",
                dateStyle: "short",
            }),
        }
    },

    watch: {
        opened(value) {
            this.m_opened = value
        }
    },

    computed: {
        // The real data values of the Json should stilll be matched in the Return pattern
        cropType() { return this.plantDatas?.cropType },

        positionX() { return this.plantDatas?.position?.x },
        positionY() { return this.plantDatas?.position?.y },
        positionZ() { return this.plantDatas?.position?.z },

        humidityValue() { return this.plantDatas?.humidityValue ?? '---' },
        lastHumdityMeasureTime() { return this.plantDatas?.lastHumdityMeasureTime },
        seededtime() { return this.plantDatas?.seededtime },

        seededDate() { return (this.seededtime ? this.dateFormater.format(new Date(this.seededtime)) : '---') },
    },

    methods: {
        close() {
            this.$emit('close')
        },
    }
}
</script>
  
<style lang="scss" scoped>
.job-details-body {
    align-items: center;

    .job-details-row {
        margin: 5px 20px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

    }

    .divider {
        /* minor cosmetics */
        display: table;
        font-size: 24px;
        text-align: center;
        width: 75%;
        /* divider width */
        margin: 40px auto;
        /* spacing above/below */
    }

    .divider span {
        display: table-cell;
        position: relative;
    }

    .divider span:first-child,
    .divider span:last-child {
        width: 50%;
        top: 13px;
        /* adjust vertical align */
        -moz-background-size: 100% 2px;
        /* line width */
        background-size: 100% 2px;
        /* line width */
        background-position: 0 0, 0 100%;
        background-repeat: no-repeat;
    }

    .divider span:first-child {
        /* color changes in here */
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

    .divider span:last-child {
        /* color changes in here */
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#6200EE), to(transparent));
        background-image: -webkit-linear-gradient(180deg, #6200EE, transparent);
        background-image: -moz-linear-gradient(180deg, #6200EE, transparent);
        background-image: -o-linear-gradient(180deg, #6200EE, transparent);
        background-image: linear-gradient(90deg, #6200EE, transparent);
    }
}
</style>