<template>
    <v-navigation-drawer permanent class="client-drawer-zone tw-relative" width="370">
        <list-all-jobs v-if="listallJobsVisible" class="list-of-all-jobs"></list-all-jobs>
        <create-new-job v-if="createNewJobVisible" class="create-new-job" @goToJobList="goToJobList"></create-new-job>
        <SettingMenu v-if="settingVisible" class="setting-menu"></SettingMenu>
        <VDisplayJobsQueue v-if="listAllJobsInQueueVisible" class="list-jobs-queue"></VDisplayJobsQueue>
        <HumidityOperation v-if="humidityOperationVisible" class="humidity-operation"></HumidityOperation>
        <ListPlants v-if="plantsListVisible" class="list-plants"></ListPlants>
        <Editor v-if="editorVisible" class="editor"></Editor>
    </v-navigation-drawer>
</template>

<script>
import ListAllJobs from '@/components/NavMenus/ListAllJobs.vue';
import CreateNewJob from '@/components/NavMenus/CreateNewJob.vue';
import SettingMenu from '@/components/NavMenus/SettingMenu.vue';
import VDisplayJobsQueue from '@/components/NavMenus/VDisplayJobsQueue.vue';
import HumidityOperation from '@/components/NavMenus/HumidityOperation.vue';
import ListPlants from '@/components/NavMenus/ListPlants.vue';
import Editor from '@/components/Editor/Editor.vue';

export default {
    name: "InnerDrawer",
    components: {
        ListAllJobs,
        CreateNewJob,
        SettingMenu,
        VDisplayJobsQueue,
        HumidityOperation,
        ListPlants,
        Editor
    },

    methods: {
        goToJobList() {
            this.$emit('goToJobList')
        }
    },
    computed: {
        createNewJobVisible() {
            return this.$store.state.createNewJobVisible;
        },
        listallJobsVisible() {
            return this.$store.state.listallJobsVisible;
        },
        listAllJobsInQueueVisible() {
            return this.$store.state.listAllJobsInQueueVisible;
        },
        settingVisible() {
            return this.$store.state.settingVisible;
        },
        humidityOperationVisible() {
            return this.$store.state.humidityOperationVisible;
        },
        plantsListVisible() {
            return this.$store.state.plantsListVisible;
        },
        editorVisible() {
            return this.$store.state.editorVisible;
        },
    }
}
</script>