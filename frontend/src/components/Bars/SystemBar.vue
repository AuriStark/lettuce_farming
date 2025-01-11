<template>
  <v-system-bar class="tw-cursor-pointer" color="grey-darken-4" window @click="oepnLogsDialog">

    <div id="logSction">
      <v-icon :color="logColor" :icon="logIcon"></v-icon>

      <span class="tw-ml-2">{{ lastLog?.message ?? '---' }}</span>
    </div>

    <v-spacer></v-spacer>

    <span id="currentHour" class="ms-2">{{ currentDateTime }}</span>
  </v-system-bar>
</template>

<script>

export default {
  data() {
    return {
      currentDateTime: ''
    };
  },

  mounted() {
    setInterval(() => {
      this.currentDateTime = this.getCurrentDateTime();
    }, 1000);
  },

  computed: {
    lastLog() {
      return this.$store.state.logs.at(-1)
    },

    logColor() {
      if (this.lastLog) {
        switch (this.lastLog.type) {
          case "info":
            return "light-blue-darken-2";
          case "success":
            return "green-darken-2";
          case "error":
            return "red-darken-2";
          case "warn":
            return "orange-darken-2";
        }
      }
      return "grey-darken-3"
    },

    logIcon() {
      if (this.lastLog) {
        switch (this.lastLog.type) {
          case "info":
            return "mdi-information";
          case "success":
            return "mdi-check";
          case "error":
            return "mdi-alert-circle-outline";
          case "warn":
            return "mdi-alert";
        }
      }
      return "mdi-information"
    }
  },

  methods: {
    getCurrentDateTime() {
      const date = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const formattedDateTime = `${month} ${day}, ${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;

      return formattedDateTime;
    },
    padZero(value) {
      return value < 10 ? `0${value}` : value;
    },

    oepnLogsDialog() {
      this.$emit("oepnLogsDialog")
    }
  }
}
</script>
