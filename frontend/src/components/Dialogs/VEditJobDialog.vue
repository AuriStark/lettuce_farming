<template>
  <v-row justify="center">
    <v-dialog scrollable width="500" height="800" v-model="m_opened">
      <v-card class="rounded-lg">
        <v-card-title class="tw-bg-violet-400 text-white !tw-flex tw-items-center">
          <div class="tw-flex-1">Edit Job</div>
          <v-btn color="white" variant="plain" icon density="compact" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider class="border-opacity-75"></v-divider>
        <v-card-text class="!tw-p-0" style="height: 300px">
          <CreateNewJob :isEditing="true" :jobDatas="$props.jobDatas" @closeDialog="close"> </CreateNewJob>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import CreateNewJob from '@/components/NavMenus/CreateNewJob.vue';

export default {
  name: "EditJobDialog",
  components: {
    CreateNewJob
  },
  props: {
    opened: Boolean,
    jobDatas: Object
  },
  data() {
    return {
      m_opened: true
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  },
  watch: {
    opened(value) {
      this.m_opened = value
    }
  },
};
</script>
