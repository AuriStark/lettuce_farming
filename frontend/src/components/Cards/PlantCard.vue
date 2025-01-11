<template>
    <div
        class="tw-flex tw-flex-row tw-justify-between tw-items-center hover:tw-bg-violet-600/25 tw-p-3 hover:tw-rounded-lg tw-cursor-pointer tw-border-b hover:tw-border-b-0">
        <div class="tw-flex tw-flex-row tw-items-center">
            <div class="tw-flex tw-rounded-full tw-bg-[#ccaa88] tw-border-4 tw-border-[#c39f7a] tw-mr-2">
                <Plant v-if="cropType" :cropType="cropType" :xPos="0" :yPos="0"></Plant>
            </div>
            <span>{{ cropType }}</span>
        </div>

        <div class="tw-flex tw-flex-row tw-items-center">
            <span>{{ `${plantOld} day${plantOld > 1 ? 's' : ''} old` }}</span>
            <v-btn variant="elevated" icon  class="tw-ml-2" @click="openDetails">
                <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import Plant from "@/components/Grid/Plant.vue";

export default {
    name: "JobCard",

    components: {
        Plant
    },

    props: {
        plantDatas: Object,
    },

    data: () => ({
    }),

    computed: {
        cropType() { return this.plantDatas?.cropType },
        seededtime() { return this.plantDatas?.seededtime },

        plantOld() {
            if (!this.seededtime) return 0

            let now = new Date()
            let seedDate = new Date(this.seededtime)

            // To calculate the time difference of two dates
            var Difference_In_Time = now.getTime() - seedDate.getTime();

            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            return parseInt(Difference_In_Days)
        },
    },

    methods: {
        openDetails() {
            this.$emit('openPlantDialog', this.plantDatas)
        },
    }
}
</script>