<template>
    <v-navigation-drawer id="main-drawer-nav" v-model="drawer" :rail="rail" permanent @click="rail = false" width="250">
        <v-list-item :prepend-avatar="userPicture" :title="userName" nav>
            <template v-slot:append>
                <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
            </template>
        </v-list-item>

        <v-divider class="border-opacity-75"></v-divider>

        <v-list density="compact" nav v-model="selectedItem">
            <v-list-item prepend-icon="mdi-bullseye-arrow" title="List all Jobs" color="primary" @click="listAllJobsClicked"
                :active="selectedItem == 0"></v-list-item>
            <v-list-item prepend-icon="mdi-plus" title="Create Job" color="primary" @click="createNewJobClicked"
                :active="selectedItem == 1"></v-list-item>
            <v-list-item prepend-icon="mdi-tray-full" title="Jobs in Queue" color="primary"
                @click="listAllJobsInQueueClicked" :active="selectedItem == 2"></v-list-item>
            <v-list-item @click="humidityOperationClicked" prepend-icon="mdi-water-thermometer-outline"
                title="Humidity Operation" color="primary" :active="selectedItem == 3"></v-list-item>
            <v-list-item @click="plantsListClicked" prepend-icon="mdi-sprout" title="List of plants" color="primary"
                :active="selectedItem == 4"></v-list-item>

            <v-list-item @click="editorClicked" prepend-icon="mdi-code-block-braces" title="Editor" color="primary"
                :active="selectedItem == 6"></v-list-item>

            <v-list-item prepend-icon="mdi-cog" title="Setting" color="primary" @click="settingClicked"
                :active="selectedItem == 5"></v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
export default {
    name: "MainDrawer",

    data: () => ({
        drawer: true,
        rail: true,
        selectedItem: 0,
    }),

    computed: {
        userDatas() {
            return this.$store.state.userDatas
        },

        userName() {
            return (this.userDatas?.name) ?? "FARM BOT Controller"
        },

        userPicture() {
            return (this.userDatas?.picture) ?? "https://robohash.org/farming"
        },

        listallJobsVisible() {
            return this.$store.state.listallJobsVisible
        },

        createNewJobVisible() {
            return this.$store.state.createNewJobVisible
        },

        listAllJobsInQueueVisible() {
            return this.$store.state.listAllJobsInQueueVisible
        },

        settingVisible() {
            return this.$store.state.settingVisible
        },
        humidityOperationVisible() {
            return this.$store.state.humidityOperationVisible
        },
        plantsListVisible() {
            return this.$store.state.plantsListVisible
        },
        editorVisible() {
            return this.$store.state.editorVisible
        },
    },

    watch: {
        listallJobsVisible(val) {
            if (val) {
                this.selectedItem = 0
            }
        },

        createNewJobVisible(val) {
            if (val) {
                this.selectedItem = 1
            }
        },

        listAllJobsInQueueVisible(val) {
            if (val) {
                this.selectedItem = 2
            }
        },

        humidityOperationVisible(val) {
            if (val) {
                this.selectedItem = 3
            }
        },

        plantsListVisible(val) {
            if (val) {
                this.selectedItem = 4
            }
        },

        settingVisible(val) {
            if (val) {
                this.selectedItem = 5
            }
        },

        editorVisible(val) {
            if (val) {
                this.selectedItem = 6
            }
        },

    },

    methods: {
        listAllJobsClicked() {
            this.$store.dispatch("setListallJobsVisible");
        },
        createNewJobClicked() {
            this.$store.dispatch("setCreateNewJobVisible");
        },
        listAllJobsInQueueClicked() {
            this.$store.dispatch("setListAllJobsInQueueVisible");
        },
        settingClicked() {
            this.$store.dispatch("setSettingVisible");
        },
        humidityOperationClicked() {
            this.$store.dispatch("setHumidityOperationVisible");
        },
        plantsListClicked() {
            this.$store.dispatch("setPlantsListVisible");
        },
        editorClicked() {
            this.$store.dispatch("setEditorVisible");
        }
    },

    mounted() {
        this.listAllJobsClicked()
    }
}
</script>