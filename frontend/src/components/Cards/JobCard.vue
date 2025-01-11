<template>
    <v-card elevation="4" class="!tw-cursor-pointer" @mouseover="showTarget" @mouseleave="hideTarget">
        <v-card-item>
            <template v-slot:title>
                <div class="tw-flex">
                    {{ jobName }}
                    <v-spacer></v-spacer>
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn icon="mdi-dots-vertical" v-bind="props" density="compact" variant="plain"></v-btn>
                        </template>

                        <v-list>
                            <v-list-item v-for="(item, i) in actions" :key="i" @click="item.action">
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </template>
            <template v-slot:subtitle>
                <div class="tw-flex">
                    <v-chip v-if="isCurrentJob || executed || isInQueue"
                        :class="`tw-mr-1 ${isCurrentJob ? 'tw-origin-center animate animate__animated animate__pulse animate__infinite' : ''}`"
                        class=""
                        :color="executed ? 'green' : (isCurrentJob ? 'blue-darken-3' : (isInQueue ? 'deep-orange-darken-3' : 'gray'))"
                        text-color="white"
                        :prepend-icon="executed ? 'mdi-checkbox-marked-circle' : (isCurrentJob ? 'mdi-run-fast' : (isInQueue ? 'mdi-tray-full' : 'mdi-calendar-clock'))"
                        size="small">
                        {{ executed ? 'Executed' : (isCurrentJob ? 'In process' : (isInQueue ? 'In Queue' : 'Planned')) }}
                    </v-chip>
                    <v-chip v-if="filedOperation == 'watering'" :color="activated ? 'green' : 'red'" text-color="white"
                        :prepend-icon="activated ? 'mdi-sync' : 'mdi-sync-off'" size="small">
                        {{ activated ? 'Activated' : 'Disabled' }}
                    </v-chip>
                </div>
            </template>
        </v-card-item>

        <v-card-text class="py-0">
            <v-progress-linear v-model="progress" :color="executed ? 'green' : 'deep-purple-lighten-4'" :height="14">
                <template v-slot:default="{ value }">
                    <span class="tw-text-xs">{{ executed ? 100 : Math.ceil(value) }}%</span>
                </template>
            </v-progress-linear>
        </v-card-text>

        <div class="d-flex py-3 justify-space-between">
            <v-list-item v-if="filedOperation" density="compact">
                <template v-slot:prepend>
                    <v-icon class="!tw-me-0.5" :icon="operationIcon" :color="operationColor"></v-icon>
                </template>
                <v-list-item-subtitle :class="'text-' + operationColor">{{ filedOperation }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="wateringScheduledAt" density="compact">
                <template v-slot:prepend>
                    <v-icon class="!tw-me-0.5" icon="mdi-calendar-clock"></v-icon>
                </template>
                <v-list-item-subtitle>{{ scheduleDate }}</v-list-item-subtitle>
            </v-list-item>
        </div>

        <v-expand-transition>
            <div v-if="expand">
                <div v-if="filedOperation == 'watering'" class="py-2">
                    <v-slider v-if="activated" v-model="day" :max="6" :step="1" :ticks="labels" class="mx-4" color="primary"
                        density="compact" hide-details show-ticks="always" thumb-size="10" thumb-label="always" disabled>

                        <template v-slot:thumb-label="{ modelValue }">
                            {{ hours }}
                        </template>
                    </v-slider>
                </div>

                <v-list class="bg-transparent">
                    <template v-for="(item, index) in details">
                        <v-list-item v-if="item.date" :key="index" :title="item.name" :append-icon="item.icon"
                            :subtitle="item.date">
                        </v-list-item>
                    </template>
                </v-list>
            </div>
        </v-expand-transition>

        <v-divider></v-divider>

        <v-card-actions>
            <v-btn @click="expand = !expand" :prepend-icon="expand ? 'mdi-chevron-up' : 'mdi-chevron-down'">
                {{ expand ? 'Hide Details' : 'More Details' }}
            </v-btn>

            <v-btn v-if="(this.mode !== 'queueMode') && (!isCurrentJob) && (!isStarted)" color="green" variant="tonal"
                :disabled="executed" @click="executeJob">
                Execute
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { computesSeedPositions } from "@/js/computing"
import { startJob, deleteJob } from '@/js/api'

export default {
    name: "JobCard",

    props: {
        jobDatas: Object,
        mode: String
    },

    data: () => ({
        labels: { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WED', 4: 'TH', 5: 'FR', 6: 'SA' },
        expand: false,

        dateFormater: new Intl.DateTimeFormat('en-US', {
            timeStyle: "short",
            dateStyle: "short",
        }),

        timer: undefined,

        isInQueue: false
    }),

    computed: {
        jobName() { return (this.jobDatas?.name ?? '---') },
        executed() { return (this.jobDatas?.executed ?? false) },
        filedOperation() { return this.jobDatas?.operation },
        createdAt() { return this.jobDatas?.createdAt },
        executedAt() { return this.jobDatas?.executedAt },
        wateringScheduledAt() { return this.jobDatas?.wateringDetails?.scheduledAt },
        progress() { return this.executed ? 100 : this.jobDatas?.progress },
        fieldBondary() { return this.jobDatas?.fieldBondary },

        activated() { return this.jobDatas?.wateringDetails?.activated ?? true },

        details() {
            let createdAt = (this.createdAt ? this.dateFormater.format(new Date(this.createdAt)) : null);
            let executedAt = (this.executedAt ? this.dateFormater.format(new Date(this.executedAt)) : null)

            return [
                {
                    name: 'Created At', icon: 'mdi-calendar-month-outline',
                    date: createdAt
                },
                {
                    name: 'Executed At', icon: 'mdi-calendar-check-outline',
                    date: executedAt
                }
            ]
        },

        scheduleDate() {
            return (this.wateringScheduledAt ? this.dateFormater.format(new Date(this.wateringScheduledAt)) : null)
        },

        actions() {
            if (this.mode == "queueMode") {
                return [
                    { title: 'Full Details', action: this.openDetails }
                ]
            } else {
                return [
                    { title: 'Edit', action: this.editDetails },
                    { title: 'Delete', action: this.jobDeletion },
                    { title: 'Full Details', action: this.openDetails }
                ]
            }
        },

        day() {
            if (!this.wateringScheduledAt) return 0;

            let date = new Date(this.wateringScheduledAt)
            return date.getDay();
        },

        hours() {
            if (!this.wateringScheduledAt) return 0;

            let date = new Date(this.wateringScheduledAt)
            return date.getHours();
        },

        isCurrentJob() {
            if (this.$store.state.currentFarmJobID) {
                return (this.jobDatas?._id == this.$store.state.currentFarmJobID) ?? false
            }
            return false
        },

        isStarted() {
            let jobs = this.$store.state.farmJobQueue

            for (let i = 0; i < jobs.length; i++) {
                if (this.jobDatas?._id == jobs[i]._id) {
                    return true
                }
            }
            return false
        },

        farmJobQueue() {
            return this.$store.state.farmJobQueue
        },

        /*isInQueue() {
            for (let i = 0; i < this.farmJobQueue.length; i++) {
                if (this.jobDatas._id == this.farmJobQueue[i]._id) {
                    return true
                }
            }
            return false
        },*/

        operationColor() {
            if (this.filedOperation == "seeding") {
                return 'teal-darken-3'
            } else if (this.filedOperation == "watering") {
                return 'light-blue-darken-3'
            }
            return 'gray'
        },

        operationIcon() {
            if (this.filedOperation == "seeding") {
                return 'mdi-sprout'
            } else if (this.filedOperation == "watering") {
                return 'mdi-watering-can'
            }
            return 'mdi-bullseye-arrow'
        }
    },

    watch: {
        farmJobQueue() {
            for (let i = 0; i < this.farmJobQueue.length; i++) {
                if (this.jobDatas._id == this.farmJobQueue[i]._id) {
                    this.isInQueue = true
                    return
                }
            }
        }
    },

    methods: {
        openDetails() {
            this.$emit('openJobDialog', this.jobDatas)
        },

        editDetails() {
            this.$emit('editJobDialog', this.jobDatas)
        },

        executeJob() {
            startJob(this.jobDatas._id)
                .then((response) => {
                    console.log("Job started with id: " + this.jobDatas._id)
                }).catch((error) => {
                    console.log("something is broke unfortunately :)")
                    console.log(error);
                });
        },

        jobDeletion() {
            deleteJob(this.jobDatas._id)
                .then((response) => {
                    console.log("delete job with id: " + this.jobDatas._id)
                    this.$toast.success("Job deleted");
                }).catch((error) => {
                    console.log("something is broke unfortunately :)")
                    this.$toast.error("Something whent wrong");
                    console.log(error);
                });
        },

        showTarget() {

            if (this.filedOperation == "seeding") {
                if (this.fieldBondary) {
                    this.$store.commit('setHoverArea', this.fieldBondary)

                    if (!this.executed) {
                        this.computesSeeds()
                    }
                }
            } else if (this.filedOperation == "watering") {
                let cropType = this.jobDatas.wateringDetails?.cropType

                if (cropType) {
                    this.$store.commit("setSelectedCropType", cropType)
                }
            }

        },

        hideTarget() {
            if (this.timer) clearTimeout(this.timer)

            this.$store.commit('setHoverArea', null)
            this.$store.commit("setTemporalSeeds", [])
            this.$store.commit("setSelectedCropType", null)
        },

        computesSeeds(time = 500) {
            clearTimeout(this.timer)

            this.timer = setTimeout(async () => {
                let plantDistance = this.jobDatas?.seedingDetails?.plantDistance
                let cropType = this.jobDatas?.seedingDetails?.cropType

                if (this.fieldBondary && plantDistance && cropType) {
                    let tmpPlants = await computesSeedPositions(cropType, this.fieldBondary, plantDistance)

                    this.$store.commit("setTemporalSeeds", tmpPlants)
                } else {
                    this.$store.commit("setTemporalSeeds", [])
                }
            }, time)
        },
    }
}
</script>