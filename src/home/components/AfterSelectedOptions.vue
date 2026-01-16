<script setup>
import { computed } from 'vue'
import { useHotkey } from 'vuetify';
import { VSheet, VBadge, VIcon, VBtn } from 'vuetify/components'
import BtnText from './BtnText.vue';

const {selectedNotes, loading} = defineProps({
  selectedNotes: {
    type: Set,
    required: true,
  },
  loading: {
    type: Boolean
  }
})

const emit = defineEmits(['copy'])

const count = computed(() => selectedNotes.size)
const visible = computed(() => count.value > 0)

useHotkey("shift+alt+c", ()=>emit("copy"), {inputs: true} )

</script>

<template>
    <v-sheet
      v-if="visible"
      elevation="8"
      rounded="lg"
      class="floating-toolbar d-flex align-center px-4 py-2"
    >
      <v-badge
        :content="count"
        color="primary"
        class="mr-3"
      >
        <v-icon>mdi-checkbox-multiple-marked</v-icon>
      </v-badge>

      <v-btn
        style="height: auto;"
        variant="text"
        prepend-icon="mdi-content-copy"
        :loading="loading"
        @click="emit('copy')"
        class="px-3"
        
    >
        <btn-text key-code="shift+alt+c"  text="Copy"/>
      </v-btn>
    </v-sheet>
</template>

<style scoped>
.floating-toolbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  gap: 12px;
}
</style>
