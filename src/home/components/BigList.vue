<script setup>
import {
  VVirtualScroll,
} from 'vuetify/components'
import MiniNoteCard from './MiniNoteCard.vue';
import { defineProps, defineEmits, ref, watch } from 'vue';
import AfterSelectedOptions from './AfterSelectedOptions.vue';

const emit = defineEmits(['show-card', "copy", "selection", "bulk-op"])
const {notes, loading} = defineProps(['notes', 'loading'])
const showCard = index => {
  console.debug("showing card")
  emit("show-card", index)
}

const selected = ref(new Set())
const operationInProgress = ref(false)

watch(()=>loading, ()=>{
  selected.value = new Set()
  operationInProgress.value = false
})
const select = (id) => {
  const s = new Set(selected.value)
  s.add(id)
  selected.value = s
}

const deselect = (id) => {
  const s = new Set(selected.value)
  s.delete(id)
  selected.value = s
}

const emitBulkCopy = ()=>{
  if(operationInProgress.value) {
    return;
  }
operationInProgress.value = true;  
emit("bulk-op", "copy", selected.value)
}
</script>

<template>
  <div style="width: 100%; height: 100%;">
   
    <v-virtual-scroll
      :items="notes"
      height="100vh"
      item-key="id"
    >
      <template #default="{ item, index }">
        <MiniNoteCard
          :note = item
          :selected = "selected.has(item.id)"
          @open="showCard(index)"
          @copy="emit('copy', note)"
          @select="select"
          @deselect="deselect"
        />
      </template>
    </v-virtual-scroll>
    <AfterSelectedOptions :selected-notes="selected" @copy="emitBulkCopy" :loading="operationInProgress"/>
    </div>
 
</template>
