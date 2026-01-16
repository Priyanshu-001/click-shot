<script setup>
import { computed,ref, watch } from 'vue';
import { VCard, VCol, VTextField, VRow, VAutocomplete,VBtn, VContainer } from 'vuetify/components';

const props = defineProps(['idToTitle', "sites", "loading"])
  const emit = defineEmits(['filterUpdate'])
  const items = computed(()=>Object.keys(props.idToTitle).map(x=>({value: x, title: props.idToTitle[x]})))
  const videoIds = ref([])
  const selectedSites = ref([])

  watch([videoIds, selectedSites], ([newVideoIds, newSelectedSites])=>{
  emit('filterUpdate', {selectedVideoIds: newVideoIds, selectedSites: newSelectedSites})
  })
</script>

<template>
  <v-container flat class="pa-2" :loading="loading">
  
    <v-row dense>
      <!-- Search by video title -->
      <v-col cols="8">
        <v-autocomplete
          label="Search videos"
          placeholder="Type video name…"
          prepend-inner-icon="mdi-magnify"
          :items="items"
          variant="solo"
          multiple
          clearable
          chips
          closable-chips
          v-model="videoIds"
          rounded
        />
      </v-col>

      <!-- Site filter -->
      <v-col cols="4">
        <v-autocomplete
          label="Sites"
          :items="sites"
          multiple
          chips
          closable-chips
          clearable
          variant="solo"
          rounded
          prepend-inner-icon="mdi-web"
          v-model="selectedSites"

        />
      </v-col>
    </v-row>
  </v-container>
</template>
