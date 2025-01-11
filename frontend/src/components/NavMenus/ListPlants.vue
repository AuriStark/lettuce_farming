<template>
    <div class="mx-auto tw-relative tw-h-full" max-width="500">
        <div
            class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-bg-violet-200 tw-px-2 tw-py-3 tw-flex tw-items-center tw-z-10">
            <v-text-field density="compact" variant="solo" label="Search for plants" append-inner-icon="mdi-magnify"
                single-line hide-details v-model="searchQuery">

                <template v-slot:prepend>
                    <v-menu :close-on-content-click="false" location="end">
                        <template v-slot:activator="{ props }">
                            <v-badge :content="sorts ? sorts.length : 0" color="error">
                                <v-icon icon="mdi-sort" v-bind="props"></v-icon>
                            </v-badge>
                        </template>

                        <v-card min-width="300">
                            <v-select v-model="sorts" :items="sortsList" chips label="Sorting" multiple
                                hint="Pick the properties to consider for sorting" persistent-hint
                                density="compact"></v-select>
                            <v-switch v-model="sortingAsc" class="tw-ml-2" :label="sortingAsc ? 'Ascending' : 'Descending'"
                                hide-details></v-switch>
                        </v-card>
                    </v-menu>
                </template>

                <template v-slot:prepend-inner>
                    <v-menu :close-on-content-click="false" location="end">
                        <template v-slot:activator="{ props }">
                            <v-badge :content="filters ? filters.length : 0" color="error">
                                <v-icon icon="mdi-filter" v-bind="props"></v-icon>
                            </v-badge>
                        </template>

                        <v-card min-width="300">
                            <v-select v-model="filters" :items="filtersList" chips label="Filters" multiple
                                hint="Pick attributes for filtering" persistent-hint density="compact"></v-select>
                        </v-card>
                    </v-menu>
                </template>

            </v-text-field>
        </div>

        <div class="tw-grid tw-gap-4 tw-p-2">
            <PlantCard v-for="(plant, index) in plants" :key="index" @openPlantDialog="openPlantDialog" :plantDatas="plant">
            </PlantCard>
        </div>

        <PlantDetailDialog v-if="plantDialogOpened" @close="closePlantDialog" :plantDatas="selectedPlantData">
        </PlantDetailDialog>

    </div>
</template>
  
<script>
import PlantCard from "@/components/Cards/PlantCard.vue";
import PlantDetailDialog from "@/components/Dialogs/PlantDetailDialog.vue";

export default {
    name: "ListPlants",

    components: {
        PlantCard,
        PlantDetailDialog
    },

    data: () => ({
        plantDialogOpened: false,
        selectedPlantData: undefined,
        searchQuery: '',

        filters: null,

        sorts: null,
        sortsList: ['Seeding date'],
        sortingAsc: true
    }),

    computed: {
        plants() {
            let plants = this.$store.state.seedsList

            if (this.filters) {
                this.filters.forEach(filter => {
                    switch (filter) {
                        case "lettuce":
                            plants = plants.filter((plant) => plant.cropType == 'lettuce')
                            break

                        case "radish":
                            plants = plants.filter((plant) => plant.cropType == 'radish')
                            break
                    }
                })
            }

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();

                plants = plants.filter((plant) =>
                    (plant._id.toLowerCase().includes(query)) ||
                    (plant.cropType.toLowerCase().includes(query))
                )
            }

            if (this.sorts) {
                this.sorts.forEach(sort => {
                    switch (sort) {
                        case "Seeding date":
                            plants = plants.sort((plant1, plant2) => {
                                if (!plant1.seededtime) return 1

                                if (!plant2.seededtime) return -1

                                if (this.sortingAsc) {
                                    return new Date(plant1.seededtime) - new Date(plant2.seededtime);
                                } else {
                                    return new Date(plant2.seededtime) - new Date(plant1.seededtime);
                                }
                            })
                            break
                    }
                })
            }

            return plants;
        },

        filtersList() {
            let list = ['lettuce', 'radish']

            if (this.filters) {
                if (this.filters.indexOf("lettuce") > -1) {
                    list = ['lettuce']
                }

                if (this.filters.indexOf("radish") > -1) {
                    list = ['radish']
                }
            }

            return list
        }
    },

    methods: {
        closePlantDialog() {
            this.plantDialogOpened = false;
        },
        openPlantDialog(plantDatas) {
            this.selectedPlantData = plantDatas;
            this.plantDialogOpened = true;
        }
    },
};
</script>
  