<template>
    <v-app-bar :elevation="1" density="compact" color="deep-purple-lighten-5">
        <template v-slot:append>
            <div id="bot-position"
                class="tw-mr-2 tw-bg-indigo-500 tw-shadow-lg tw-shadow-indigo-500/50 tw-p-1 tw-ring tw-rounded-md text-white">
                {{ botPositionText }}
            </div>

            <v-divider class="mx-3 border-opacity-100" vertical inset></v-divider>

            <v-menu v-model="jobMenu" :close-on-content-click="false" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn id="job-progress-btn" variant="tonal" class="tw-mr-2 tw-relative tw-overflow-hidden" size="small" v-bind="props">
                        <div class="tw-absolute tw-bg-indigo-400 tw-top-0 tw-left-0 tw-bottom-0 tw-h-full tw-z-0"
                            :style="{ width: lastJobProgress + '%' }"></div>
                        <div class="tw-z-10">{{ (lastJob?.message ?? 'NO ACTIVE JOBS') }}</div>
                    </v-btn>
                </template>

                <v-card min-width="300">
                    <v-data-table :headers="jobHeaders" :items="jobs" class="elevation-1" :items-per-page="jobsPerPage"
                        density="compact" :sort-by="jobsSortingCriterias">
                        <template v-slot:item.progress="{ item }">
                            <v-progress-circular class="tw-center" :rotate="360" :size="30" :width="3"
                                :model-value="item.columns.progress"
                                :color="item.columns.progress == 100 ? 'success' : 'purple'">
                                <span class="tw-text-xs">{{ item.columns.progress }}</span>
                            </v-progress-circular>
                        </template>
                    </v-data-table>
                </v-card>
            </v-menu>

            <v-btn id="connectivity-btn" variant="tonal" class="tw-mr-2" size="small" append-icon="mdi-check-circle">
                Connectivity

                <template v-slot:append>
                    <v-icon :color="connected ? 'success' : 'error'"></v-icon>
                </template>
            </v-btn>

            <div id="loc-unlock-btn">
                <v-btn v-if="!locked" variant="flat" class="tw-mr-2" size="small" color="red-accent-1"
                    @click="emergencyLock">LOCK</v-btn>
                <v-btn v-if="locked" variant="flat" class="tw-mr-2" size="small" color="green-accent-1"
                    @click="emergencyUnLock">UNLOCK</v-btn>
            </div>

            <v-btn icon="mdi-dots-vertical"></v-btn>
        </template>
    </v-app-bar>
</template>

<script>
import { emergencyLock, emergencyUnLock } from "@/js/api";

export default {
    name: "AppBar",

    data() {
        return {
            jobMenu: false,
            jobsPerPage: 4
        }
    },

    computed: {
        connected() {
            return this.$store.state.connected
        },

        botPosition() {
            return this.$store.state.botPosition
        },

        botPositionText() {
            return `(${this.botPosition?.x}, ${this.botPosition?.y}, ${this.botPosition?.z})`
        },

        lastJob() {
            return this.$store.state.lastJob
        },

        lastJobProgress() {
            return this.lastJob?.progress ?? 0
        },

        jobs() {
            let jobs = this.$store.state.jobs
            let list = []
            for (var i in jobs)
                list.push(jobs[i]);

            return list
        },

        jobHeaders() {
            return [
                { title: 'Message', key: 'message', sortable: false, align: 'start' },
                { title: 'Progress (%)', key: 'progress', sortable: true, align: 'center' },
            ]
        },

        jobsSortingCriterias() {
            return [{ key: 'time', order: 'desc' }]
        },

        locked() {
            return this.$store.state.locked
        }
    },

    methods: {
        emergencyLock() {
            emergencyLock()
                .then(res => {
                    console.log("---------0", res)
                })
        },
        emergencyUnLock() {
            emergencyUnLock()
                .then(res => {
                    console.log("---------1", res)
                })
        }
    }
}
</script>