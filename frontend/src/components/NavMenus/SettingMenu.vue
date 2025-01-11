<template>
    <div class="mx-auto tw-relative tw-h-full" max-width="500">
        <v-form ref="settingForm">
            <div class="tw-px-3 tw-pt-3 tw-pb-12">
                <v-text-field v-model="name" label="User Name" density="compact" variant="outlined"></v-text-field>

                <v-expansion-panels>
                    <v-expansion-panel title="Allowed Field">
                        <v-expansion-panel-text>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="allowedFieldX" :rules="requiredRules" label="X" required
                                        density="compact" variant="outlined" suffix="mm" type="number">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="6">
                                    <v-text-field v-model="allowedFieldY" :rules="requiredRules" label="Y" required
                                        density="compact" variant="outlined" suffix="mm" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-text-field v-model="allowedFieldWidth" :rules="requiredRules" label="Width" required
                                density="compact" variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                            <v-text-field v-model="allowedFieldHeight" :rules="requiredRules" label="Height" required
                                density="compact" variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Deplacement">
                        <v-expansion-panel-text>
                            <v-text-field v-model="zSafe" :rules="requiredRules" label="Safe Z" required density="compact"
                                variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Seeding">
                        <v-expansion-panel-text>
                            <v-text-field v-model="zSeedSafe" :rules="requiredRules" label="Safe Z for seeding" required
                                density="compact" variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Watering">
                        <v-expansion-panel-text>

                            <div class="tw-mb-2">For Radish:</div>
                            <v-text-field v-model="wateringAmountR" :rules="requiredRules" label="Watering amount" required
                                density="compact" variant="outlined" suffix="ml" type="number">
                            </v-text-field>
                            <v-text-field v-model="wateringDistanceAbeveTheGroundR" :rules="requiredRules"
                                label="Watering distance above the ground" required density="compact" variant="outlined"
                                suffix="mm" type="number">
                            </v-text-field>
                            <v-text-field v-model="wateringIntervalR" :rules="requiredRules" label="Watering Interval"
                                required density="compact" variant="outlined" suffix="Hour" type="number">
                            </v-text-field>


                            <div class="tw-mb-2">For Lettuce:</div>
                            <v-text-field v-model="wateringAmountL" :rules="requiredRules" label="Watering amount" required
                                density="compact" variant="outlined" suffix="ml" type="number">
                            </v-text-field>
                            <v-text-field v-model="wateringDistanceAbeveTheGroundL" :rules="requiredRules"
                                label="Watering distance above the ground" required density="compact" variant="outlined"
                                suffix="mm" type="number">
                            </v-text-field>
                            <v-text-field v-model="wateringIntervalL" :rules="requiredRules" label="Watering Interval"
                                required density="compact" variant="outlined" suffix="Hour" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Humidity measurement">
                        <v-expansion-panel-text>
                            <v-text-field v-model="humidityInterval" :rules="requiredRules" label="Humidity Interval"
                                required density="compact" variant="outlined" suffix="Hour" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Seeds positions">
                        <v-expansion-panel-text>
                            <v-text-field v-model="seederPosX" :rules="requiredRules" label="X" required density="compact"
                                variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                            <v-text-field v-model="seederPosY" :rules="requiredRules" label="Y" required density="compact"
                                variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                            <v-text-field v-model="seederPosZ" :rules="requiredRules" label="Z" required density="compact"
                                variant="outlined" suffix="mm" type="number">
                            </v-text-field>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                </v-expansion-panels>

                <div
                    class="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-violet-50 tw-px-2 tw-py-3 tw-flex tw-items-center tw-z-10 tw-justify-end">
                    <v-btn :disabled="!valid" color="green" class="mr-4" @click="saveSetting">
                        Update
                    </v-btn>
                    <v-btn color="error" @click="resetForm"> Reset </v-btn>
                </div>
            </div>
        </v-form>
    </div>
</template>
  
  <!-- Script -->
<script>
import { updateSetting } from "@/js/api";

export default {
    name: "SettingMenu",

    data: () => ({
        valid: true,
        requiredRules: [(v) => (v != undefined && v != null) || "this field is required"],

        name: null,
        allowedFieldX: null,
        allowedFieldY: null,
        allowedFieldWidth: null,
        allowedFieldHeight: null,

        zSafe: null,
        zSeedSafe: null,

        seederPosX: null,
        seederPosY: null,
        seederPosZ: null,

        wateringAmountR: null,
        wateringDistanceAbeveTheGroundR: null,
        wateringIntervalR: null,

        wateringAmountL: null,
        wateringDistanceAbeveTheGroundL: null,
        wateringIntervalL: null,

        humidityInterval: null
    }),


    computed: {
        userDatas() {
            return this.$store.state.userDatas
        },
    },

    watch: {
        allowedFieldX(val) {
            this.updateAllowedField()
        },

        allowedFieldY() {
            this.updateAllowedField()
        },

        allowedFieldWidth() {
            this.updateAllowedField()
        },

        allowedFieldHeight() {
            this.updateAllowedField()
        },
    },

    methods: {
        updateAllowedField() {
            let userData = { ...this.$store.state.userDatas }

            if (!userData.allowedField) {
                userData.allowedField = {}
            }

            userData.allowedField.x = this.allowedFieldX
            userData.allowedField.y = this.allowedFieldY
            userData.allowedField.width = this.allowedFieldWidth
            userData.allowedField.height = this.allowedFieldHeight

            this.$store.commit('setUserDatas', userData)
        },

        createPayload() {
            return {
                name: this.name,

                allowedFieldX: this.allowedFieldX,
                allowedFieldY: this.allowedFieldY,
                allowedFieldWidth: this.allowedFieldWidth,
                allowedFieldHeight: this.allowedFieldHeight,

                zSafe: this.zSafe,
                zSeedSafe: this.zSeedSafe,

                seederPosX: this.seederPosX,
                seederPosY: this.seederPosY,
                seederPosZ: this.seederPosZ,

                wateringAmountR: this.wateringAmountR,
                wateringDistanceAbeveTheGroundR: this.wateringDistanceAbeveTheGroundR,
                wateringIntervalR: this.wateringIntervalR,

                wateringAmountL: this.wateringAmountL,
                wateringDistanceAbeveTheGroundL: this.wateringDistanceAbeveTheGroundL,
                wateringIntervalL: this.wateringIntervalL,

                humidityInterval: this.humidityInterval
            }
        },

        async saveSetting() {
            const { valid } = await this.$refs.settingForm.validate();

            if (valid) {
                let params = this.createPayload();

                updateSetting(params)
                    .then((response) => {
                        console.log(response);
                        this.$toast.success("Setting successful updated");
                    })
                    .catch((error) => {
                        console.log(error);
                        this.$toast.error(error);
                    });
            }
        },

        resetForm() {
            this.$refs.settingForm.reset();
        },

        chargeDatas() {
            this.name = this.userDatas?.name
            this.allowedFieldX = this.userDatas?.allowedField?.x
            this.allowedFieldY = this.userDatas?.allowedField?.y
            this.allowedFieldWidth = this.userDatas?.allowedField?.width
            this.allowedFieldHeight = this.userDatas?.allowedField?.height

            this.zSafe = this.userDatas?.zSafe
            this.zSeedSafe = this.userDatas?.zSeedSafe

            this.seederPosX = this.userDatas?.seederPos?.x
            this.seederPosY = this.userDatas?.seederPos?.y
            this.seederPosZ = this.userDatas?.seederPos?.z

            this.wateringAmountR = this.userDatas?.defaultValues?.radish?.wateringAmount
            this.wateringDistanceAbeveTheGroundR = this.userDatas?.defaultValues?.radish?.wateringDistanceAbeveTheGround
            this.wateringIntervalR = this.userDatas?.defaultValues?.radish?.wateringInterval

            this.wateringAmountL = this.userDatas?.defaultValues?.lettuce?.wateringAmount
            this.wateringDistanceAbeveTheGroundL = this.userDatas?.defaultValues?.lettuce?.wateringDistanceAbeveTheGround
            this.wateringIntervalL = this.userDatas?.defaultValues?.lettuce?.wateringInterval

            this.humidityInterval = this.userDatas?.humidityInterval
        }
    },

    mounted() {
        this.chargeDatas()
    }

};
</script>
  
  <!-- Style -->
<style scoped lang="scss"></style>
  