<template>
    <v-row justify="center">
        <v-dialog v-model="m_opened" fullscreen :scrim="false" transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Logs Details</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn color="white" variant="plain" dark icon @click="close">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-divider class="divider"></v-divider>

                <v-data-table :headers="headers" :items="logs" :search="search" class="elevation-1 data_table">
                    <template v-slot:item.type="{ item }">
                        <v-icon :color="getLogColor(item.columns.type)" :icon="getLogIcon(item.columns.type)"></v-icon>

                        <span class="tw-ml-2">{{ item.columns.type }}</span>
                    </template>
                </v-data-table>

            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
// import store from '../stores/store'

export default {
    name: "LogsDialog",

    props: {
        opened: Boolean,
    },

    data() {
        return {
            m_opened: true,

            search: '',
            headers: [
                {
                    key: 'type',
                    title: 'Type'
                },
                {
                    key: 'message',
                    title: 'Message'
                },
                {
                    key: 'time',
                    title: 'Time'
                },
                {
                    key: 'position',
                    title: '(X, Y, Z)'
                }
            ],
            logs: [],
        }
    },

    watch: {
        opened(value) {
            this.m_opened = value
        }
    },

    methods: {
        close() {
            this.$emit('close')
        },

        getLogColor(type) {
            if (type) {
                switch (type) {
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

        getLogIcon(type) {
            if (type) {
                switch (type) {
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

    mounted() {
        this.logs = this.getLogs;
    },

    computed: {
        getLogs() {
            let logs = this.$store.state.logs.map(log => {
                log.position = `(${log.x}, ${log.y}, ${log.z})`

                let dateFormater = new Intl.DateTimeFormat('en-US')
                log.time = dateFormater.format(new Date(log.created_at * 1000))
                return log
            })
            return logs
        }
    },

}
</script>

<style lang="scss" scoped>
.divider {
    display: table;
    font-size: 24px;
    text-align: center;
    width: 75%;
    margin: 40px auto;
}

.data_table {
    margin: 20px 20px 20px 20px;
}
</style>
