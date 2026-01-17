<script setup lang="ts">
import { VHotkey, VIcon } from 'vuetify/components';

</script>

<template>
  <div class="empty-state">
    <v-icon
      icon="mdi-note-outline"
      size="100"
      color="primary"
      class="mb-4"
    />

    <p class="title">
      You do not have any notes yet
    </p>

    <p class="subtitle">
      Capture new notes using
      <v-hotkey keys="meta+shift+L"/>  
      on any video
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 32px;
width: 100%;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 0.9rem;
  opacity: 0.7;
}

.shortcut {
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
}
</style>
