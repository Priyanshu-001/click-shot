<script setup>
import { VBtn } from 'vuetify/components';
function openHome() {
  chrome.runtime.openOptionsPage();
}
</script>

<template>
  <v-btn color="primary">OPen Home</v-btn>  
  <button @click="openHome">Open Home</button>
</template>
