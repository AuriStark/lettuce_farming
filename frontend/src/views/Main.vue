<template>
  <v-layout>

    <SystemBar id="systemBar" @oepnLogsDialog="oepnLogsDialog"></SystemBar>

    <AppBar id="appBar"></AppBar>

    <MainDrawer></MainDrawer>

    <v-main class="tw-h-screen">
      <InnerDrawer></InnerDrawer>

      <div class="tw-relative tw-h-screen tw-overflow-auto tw-p-10 tw-bg-stone-100">
        <grid-area id="grid-area" :scaleFactor="gridScaleFactor" :showPlants="showPlants" :showFarmbot="showFarmbot"
          :showMoisture="showMoisture"></grid-area>

        <div class="grid-menu tw-fixed tw-top-28 tw-right-5 tw-flex">
          <v-btn variant="text" :icon="showGridMenu ? 'mdi-arrow-right-thick' : 'mdi-arrow-left-thick'" color="black"
            size="large" @click="toggleGridMenu"></v-btn>

          <div v-if="showGridMenu" class="tw-p-5 tw-shadow-lg tw-rounded-lg tw-bg-white/80">
            <div class="tw-flex tw-flex-row ">
              <v-btn class="ma-2" icon="mdi-magnify-minus-outline" color="gray" @click="gridZoomOut"></v-btn>
              <v-btn class="ma-2" icon="mdi-magnify-plus-outline" color="gray" @click="gridZoomIn"></v-btn>
            </div>
            <v-switch v-model="showPlants" label="Plants" color="success" hide-details></v-switch>
            <v-switch v-model="showMoisture" label="Moisture" color="success" hide-details></v-switch>
            <v-switch v-model="showFarmbot" label="Farmbot" color="success" hide-details></v-switch>
          </div>
        </div>
      </div>
    </v-main>

    <LogsDialog v-if="logsDialogOpened" :opened="logsDialogOpened" @close="closeLogsDialog"></LogsDialog>
  </v-layout>
</template>

<script>
import GridArea from '@/components/Grid/GridArea.vue';
import SystemBar from '@/components/Bars/SystemBar.vue';
import MainDrawer from '@/components/Drawers/MainDrawer.vue';
import AppBar from '@/components/Bars/AppBar.vue';
import InnerDrawer from '@/components/Drawers/InnerDrawer.vue';
import LogsDialog from '@/components/Dialogs/LogsDialog.vue';

import { socket } from "@/js/socket";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default {
  components: {
    GridArea,
    AppBar,
    SystemBar,
    MainDrawer,
    InnerDrawer,
    LogsDialog
  },

  data: () => ({
    drawer: true,
    rail: true,

    gridScaleFactor: 0.3,
    showGridMenu: true,
    logsDialogOpened: false,

    showPlants: true,
    showMoisture: false,
    showFarmbot: true,
  }),

  computed: {
  },

  methods: {
    gridZoomIn() {
      this.gridScaleFactor = this.gridScaleFactor + 0.1
    },

    gridZoomOut() {
      this.gridScaleFactor = this.gridScaleFactor - 0.1
    },

    toggleGridMenu() {
      this.showGridMenu = !this.showGridMenu
    },

    oepnLogsDialog() {
      this.logsDialogOpened = true
    },

    closeLogsDialog() {
      this.logsDialogOpened = false
    }
  },

  mounted() {
    const firstTourShowed = localStorage.getItem("firstTourShowed");

    if (!firstTourShowed) {

      const driverObj = driver({
        popoverClass: 'driverjs-theme',
        showProgress: true,
        steps: [
          { element: '#systemBar', popover: { title: 'Application Tour :)', description: 'Hi, Welcome to our application,I will help you get started and introduce you to everything you need to know.', side: "left", align: 'start' } },
          { element: '#systemBar #logSction', popover: { title: 'Log section', description: 'This ist the log section. Here we displays information about the status, progress, or errors about the Jobs.', side: "left", align: 'start' } },
          { element: '#systemBar #currentHour', popover: { title: 'Date', description: 'Display the current date and time to the Farmer.', side: "left", align: 'start' } },

          { element: '#appBar', popover: { title: 'Application Bar', description: 'Contain information about the bot-position, Connectivity to the bot, the activ job and the unlock and lock boutton.', side: "left", align: 'start' } },
          { element: '#bot-position', popover: { title: 'Bot position', description: 'Give the actual position of the Bot', side: "left", align: 'start' } },
          { element: '#job-progress-btn', popover: { title: 'Progress button', description: 'Provide feedback to the Farmer about the status, duration, and percentage of the current job.', side: "left", align: 'start' } },
          { element: '#connectivity-btn', popover: { title: 'connectivity button', description: 'presents the connection status to the Farmbot. (Online/offline)', side: "left", align: 'start' } },
          { element: '#loc-unlock-btn', popover: { title: 'Lock and Unlock button', description: 'Enabling or disabling connexion to the Farmbot.', side: "left", align: 'start' } },

          { element: '#main-drawer-nav', popover: { title: 'Job and Navigation bar', description: 'In this Area you can create, delete or start a job. See the progression of the jobs, Define default values, Visualize plant type, go to the settings ...', side: "left", align: 'start' } },

          {
            element: '#grid-area #svgGridBack', popover: {
              title: 'Field Area', description: 'displays information about the size, location, plants and characteristics of the field.', side: "left", align: 'start', onNextClick: () => {
                localStorage.setItem("firstTourShowed", true);
                driverObj.destroy();
              }
            }
          },
        ],

        onCloseClick: () => {
          console.log("------>")
          localStorage.setItem("firstTourShowed", true);

          driverObj.destroy();
        }
      });

      driverObj.drive();
    }
  }

};
</script>

<style lang="scss">
.driver-popover.driverjs-theme {
  background-color: #CE93D8;
  color: #fff;
}

.driver-popover.driverjs-theme .driver-popover-title {
  font-size: 20px;
}

.driver-popover.driverjs-theme .driver-popover-title,
.driver-popover.driverjs-theme .driver-popover-description,
.driver-popover.driverjs-theme .driver-popover-progress-text {
  color: #fff;
}

.driver-popover.driverjs-theme button {
  flex: 1;
  text-align: center;
  background-color: #000;
  color: #ffffff;
  border: 2px solid #000;
  text-shadow: none;
  font-size: 14px;
  padding: 5px 8px;
  border-radius: 6px;

  &.driver-popover-close-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    padding: 0;
    top: 4px;
    right: 4px;
  }
}

.driver-popover.driverjs-theme button:hover {
  background-color: #000;
  color: #ffffff;
}

.driver-popover.driverjs-theme .driver-popover-navigation-btns {
  justify-content: space-between;
  gap: 3px;
}

.driver-popover.driverjs-theme .driver-popover-close-btn {
  color: #9b9b9b;
}

.driver-popover.driverjs-theme .driver-popover-close-btn:hover {
  color: #000;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-left.driver-popover-arrow {
  border-left-color: #CE93D8;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-right.driver-popover-arrow {
  border-right-color: #CE93D8;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-top.driver-popover-arrow {
  border-top-color: #CE93D8;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-bottom.driver-popover-arrow {
  border-bottom-color: #CE93D8;
}
</style>
