<script setup>
import {
  VCard,
  VCardText,
  VCardActions,
  VImg,
  VRow,
  VCol,
  VBtn,
  VIcon,
  VCheckbox
} from 'vuetify/components'
import { defineEmits } from 'vue';
import { formatDuration } from '../../utils/formatter';
import { openNoteTarget } from '../composables/Utils';
import useClipboard from '../composables/useClipboard';
const {note, selected} = defineProps(['note', "selected"])
const {copyNote} = useClipboard()
const emit = defineEmits(["open", "select", "deselect"])
const openCard = ()=> {
  emit("open")
}

const copy = async ()=>{
  const isSucess = await copyNote(note);
  if(isSucess) {
    emit("copy")
  }
}
</script>

<style scoped>
  .primary-border {
  border: 1px solid rgb(var(--v-theme-primary));
}
</style>

<template>
  <v-card
    hover
    rounded="lg"
   :class="['pa-2 mb-4 ml-2', { 'primary-border': selected }]"
    
  >
 
    
    <v-row no-gutters>

      <v-col cols="1">
        <v-checkbox color="primary"   
        :model-value="selected"
        @update:model-value="val =>
          emit(val ? 'select' : 'deselect', note.id)
        "
        />
      </v-col>
      
      <!-- Thumbnail -->
      <v-col cols="3">
        <v-img
          @click="openCard"
          :src="note?.dataUrl"
          class="rounded"
        />
      </v-col>

      <!-- Content -->
      <v-col cols="8" class="pl-3">
        
        <!-- Title -->
        <div class="text-subtitle-2 font-weight-medium text-truncate">
         {{note.video.title}}
        </div>

        <!-- Description -->
        <div
          class="text-body-2 text-medium-emphasis"
          style="line-height:1.4; max-height:calc(1.4em * 2); overflow:hidden;"
        >
          {{ note.description }}
        </div>

        <!-- Actions -->
        <v-card-actions class="d-flex align-center ga-3 mt-1">
          <v-btn
            variant="text"
            size="small"
            color="primary"
            prepend-icon="mdi-play"
            @click="()=>openNoteTarget(note)"
          >
            {{formatDuration(note.currentTime)}}
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            color="secondary"
            prepend-icon="mdi-note-text-outline"
            @click="openCard"
          >
            Open
          </v-btn>

           <v-btn
            variant="text"
            size="small"
            color="accent"
            prepend-icon="mdi-content-copy"
            @click="copy"
          >
            copy
          </v-btn>
        </v-card-actions>

      </v-col>
    </v-row>
  </v-card>
</template>
