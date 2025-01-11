<template>
    <circle v-if="showMoisture" class="tw-origin-center" :cx="xPos" :cy="yPos" r="50" :fill="`rgb(0, 0, ${heatBColor})`"
        :fill-opacity="heatOpacity"></circle>
    <LettuceSVG v-if="cropType == 'lettuce'" :xPos="xPos" :yPos="yPos" :temporal="temporal"
        :isSelected="selectedCropType == 'lettuce'">
    </LettuceSVG>
    <RadishSVG v-if="cropType == 'radish'" :xPos="xPos" :yPos="yPos" :temporal="temporal"
        :isSelected="selectedCropType == 'radish'">
    </RadishSVG>
</template>

<script>
import LettuceSVG from "./LettuceSVG.vue";
import RadishSVG from "./RadishSVG.vue"

export default {
    components: {
        LettuceSVG,
        RadishSVG
    },

    props: {
        cropType: String,
        xPos: Number,
        yPos: Number,
        temporal: Boolean,
        humidity: Number,
        showMoisture: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        selectedCropType() {
            return this.$store.state.selectedCropType
        },

        heatBColor() {
            if (!this.humidity) return 40
            let val = (this.humidity * 200) / 450
            return val > 255 ? 255 : (val < 40 ? 40 : val)
        },

        heatOpacity() {
            if (!this.humidity) return 0.3
            let val = (this.humidity * 0.75) / 450
            return val > 1 ? 1 : (val < 0.4 ? 0.4 : val)
        }
    }
}
</script>