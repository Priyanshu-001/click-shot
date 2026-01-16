<script setup>
import useCliplboard from '../composables/useClipboard'  
import { openNoteTarget } from '../composables/Utils'
import { ref, watch, nextTick } from 'vue'
import { useHotkey } from 'vuetify'
import {
  VCard,
  VCardTitle,
  VCardText,
  VDivider,
  VRow,
  VCol,
  VImg,
  VBtn,
  VCardSubtitle,
  VChip,
  VChipGroup,
  VTextarea,
} from 'vuetify/components'
import BtnText from './BtnText.vue'
import { formatDuration } from '../../utils/formatter'

const operations = {
  "EDIT_NOTE": "EDIT_NOTE",
  "TRIGGER_SAVE_EDITED_NOTE" : "TRIGGER_SAVE_EDITED_NOTE"
}
const tags = []
const props = defineProps(["index", "totalIndex", "note"])
const emit = defineEmits(["move", "close", "edit", "delete"])
const prev = ()=>{ props.index > 0 && emit("move", props.index-1)}
const next = ()=>{ props.index <= (props.totalIndex || 1) -1 && emit("move", props.index+1)}
const operationInProgress = ref(null)
const {copyNote} = useCliplboard()

const closeModal = ()=>{
  emit('close')
  console.debug("closeTriggered")
}

const triggerDelete = ()=>{
  emit('delete', props.note.id)
}

const copySuccess = ref(false)
const description = ref(props.note?.description)

const transformToRepectingLock = (fn, greenOperation) =>{
  return (...args)=> {
    if(operationInProgress.value === greenOperation) {
      fn(...args)
    }
  }
}
const startEdit = ()=>{
  operationInProgress.value = operations.EDIT_NOTE
}

const triggerSave = () =>{
  operationInProgress.value = operations.TRIGGER_SAVE_EDITED_NOTE
  emit('edit', props.note.id, description.value)
}  

const cancelEdit = ()=>{
  description.value = props.note?.description
  operationInProgress.value = null
}

const copyContent = async ()=>{
 await copyNote(props.note)
 copySuccess.value = true
setTimeout(()=>copySuccess.value = false, 1000)
}

const [safetriggerSave, safeCancelEdit] = [triggerSave, cancelEdit].map(fn=>transformToRepectingLock(fn, operations.EDIT_NOTE))
const [safePrev, safeNext, safeTriggerDelete, safeOpenNoteTarget, safeStartEdit, safeCopyNote] = [prev, next, triggerDelete, openNoteTarget, startEdit, copyContent].map(fn=>transformToRepectingLock(fn, null))  


useHotkey("arrowup", safeNext)
useHotkey("arrowright", safeNext)
useHotkey("arrowleft", safePrev)
useHotkey("arrowdown", safePrev)
useHotkey("meta+enter", safetriggerSave, {"inputs": true})
useHotkey("esc", safeCancelEdit, {"inputs": true, preventDefault:true})
useHotkey("alt+E", safeStartEdit)
useHotkey("alt+D", safeTriggerDelete)
useHotkey("alt+P", ()=>safeOpenNoteTarget(props.note))
useHotkey("meta+C", copyContent)


watch(
  () => props.note?.description,
  (newVal) => {
    description.value = newVal
  }
)
const descriptionBox = ref(null)
watch(operationInProgress, function operationChangeHandler(newVal, oldVal) {
  if(newVal === operations.EDIT_NOTE) {
    nextTick(() => {
    descriptionBox.value?.$el?.querySelector('textarea')?.focus()
    })
  }
})

</script>

<template>

    <v-card elevation="2" rounded="md">
      <v-card-title dense class="text-h6 font-weight-medium">
       {{ note?.video?.title}}
      </v-card-title>
      <VCardSubtitle>
        <v-chip color="primary" prepend-icon="mdi-clock">  
          {{ formatDuration(note?.currentTime) }}
        </v-chip>
      <v-chip-group
      selected-class="text-primary"
      multiple>

      <v-chip
        v-for="tag in tags"
        :key="tag"
        :text="tag"
      ></v-chip>
    </v-chip-group>
      </VCardSubtitle>

      <v-divider />

      <!-- Image + Actions -->
      <v-card-text>
        <v-row dense>
          
          <!-- Image column -->
          <v-col cols="9">
            <v-img
              :src="note?.dataUrl" 
            />
          </v-col>

          <!-- Actions column -->
          <v-col cols="3" class="d-flex flex-column ga-2">

            <v-btn
              variant="tonal"
              color="secondary"
              prepend-icon="mdi-play"
              :disabled="!!operationInProgress"
              @click="()=>safeOpenNoteTarget(note)"
              block
            >
            <btn-text :text="note?.timestampUrl ? `At Timestamp  ${formatDuration(note.currentTime)}` : 'Open Video'"
            key-code="alt+P"
            />
             
            </v-btn>
            <v-btn
              variant="tonal"
              color="error"
              prepend-icon="mdi-delete"
              :disabled="!!operationInProgress"
              @click="safeTriggerDelete"
              block
            >
               <btn-text text="delete"
                  key-code="alt+D"
                />
            </v-btn>

             <v-btn
              variant="tonal"
              color="warn"
              prepend-icon="mdi-pencil"
              :disabled="!!operationInProgress"
              @click="safeStartEdit"
              block
            >
             <btn-text text="EDIT"
                  key-code="alt+E"
                />
            </v-btn>

            <v-btn
              variant="text"
              :prepend-icon="copySuccess ? 'mdi-check' : 'mdi-content-copy'"
              :color="copySuccess ? 'success' : undefined"
              :disabled="!!operationInProgress"
              @click="safeCopyNote"
              block
            >
           
            <btn-text :text="copySuccess ? 'Note Copied' : 'Copy note'"
                  key-code="meta+C"
                />
            </v-btn>
          </v-col>

        </v-row>
      </v-card-text>

      <v-divider />

      <!-- Description -->
      <div class="ma-2 mb-1">
      <VTextarea v-model="description" 
      ref="descriptionBox"
      dense
      :disabled="operationInProgress!=='EDIT_NOTE'"
      label="Notes"
      icon
      rows="2"
      prepend-inner-icon="mdi-comment"
      variant="outlined"
      autofocus
      no-resize
      />
      </div>
      <v-divider/>
      <div class="d-flex">
        <template v-if="operationInProgress !== 'EDIT_NOTE'">
        <v-btn prepend-icon="mdi-chevron-left" primary :disabled="index === 0" @click="prev" class="w-50">
           Prev
        </v-btn>
        <v-btn append-icon="mdi-chevron-right" :disabled="index===totalIndex-1" @click="next" class="w-50">
            Next
        </v-btn>
        </template>
        <template v-else>
          <v-btn prepend-icon="mdi-floppy" color="primary" variant="tonal" @click="safetriggerSave" class="w-50">
            <btn-text text="Save" key-code="meta+enter" horizontal="true"/>
          </v-btn>
          <v-btn prepend-icon="mdi-cancel" color="error" variant="text" @click="safeCancelEdit" class="w-50">
             <btn-text text="Cancel" key-code="esc" horizontal="true"/>
          </v-btn>
        </template>
      </div>
    </v-card>
 
</template>
